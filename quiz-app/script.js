const STORAGE_KEY = "quizzical-state";
const TIMER_SECONDS = 15;

const screens = {
    start: document.getElementById("start-screen"),
    loading: document.getElementById("loading-screen"),
    quiz: document.getElementById("quiz-screen"),
    result: document.getElementById("result-screen"),
    review: document.getElementById("review-screen"),
};

const els = {
    category: document.getElementById("category"),
    difficulty: document.getElementById("difficulty"),
    amount: document.getElementById("amount"),
    startForm: document.getElementById("start-form"),
    quizCategory: document.getElementById("quiz-category"),
    quizDifficulty: document.getElementById("quiz-difficulty"),
    progress: document.getElementById("progress"),
    timer: document.getElementById("timer"),
    liveScore: document.getElementById("live-score"),
    questionText: document.getElementById("question-text"),
    options: document.getElementById("options"),
    prevBtn: document.getElementById("prev-btn"),
    nextBtn: document.getElementById("next-btn"),
    finalScore: document.getElementById("final-score"),
    finalTotal: document.getElementById("final-total"),
    resultMessage: document.getElementById("result-message"),
    timeTaken: document.getElementById("time-taken"),
    statQuestions: document.getElementById("stat-questions"),
    accuracy: document.getElementById("accuracy"),
    reviewBtn: document.getElementById("review-btn"),
    newQuizBtn: document.getElementById("new-quiz-btn"),
    reviewList: document.getElementById("review-list"),
    backResultBtn: document.getElementById("back-result-btn"),
};

let state = {
    settings: { category: "", difficulty: "", amount: 10, categoryName: "Any Category" },
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],
    timeLeft: TIMER_SECONDS,
    totalSeconds: 0,
    finished: false,
};

let timerId = null;

function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.add("hidden"));
    screens[name].classList.remove("hidden");
}

function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return m + ":" + s;
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function clearState() {
    localStorage.removeItem(STORAGE_KEY);
}

async function loadCategories() {
    els.category.innerHTML = '<option value="">Any Category</option>';
    try {
        const res = await fetch("https://opentdb.com/api_category.php");
        const data = await res.json();
        data.trivia_categories.forEach((cat) => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.name;
            els.category.appendChild(opt);
        });
    } catch (e) {
        console.error("Failed to load categories", e);
    }
}

function buildApiUrl(settings) {
    let url = "https://opentdb.com/api.php?amount=" + settings.amount + "&type=multiple";
    if (settings.category) url += "&category=" + settings.category;
    if (settings.difficulty) url += "&difficulty=" + settings.difficulty;
    return url;
}

async function startQuiz(event) {
    event.preventDefault();

    const categoryName =
        els.category.options[els.category.selectedIndex]?.textContent || "Any Category";

    state = {
        settings: {
            category: els.category.value,
            difficulty: els.difficulty.value,
            amount: Number(els.amount.value),
            categoryName: categoryName,
        },
        questions: [],
        currentIndex: 0,
        score: 0,
        answers: [],
        timeLeft: TIMER_SECONDS,
        totalSeconds: 0,
        finished: false,
    };

    showScreen("loading");
    stopTimer();

    try {
        const res = await fetch(buildApiUrl(state.settings));
        const data = await res.json();

        if (!data.results || data.results.length === 0) {
            alert("No questions found. Please try different settings.");
            showScreen("start");
            return;
        }

        state.questions = data.results.map((q) => {
            const correct = decodeHTML(q.correct_answer);
            const incorrect = q.incorrect_answers.map(decodeHTML);
            return {
                question: decodeHTML(q.question),
                correct,
                options: shuffle([correct, ...incorrect]),
                category: decodeHTML(q.category),
                difficulty: q.difficulty,
            };
        });

        state.answers = new Array(state.questions.length).fill(null);
        saveState();
        renderQuestion();
        showScreen("quiz");
        startTimer();
    } catch (e) {
        console.error(e);
        alert("Failed to fetch questions. Please check your internet connection.");
        showScreen("start");
    }
}

function renderQuestion() {
    const q = state.questions[state.currentIndex];
    const answered = state.answers[state.currentIndex];

    els.quizCategory.textContent = state.settings.categoryName || q.category;
    els.quizDifficulty.textContent = state.settings.difficulty || q.difficulty || "any";
    els.progress.textContent =
        "Question " + (state.currentIndex + 1) + "/" + state.questions.length;
    els.liveScore.textContent = state.score;
    els.questionText.textContent = q.question;
    els.timer.textContent = formatTime(state.timeLeft);
    els.timer.classList.toggle("warning", state.timeLeft <= 5);

    els.options.innerHTML = "";
    q.options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "option";
        btn.textContent = opt;

        if (answered) {
            btn.disabled = true;
            if (opt === q.correct) btn.classList.add("correct");
            if (opt === answered.selected && !answered.isCorrect) btn.classList.add("wrong");
            if (opt === answered.selected) btn.classList.add("selected");
        } else {
            btn.addEventListener("click", () => selectAnswer(opt));
        }

        els.options.appendChild(btn);
    });

    els.prevBtn.disabled = state.currentIndex === 0;
    els.nextBtn.disabled = !answered;
    els.nextBtn.textContent =
        state.currentIndex === state.questions.length - 1 ? "Finish" : "Next";
}

function selectAnswer(selected) {
    if (state.answers[state.currentIndex]) return;

    const q = state.questions[state.currentIndex];
    const isCorrect = selected === q.correct;

    if (isCorrect) state.score += 1;

    state.answers[state.currentIndex] = { selected, isCorrect };
    saveState();
    stopTimer();
    renderQuestion();
}

function goNext() {
    if (!state.answers[state.currentIndex]) return;

    if (state.currentIndex === state.questions.length - 1) {
        finishQuiz();
        return;
    }

    state.currentIndex += 1;
    state.timeLeft = TIMER_SECONDS;
    saveState();
    renderQuestion();
    startTimer();
}

function goPrev() {
    if (state.currentIndex === 0) return;
    stopTimer();
    state.currentIndex -= 1;
    state.timeLeft = TIMER_SECONDS;
    saveState();
    renderQuestion();
    if (!state.answers[state.currentIndex]) startTimer();
}

function startTimer() {
    stopTimer();
    if (state.answers[state.currentIndex]) return;

    els.timer.textContent = formatTime(state.timeLeft);
    els.timer.classList.toggle("warning", state.timeLeft <= 5);

    timerId = setInterval(() => {
        state.timeLeft -= 1;
        state.totalSeconds += 1;
        els.timer.textContent = formatTime(Math.max(0, state.timeLeft));
        els.timer.classList.toggle("warning", state.timeLeft <= 5);
        saveState();

        if (state.timeLeft <= 0) {
            stopTimer();
            const q = state.questions[state.currentIndex];
            state.answers[state.currentIndex] = {
                selected: null,
                isCorrect: false,
                timedOut: true,
            };
            saveState();
            renderQuestion();
        }
    }, 1000);
}

function stopTimer() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
}

function finishQuiz() {
    stopTimer();
    state.finished = true;
    saveState();

    const total = state.questions.length;
    const score = state.score;
    const accuracy = Math.round((score / total) * 100);

    els.finalScore.textContent = score;
    els.finalTotal.textContent = total;
    els.statQuestions.textContent = score + "/" + total;
    els.accuracy.textContent = accuracy + "%";
    els.timeTaken.textContent = formatTime(state.totalSeconds);

    if (accuracy >= 80) els.resultMessage.textContent = "You're amazing!";
    else if (accuracy >= 50) els.resultMessage.textContent = "Good job! Keep practicing.";
    else els.resultMessage.textContent = "Don't give up — try again!";

    showScreen("result");
}

function renderReview() {
    els.reviewList.innerHTML = "";

    state.questions.forEach((q, i) => {
        const ans = state.answers[i];
        const item = document.createElement("div");
        item.className = "review-item";

        const title = document.createElement("h4");
        title.textContent = i + 1 + ". " + q.question;

        const your = document.createElement("p");
        if (!ans || ans.selected === null) {
            your.innerHTML = '<span class="bad">Your answer: (no answer / timed out)</span>';
        } else if (ans.isCorrect) {
            your.innerHTML =
                '<span class="ok">Your answer: ' + ans.selected + " ✓</span>";
        } else {
            your.innerHTML =
                '<span class="bad">Your answer: ' + ans.selected + " ✗</span>";
        }

        const correct = document.createElement("p");
        correct.innerHTML = '<span class="ok">Correct answer: ' + q.correct + "</span>";

        item.appendChild(title);
        item.appendChild(your);
        item.appendChild(correct);
        els.reviewList.appendChild(item);
    });
}

function newQuiz() {
    stopTimer();
    clearState();
    state = {
        settings: { category: "", difficulty: "", amount: 10, categoryName: "Any Category" },
        questions: [],
        currentIndex: 0,
        score: 0,
        answers: [],
        timeLeft: TIMER_SECONDS,
        totalSeconds: 0,
        finished: false,
    };
    showScreen("start");
}

function restoreSession() {
    const saved = loadState();
    if (!saved || !saved.questions || saved.questions.length === 0) {
        showScreen("start");
        return;
    }

    state = saved;

    if (state.finished) {
        finishQuiz();
        return;
    }

    els.category.value = state.settings.category || "";
    els.difficulty.value = state.settings.difficulty || "";
    els.amount.value = String(state.settings.amount || 10);

    renderQuestion();
    showScreen("quiz");
    if (!state.answers[state.currentIndex]) startTimer();
}

els.startForm.addEventListener("submit", startQuiz);
els.nextBtn.addEventListener("click", goNext);
els.prevBtn.addEventListener("click", goPrev);
els.reviewBtn.addEventListener("click", () => {
    renderReview();
    showScreen("review");
});
els.backResultBtn.addEventListener("click", () => showScreen("result"));
els.newQuizBtn.addEventListener("click", newQuiz);

loadCategories().then(restoreSession);

const form = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");
const successMessage = document.getElementById("successMessage");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    usernameError.textContent = "";
    passwordError.textContent = "";
    successMessage.textContent = "";
    username.classList.remove("invalid");
    password.classList.remove("invalid");

    let isValid = true;

    if (username.value.trim().length < 5) {
        usernameError.textContent = "Username must be at least 5 characters long.";
        username.classList.add("invalid");
        isValid = false;
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordPattern.test(password.value)) {
        passwordError.textContent =
            "Password must contain at least one uppercase letter, one lowercase letter, and one number.";
        password.classList.add("invalid");
        isValid = false;
    }

    if (isValid) {
        successMessage.textContent = "Form submitted successfully!";
        form.reset();
    }
});

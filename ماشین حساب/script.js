const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");

let current = "0";
let resetNext = false;

function updateDisplay() {
    display.value = current;
}

function appendValue(value) {
    const operators = ["+", "-", "*", "/"];

    if (resetNext) {
        if (operators.includes(value)) {
            resetNext = false;
        } else {
            current = "";
            resetNext = false;
        }
    }

    if (current === "0" && !operators.includes(value) && value !== ".") {
        current = value;
    } else if (operators.includes(value) && operators.includes(current.slice(-1))) {
        current = current.slice(0, -1) + value;
    } else {
        current += value;
    }

    updateDisplay();
}

function clearAll() {
    current = "0";
    resetNext = false;
    updateDisplay();
}

function calculate() {
    try {
        const result = Function('"use strict"; return (' + current + ")")();
        if (result === undefined || result === Infinity || Number.isNaN(result)) {
            current = "Error";
        } else {
            current = String(Math.round(result * 1e10) / 1e10);
        }
    } catch (e) {
        current = "Error";
    }
    resetNext = true;
    updateDisplay();
}

buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
        const action = btn.dataset.action;
        const value = btn.dataset.value;

        if (action === "clear") {
            clearAll();
        } else if (action === "equals") {
            calculate();
        } else if (value !== undefined) {
            if (current === "Error") {
                current = "0";
            }
            appendValue(value);
        }
    });
});

updateDisplay();

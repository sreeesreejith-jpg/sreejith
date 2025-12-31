let expression = "";
const displayExpr = document.getElementById("expression");
const displayVal = document.getElementById("current-val");

function append(char) {
    // If screen shows an error, clear it before typing
    if (displayVal.innerText === "Error" || displayVal.innerText === "NaN") {
        clearDisplay();
    }

    // Replace display operators with math symbols if needed
    if (expression === "" && ['+', '×', '÷', '%'].includes(char)) return;

    expression += char;
    updateDisplay();
}

function backspace() {
    if (expression.length > 0) {
        expression = expression.slice(0, -1);
    }
    updateDisplay();
}

function clearDisplay() {
    expression = "";
    displayVal.innerText = "0";
    updateDisplay();
}

function updateDisplay() {
    displayExpr.innerText = expression || "";
    // Real-time result preview (optional, but good for UX)
    if (expression) {
        try {
            const preview = evaluate(expression);
            if (!isNaN(preview) && isFinite(preview)) {
                displayVal.innerText = preview;
                displayVal.style.opacity = "0.5"; // Show as preview
            }
        } catch (e) {
            // Keep current result if formula is incomplete (like open bracket)
        }
    } else {
        displayVal.innerText = "0";
        displayVal.style.opacity = "1";
    }
}

function calculate() {
    try {
        const result = evaluate(expression);
        displayVal.innerText = result;
        displayVal.style.opacity = "1";
        expression = result.toString();
        displayExpr.innerText = "";
    } catch (e) {
        displayVal.innerText = "Error";
        displayVal.style.opacity = "1";
    }
}

function evaluate(expr) {
    if (!expr) return 0;

    // 1. Pre-process percentage smart logic
    // We look for patterns like: number + percentage%
    // Standard Mobile Calc behavior:
    // "100 + 10%" -> "100 + (100 * 10 / 100)"
    // "100 * 10%" -> "100 * (10 / 100)"

    let processed = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/");

    // Handle percentage cases carefully
    // Regex matches: (previous number) (operator) (current number)%
    // This is a simplified regex for basic PWA calculator needs
    processed = processed.replace(/(\d+\.?\d*)\s*([\+\-])\s*(\d+\.?\d*)%/g, (match, p1, op, p2) => {
        const val = parseFloat(p1);
        const perc = parseFloat(p2);
        const calculatedPerc = val * (perc / 100);
        return `${val}${op}${calculatedPerc}`;
    });

    // Handle simple percentage: 50% -> (50/100)
    processed = processed.replace(/(\d+\.?\d*)%/g, "($1/100)");

    // 2. Perform math
    // Function constructor is safer than eval for simple strings
    return Function(`"use strict"; return (${processed})`)();
}

// Keyboard Support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') append(e.key);
    if (e.key === '.') append('.');
    if (e.key === '(') append('(');
    if (e.key === ')') append(')');
    if (e.key === '+') append('+');
    if (e.key === '-') append('-');
    if (e.key === '*') append('×');
    if (e.key === '/') append('÷');
    if (e.key === '%') append('%');
    if (e.key === '=' || e.key === 'Enter') calculate();
    if (e.key === 'Backspace') backspace();
    if (e.key === 'Escape') clearDisplay();
});

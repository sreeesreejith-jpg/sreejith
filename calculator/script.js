let expression = "";
let cursorPos = 0;
const displayExpr = document.getElementById("expression");
const displayVal = document.getElementById("current-val");

// Handle clicking on the expression display to move cursor
displayExpr.addEventListener('click', (e) => {
    if (e.target === displayExpr) {
        // If clicking the container background, put cursor at the end
        cursorPos = expression.length;
        updateDisplay();
    }
});

function append(char) {
    if (displayVal.innerText === "Error" || displayVal.innerText === "NaN") {
        clearDisplay();
    }

    if (expression === "" && ['+', '×', '÷', '%'].includes(char)) return;

    // Insert character at cursor position
    expression = expression.slice(0, cursorPos) + char + expression.slice(cursorPos);
    cursorPos++;
    updateDisplay();
}

function backspace() {
    if (cursorPos > 0) {
        // Remove character before cursor
        expression = expression.slice(0, cursorPos - 1) + expression.slice(cursorPos);
        cursorPos--;
    }
    updateDisplay();
}

function clearDisplay() {
    expression = "";
    cursorPos = 0;
    displayVal.innerText = "0";
    updateDisplay();
}

function updateDisplay() {
    // Clear and rebuild display with interactive characters and cursor
    displayExpr.innerHTML = "";

    // Split expression into characters to make each clickable
    const chars = expression ? expression.split('') : [];

    // Create elements for each character and the cursor
    for (let i = 0; i <= chars.length; i++) {
        // Render cursor at its current position
        if (i === cursorPos) {
            const cursor = document.createElement("span");
            cursor.className = "cursor";
            displayExpr.appendChild(cursor);
        }

        // Render character
        if (i < chars.length) {
            const charSpan = document.createElement("span");
            charSpan.innerText = chars[i];
            const index = i;
            charSpan.onclick = (e) => {
                e.stopPropagation();
                cursorPos = index; // Click character to place cursor BEFORE it
                updateDisplay();
            };
            displayExpr.appendChild(charSpan);
        }
    }

    // Add a clickable area at the end to place cursor after the last character
    const tail = document.createElement("span");
    tail.style.paddingLeft = "8px";
    tail.style.cursor = "text";
    tail.style.minHeight = "1rem";
    tail.onclick = (e) => {
        e.stopPropagation();
        cursorPos = chars.length;
        updateDisplay();
    };
    displayExpr.appendChild(tail);

    // Real-time result preview
    if (expression) {
        try {
            const preview = evaluate(expression);
            if (!isNaN(preview) && isFinite(preview)) {
                displayVal.innerText = preview;
                displayVal.style.opacity = "0.5";
            }
        } catch (e) {
            // Formula incomplete
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
        cursorPos = expression.length;
        displayExpr.innerHTML = "";
        // Show result in expression line temporarily or clear it
        updateDisplay();
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
    if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
    }
    if (e.key === 'Delete') {
        if (cursorPos < expression.length) {
            expression = expression.slice(0, cursorPos) + expression.slice(cursorPos + 1);
            updateDisplay();
        }
    }
    if (e.key === 'ArrowLeft') {
        if (cursorPos > 0) cursorPos--;
        updateDisplay();
    }
    if (e.key === 'ArrowRight') {
        if (cursorPos < expression.length) cursorPos++;
        updateDisplay();
    }
    if (e.key === 'Escape') clearDisplay();
});

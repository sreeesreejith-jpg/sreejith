let currentOperand = '0';
let previousOperand = '';
let operation = undefined;

const currentDisplay = document.getElementById('current-op');
const previousDisplay = document.getElementById('previous-op');

function clearDisplay() {
    currentOperand = '0';
    previousOperand = '';
    operation = undefined;
    updateDisplay();
}

function deleteLast() {
    if (currentOperand === '0') return;
    if (currentOperand.length === 1) {
        currentOperand = '0';
    } else {
        currentOperand = currentOperand.slice(0, -1);
    }
    updateDisplay();
}

function appendNumber(number) {
    if (number === '.' && currentOperand.includes('.')) return;
    if (currentOperand === '0' && number !== '.') {
        currentOperand = number;
    } else {
        currentOperand = currentOperand.toString() + number.toString();
    }
    updateDisplay();
}

function appendOperator(op) {
    if (currentOperand === '') return;
    if (previousOperand !== '') {
        calculate();
    }
    operation = op;
    previousOperand = currentOperand;
    currentOperand = '';
    updateDisplay();
}

function applyPercentage() {
    if (currentOperand === '0' || currentOperand === '') return;

    const current = parseFloat(currentOperand);
    const prev = parseFloat(previousOperand);

    if (!isNaN(prev) && (operation === '+' || operation === '-')) {
        // Smart Percentage: 100 + 10% becomes 100 + 10
        currentOperand = (prev * (current / 100)).toString();
    } else {
        // Regular percentage: 100 * 10% becomes 100 * 0.1
        currentOperand = (current / 100).toString();
    }
    updateDisplay();
}

function calculate() {
    let computation;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    if (isNaN(prev) || isNaN(current)) return;

    switch (operation) {
        case '+':
            computation = prev + current;
            break;
        case '-':
            computation = prev - current;
            break;
        case '*':
            computation = prev * current;
            break;
        case '/':
            computation = prev / current;
            break;
        default:
            return;
    }

    currentOperand = computation.toString();
    operation = undefined;
    previousOperand = '';
    updateDisplay();
}

function getDisplayOperator(op) {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
}

function updateDisplay() {
    currentDisplay.innerText = currentOperand;
    if (operation != null) {
        previousDisplay.innerText = `${previousOperand} ${getDisplayOperator(operation)}`;
    } else {
        previousDisplay.innerText = '';
    }
}

// Keyboard Support
document.addEventListener('keydown', (e) => {
    if (e.key >= 0 && e.key <= 9) appendNumber(e.key);
    if (e.key === '.') appendNumber('.');
    if (e.key === '=' || e.key === 'Enter') calculate();
    if (e.key === 'Backspace') deleteLast();
    if (e.key === 'Escape') clearDisplay();
    if (['+', '-', '*', '/'].includes(e.key)) appendOperator(e.key);
    if (e.key === '%') applyPercentage();
});

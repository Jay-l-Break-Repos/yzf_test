// ===== Calculator Logic =====

(function () {
    'use strict';

    // --- State ---
    let currentInput = '0';   // What the user is currently typing
    let previousInput = '';    // Left operand stored after pressing an operator
    let operator = '';         // Pending operator (+, -, *, /)
    let resetNext = false;    // If true, next digit press replaces the display

    // --- DOM ---
    const display = document.getElementById('display');

    // --- Helpers ---

    /**
     * Update the display element with the given value.
     */
    function updateDisplay(value) {
        display.value = value;
    }

    /**
     * Perform a binary arithmetic operation.
     */
    function calculate(left, op, right) {
        const a = parseFloat(left);
        const b = parseFloat(right);
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return b !== 0 ? a / b : 'Error';
            default:  return b;
        }
    }

    /**
     * Format a number for display: remove unnecessary trailing zeros,
     * but keep reasonable precision.
     */
    function formatResult(value) {
        if (typeof value === 'string') return value; // e.g. "Error"
        if (Number.isNaN(value) || !Number.isFinite(value)) return 'Error';
        // Use toPrecision to avoid floating-point noise, then strip trailing zeros
        const str = parseFloat(value.toPrecision(12)).toString();
        return str;
    }

    // --- Event Handlers ---

    /**
     * Handle digit / decimal point input.
     */
    function handleDigit(value) {
        if (resetNext) {
            currentInput = value === '.' ? '0.' : value;
            resetNext = false;
        } else {
            if (value === '.') {
                // Prevent multiple decimal points
                if (currentInput.includes('.')) return;
                currentInput += '.';
            } else {
                // Replace leading zero (but keep "0.")
                currentInput = currentInput === '0' ? value : currentInput + value;
            }
        }
        updateDisplay(currentInput);
    }

    /**
     * Handle operator press (+, -, *, /).
     */
    function handleOperator(op) {
        if (operator && !resetNext) {
            // Chain: evaluate the pending operation first
            const result = calculate(previousInput, operator, currentInput);
            const formatted = formatResult(result);
            previousInput = formatted;
            updateDisplay(formatted);
        } else {
            previousInput = currentInput;
        }
        operator = op;
        resetNext = true;
    }

    /**
     * Handle equals press.
     */
    function handleEquals() {
        if (!operator) return;
        const result = calculate(previousInput, operator, currentInput);
        const formatted = formatResult(result);
        updateDisplay(formatted);
        currentInput = formatted;
        previousInput = '';
        operator = '';
        resetNext = true;
    }

    /**
     * Handle Clear press — reset everything.
     */
    function handleClear() {
        currentInput = '0';
        previousInput = '';
        operator = '';
        resetNext = false;
        updateDisplay('0');
    }

    /**
     * Handle square root press.
     * Takes the square root of the currently displayed value.
     * Supports consecutive √ presses (e.g. √√81 = √9 = 3).
     */
    function handleSqrt() {
        const value = parseFloat(display.value);
        if (isNaN(value) || value < 0) {
            updateDisplay('Error');
            currentInput = 'Error';
            resetNext = true;
            return;
        }
        const result = Math.sqrt(value);
        const formatted = formatResult(result);
        updateDisplay(formatted);
        currentInput = formatted;
        // Allow consecutive √ operations — do NOT set resetNext to true
        // so the next √ reads the current display value.
        // But if a digit is pressed next, it should start fresh.
        resetNext = true;
    }

    // --- Wire up all buttons via event delegation ---

    document.querySelector('.buttons').addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        if (btn.dataset.value !== undefined) {
            handleDigit(btn.dataset.value);
        } else if (btn.dataset.operator) {
            handleOperator(btn.dataset.operator);
        } else if (btn.dataset.action === 'equals') {
            handleEquals();
        } else if (btn.dataset.action === 'clear') {
            handleClear();
        } else if (btn.dataset.action === 'sqrt') {
            handleSqrt();
        }
    });

})();

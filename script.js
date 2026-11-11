/**
 * ==============================================================================
 * MODERN CALCULATOR LOGIC (script.js)
 * ==============================================================================
 * Designed for beginners: Clean separation of state, math logic, and DOM updates.
 */

// ------------------------------------------------------------------------------
// 1. DOM REFERENCES (Accessing HTML elements so we can read and modify them)
// ------------------------------------------------------------------------------
const previousOperandText = document.getElementById("previousOperand");
const currentOperandText = document.getElementById("currentOperand");
const keypad = document.querySelector(".keypad");

// ------------------------------------------------------------------------------
// 2. STATE VARIABLES (The calculator's memory)
// ------------------------------------------------------------------------------
// currentInput: what the user is currently typing
let currentInput = "0";

// previousInput: the first number stored before an operator was chosen
let previousInput = "";

// operation: the active math operator (+, −, ×, ÷)
let operation = null;

// shouldResetScreen: flag to clear display when typing a new number after an operator or '='
let shouldResetScreen = false;

// ------------------------------------------------------------------------------
// 3. CORE LOGIC FUNCTIONS
// ------------------------------------------------------------------------------

/**
 * Appends a number digit (0-9) to the current input string.
 * @param {string} number - The digit pressed
 */
function appendNumber(number) {
  // If the user just pressed an operator or equals, start fresh with the new number
  if (shouldResetScreen) {
    currentInput = "";
    shouldResetScreen = false;
  }

  // Prevent multiple leading zeros (e.g. "000")
  if (currentInput === "0" && number !== ".") {
    currentInput = number;
  } else {
    currentInput += number;
  }

  updateDisplay();
}

/**
 * Appends a decimal dot '.' ensuring only one dot can exist per number.
 */
function appendDecimal() {
  if (shouldResetScreen) {
    currentInput = "0";
    shouldResetScreen = false;
  }

  // Prevent numbers like "5.2.3"
  if (!currentInput.includes(".")) {
    currentInput += ".";
    updateDisplay();
  }
}

/**
 * Handles operator selection (+, −, ×, ÷).
 * @param {string} op - The operator symbol
 */
function chooseOperation(op) {
  // If an operation is already queued and the user types another number,
  // compute the intermediate result first (e.g., 5 + 3 + 2 -> 8 + 2)
  if (operation !== null && !shouldResetScreen) {
    compute();
  }

  operation = op;
  previousInput = currentInput;
  shouldResetScreen = true; // Next digit input will clear the screen for the second number
  updateDisplay();
}

/**
 * Performs the arithmetic calculation based on stored values and operator.
 */
function compute() {
  // We need both numbers and an operator to calculate
  if (operation === null || shouldResetScreen) return;

  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);

  // If conversion failed, do nothing
  if (isNaN(prev) || isNaN(current)) return;

  let result;

  // Execute the matching math operation
  switch (operation) {
    case "+":
      result = prev + current;
      break;
    case "−":
      result = prev - current;
      break;
    case "×":
      result = prev * current;
      break;
    case "÷":
      // Edge Case: Division by zero
      if (current === 0) {
        currentInput = "Error";
        previousInput = "";
        operation = null;
        shouldResetScreen = true;
        updateDisplay();
        return;
      }
      result = prev / current;
      break;
    default:
      return;
  }

  // Fix floating-point imprecision (e.g., 0.1 + 0.2 = 0.30000000000000004 -> 0.3)
  result = Math.round((result + Number.EPSILON) * 1e12) / 1e12;

  currentInput = result.toString();
  previousInput = "";
  operation = null;
  shouldResetScreen = true;
  updateDisplay();
}

/**
 * Clears all state (All Clear / AC button).
 */
function clearAll() {
  currentInput = "0";
  previousInput = "";
  operation = null;
  shouldResetScreen = false;
  updateDisplay();
}

/**
 * Toggles positive/negative sign (± button).
 */
function toggleSign() {
  if (currentInput === "0" || currentInput === "Error") return;
  currentInput = (parseFloat(currentInput) * -1).toString();
  updateDisplay();
}

/**
 * Converts current number to percentage (% button).
 */
function computePercent() {
  if (currentInput === "0" || currentInput === "Error") return;
  currentInput = (parseFloat(currentInput) / 100).toString();
  updateDisplay();
}

// ------------------------------------------------------------------------------
// 4. DISPLAY SYNC (Reflects JavaScript state onto the HTML screen)
// ------------------------------------------------------------------------------
function updateDisplay() {
  // Update main display
  currentOperandText.innerText = formatNumber(currentInput);

  // Update top helper line (e.g., "12 +")
  if (operation != null) {
    previousOperandText.innerText = `${formatNumber(previousInput)} ${operation}`;
  } else {
    previousOperandText.innerText = "";
  }
}

/**
 * Helper: Formats numbers with readable comma separators (e.g., 10000 -> 10,000)
 * while preserving decimals being actively typed.
 */
function formatNumber(numStr) {
  if (numStr === "Error" || numStr === "") return numStr;

  const [integerPart, decimalPart] = numStr.split(".");
  const parsedInt = parseFloat(integerPart);

  let formattedInt = isNaN(parsedInt) ? "0" : parsedInt.toLocaleString("en-US");

  // Keep the negative sign if user typed "-0"
  if (integerPart === "-0") formattedInt = "-0";

  if (decimalPart !== undefined) {
    return `${formattedInt}.${decimalPart}`;
  }
  return formattedInt;
}

// ------------------------------------------------------------------------------
// 5. EVENT LISTENERS (Connecting UI interactions to JavaScript functions)
// ------------------------------------------------------------------------------

/**
 * Event Delegation: Instead of adding 19 separate click listeners,
 * we listen to the parent container (`keypad`) and check which button was clicked.
 */
keypad.addEventListener("click", (event) => {
  const target = event.target;

  // Ensure user clicked a button
  if (!target.matches("button")) return;

  // Number buttons (0 - 9)
  if (target.dataset.number) {
    appendNumber(target.dataset.number);
    return;
  }

  // Operator buttons (+, −, ×, ÷)
  if (target.dataset.operator) {
    chooseOperation(target.dataset.operator);
    return;
  }

  // Special Action buttons (AC, ±, %, ., =)
  const action = target.dataset.action;
  switch (action) {
    case "clear":
      clearAll();
      break;
    case "toggle-sign":
      toggleSign();
      break;
    case "percent":
      computePercent();
      break;
    case "decimal":
      appendDecimal();
      break;
    case "calculate":
      compute();
      break;
  }
});

// ------------------------------------------------------------------------------
// 6. BONUS: KEYBOARD SUPPORT
// ------------------------------------------------------------------------------
// Allows users to type using their computer's physical keyboard or numpad
window.addEventListener("keydown", (event) => {
  if (event.key >= "0" && event.key <= "9") appendNumber(event.key);
  if (event.key === ".") appendDecimal();
  if (event.key === "=" || event.key === "Enter") {
    event.preventDefault(); // Prevents accidental button re-trigger
    compute();
  }
  if (event.key === "Backspace") {
    // Treat Backspace as delete single digit or clear
    if (currentInput.length > 1 && !shouldResetScreen) {
      currentInput = currentInput.slice(0, -1);
    } else {
      currentInput = "0";
    }
    updateDisplay();
  }
  if (event.key === "Escape") clearAll();
  if (event.key === "+") chooseOperation("+");
  if (event.key === "-") chooseOperation("−");
  if (event.key === "*") chooseOperation("×");
  if (event.key === "/") {
    event.preventDefault();
    chooseOperation("÷");
  }
});


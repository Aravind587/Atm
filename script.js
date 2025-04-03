// Mock account data
const account = {
    cardNumber: "1234567890123456",
    pin: "1234",
    balance: 1000,
    transactions: [],
    phoneNumber: "1234567890" // Mock phone number
};

// Mock exchange rates (as of April 2025, approximate values)
const exchangeRates = {
    USD: 1.0,    // Base currency
    EUR: 0.95,   // 1 USD = 0.95 EUR
    GBP: 0.80,   // 1 USD = 0.80 GBP
    JPY: 150.0,  // 1 USD = 150 JPY
    INR: 84.0    // 1 USD = 84 INR
};

let currentInputField = null;
let selectedCurrency = 'USD'; // Default currency

// Screen navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen > div').forEach(div => div.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    updateFunctionButtons(screenId);
}

// Update function buttons based on the current screen
function updateFunctionButtons(screenId) {
    const leftButtons = document.querySelectorAll('.left .func-btn');
    const rightButtons = document.querySelectorAll('.right .func-btn');
    const screen = document.getElementById('screen');

    // Reset all buttons
    leftButtons.forEach(btn => {
        btn.onclick = null;
        btn.classList.remove('active');
    });
    rightButtons.forEach(btn => {
        btn.onclick = null;
        btn.classList.remove('active');
    });

    if (screenId === 'main-menu' || screenId === 'balance-screen' || screenId === 'withdraw-screen' || screenId === 'deposit-screen' || screenId === 'fast-cash-screen' || screenId === 'transfer-screen' || screenId === 'pin-change-screen' || screenId === 'mini-statement-screen' || screenId === 'others-screen' || screenId === 'bill-payment-screen' || screenId === 'mobile-recharge-screen' || screenId === 'cheque-book-screen' || screenId === 'cardless-withdrawal-screen' || screenId === 'exchange-phone-screen') {
        // Activate all buttons and show text
        leftButtons.forEach(btn => btn.classList.add('active'));
        rightButtons.forEach(btn => btn.classList.add('active'));

        // Expand the screen
        screen.classList.add('expanded');

        // Set button actions only in the main menu
        if (screenId === 'main-menu') {
            // Left buttons
            leftButtons[0].onclick = () => showDeposit();      // Deposit
            leftButtons[1].onclick = () => showTransfer();    // Transfer
            leftButtons[2].onclick = () => showPinChange();   // PIN Change
            leftButtons[3].onclick = () => showOthers();      // Others

            // Right buttons
            rightButtons[0].onclick = () => showFastCash();   // Fast Cash
            rightButtons[1].onclick = () => showWithdraw();   // Cash Withdrawal
            rightButtons[2].onclick = () => showBalance();    // Balance Enquiry
            rightButtons[3].onclick = () => showMiniStatement(); // Mini Statement
        }
    } else {
        // Deactivate buttons and hide text
        leftButtons.forEach(btn => btn.classList.remove('active'));
        rightButtons.forEach(btn => btn.classList.remove('active'));

        // Shrink the screen
        screen.classList.remove('expanded');
    }
}

// Currency selection
function selectCurrency(currency) {
    selectedCurrency = currency;
    const rateDisplay = document.getElementById('currency-rate-display');
    const rate = exchangeRates[currency];
    rateDisplay.textContent = `Selected Currency: ${currency} (1 USD = ${rate} ${currency})`;

    // Update button styles
    document.querySelectorAll('.currency-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent === currency) {
            btn.classList.add('selected');
        }
    });

    // Update preset buttons to reflect the selected currency
    updatePresetButtons();
}

// Update preset buttons based on selected currency
function updatePresetButtons() {
    const presetButtons = document.querySelectorAll('.withdraw-screen .preset-btn');
    const baseAmounts = [50, 100, 150]; // Base amounts in the selected currency
    presetButtons.forEach((btn, index) => {
        const amount = baseAmounts[index];
        btn.textContent = `${amount} ${selectedCurrency}`;
        btn.onclick = () => setWithdrawAmount(amount);
    });
}

// Card number submission
function submitCardNumber() {
    const cardNumber = document.getElementById('card-number').value;
    if (cardNumber === account.cardNumber) {
        showScreen('pin-screen');
        currentInputField = document.getElementById('pin');
    } else {
        alert('Invalid card number!');
    }
}

// PIN submission
function submitPin() {
    const pin = document.getElementById('pin').value;
    if (pin === account.pin) {
        showScreen('main-menu');
        currentInputField = null;
    } else {
        alert('Invalid PIN!');
    }
}

// Main menu functions
function showBalance() {
    document.getElementById('balance-display').textContent = `$${account.balance.toFixed(2)} USD`;
    showScreen('balance-screen');
}

function showWithdraw() {
    document.getElementById('withdraw-amount').value = '';
    selectedCurrency = 'USD'; // Reset to default
    selectCurrency('USD'); // Reset currency selection
    showScreen('withdraw-screen');
    currentInputField = document.getElementById('withdraw-amount');
}

function showFastCash() {
    showScreen('fast-cash-screen');
    currentInputField = null;
}

function showDeposit() {
    document.getElementById('deposit-amount').value = '';
    showScreen('deposit-screen');
    currentInputField = document.getElementById('deposit-amount');
}

function showTransfer() {
    document.getElementById('transfer-account').value = '';
    document.getElementById('transfer-amount').value = '';
    showScreen('transfer-screen');
    currentInputField = document.getElementById('transfer-account');
}

function showPinChange() {
    document.getElementById('old-pin').value = '';
    document.getElementById('new-pin').value = '';
    showScreen('pin-change-screen');
    currentInputField = document.getElementById('old-pin');
}

function showMiniStatement() {
    const statementDiv = document.getElementById('mini-statement-display');
    if (account.transactions.length === 0) {
        statementDiv.innerHTML = '<p>No transactions available.</p>';
    } else {
        statementDiv.innerHTML = account.transactions.slice(-5).map(t => `<p>${t}</p>`).join('');
    }
    showScreen('mini-statement-screen');
}

function showOthers() {
    showScreen('others-screen');
    currentInputField = null;
}

function backToMenu() {
    showScreen('main-menu');
    currentInputField = null;
}

function logout() {
    document.getElementById('card-number').value = '';
    document.getElementById('pin').value = '';
    showScreen('welcome-screen');
    currentInputField = document.getElementById('card-number');
}

// Transaction processing
function processWithdraw() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount!');
        return;
    }

    // Interpret the amount in the selected currency and convert to USD
    const amountInUSD = amount / exchangeRates[selectedCurrency];
    if (amountInUSD > account.balance) {
        alert('Insufficient funds!');
        return;
    }

    // Deduct from balance in USD
    account.balance -= amountInUSD;
    account.transactions.push(`Withdrew ${amount.toFixed(2)} ${selectedCurrency} (${amountInUSD.toFixed(2)} USD) on ${new Date().toLocaleString()}`);
    alert(`Successfully withdrew:\n${amountInUSD.toFixed(2)} USD\n${amount.toFixed(2)} ${selectedCurrency}`);
    backToMenu();
}

function processFastCash(amount) {
    if (amount > account.balance) {
        alert('Insufficient funds!');
    } else {
        account.balance -= amount;
        account.transactions.push(`Fast Cash: Withdrew $${amount.toFixed(2)} on ${new Date().toLocaleString()}`);
        alert(`Successfully withdrew $${amount.toFixed(2)}`);
        backToMenu();
    }
}

function processDeposit() {
    const amount = parseFloat(document.getElementById('deposit-amount').value);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount!');
    } else {
        account.balance += amount;
        account.transactions.push(`Deposited $${amount.toFixed(2)} on ${new Date().toLocaleString()}`);
        alert(`Successfully deposited $${amount.toFixed(2)}`);
        backToMenu();
    }
}

function processTransfer() {
    const accountNumber = document.getElementById('transfer-account').value;
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    if (!accountNumber || accountNumber.length < 8) {
        alert('Please enter a valid account number!');
    } else if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount!');
    } else if (amount > account.balance) {
        alert('Insufficient funds!');
    } else {
        account.balance -= amount;
        account.transactions.push(`Transferred $${amount.toFixed(2)} to ${accountNumber} on ${new Date().toLocaleString()}`);
        alert(`Successfully transferred $${amount.toFixed(2)} to account ${accountNumber}`);
        backToMenu();
    }
}

function processPinChange() {
    const oldPin = document.getElementById('old-pin').value;
    const newPin = document.getElementById('new-pin').value;
    if (oldPin !== account.pin) {
        alert('Incorrect old PIN!');
    } else if (newPin.length !== 4) {
        alert('New PIN must be 4 digits!');
    } else {
        account.pin = newPin;
        account.transactions.push(`PIN changed on ${new Date().toLocaleString()}`);
        alert('PIN successfully changed!');
        backToMenu();
    }
}

// Withdrawal with preset amounts
function setWithdrawAmount(amount) {
    document.getElementById('withdraw-amount').value = amount;
}

// New "Others" functions
function showBillPayment() {
    document.getElementById('bill-id').value = '';
    document.getElementById('bill-amount').value = '';
    showScreen('bill-payment-screen');
    currentInputField = document.getElementById('bill-id');
}

function processBillPayment() {
    const billId = document.getElementById('bill-id').value;
    const amount = parseFloat(document.getElementById('bill-amount').value);
    if (!billId) {
        alert('Please enter a valid bill ID!');
    } else if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount!');
    } else if (amount > account.balance) {
        alert('Insufficient funds!');
    } else {
        account.balance -= amount;
        account.transactions.push(`Bill Payment of $${amount.toFixed(2)} for Bill ID ${billId} on ${new Date().toLocaleString()}`);
        alert(`Successfully paid $${amount.toFixed(2)} for bill ID ${billId}`);
        showOthers();
    }
}

function showMobileRecharge() {
    document.getElementById('mobile-number').value = '';
    document.getElementById('recharge-amount').value = '';
    showScreen('mobile-recharge-screen');
    currentInputField = document.getElementById('mobile-number');
}

function processMobileRecharge() {
    const mobileNumber = document.getElementById('mobile-number').value;
    const amount = parseFloat(document.getElementById('recharge-amount').value);
    if (!mobileNumber || mobileNumber.length !== 10) {
        alert('Please enter a valid 10-digit mobile number!');
    } else if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount!');
    } else if (amount > account.balance) {
        alert('Insufficient funds!');
    } else {
        account.balance -= amount;
        account.transactions.push(`Mobile Recharge of $${amount.toFixed(2)} for ${mobileNumber} on ${new Date().toLocaleString()}`);
        alert(`Successfully recharged $${amount.toFixed(2)} for mobile number ${mobileNumber}`);
        showOthers();
    }
}

function showChequeBookRequest() {
    showScreen('cheque-book-screen');
    currentInputField = null;
}

function processChequeBookRequest() {
    account.transactions.push(`Cheque Book requested on ${new Date().toLocaleString()}`);
    alert('Cheque book request successful! It will be mailed to your registered address.');
    showOthers();
}

function showCardlessWithdrawal() {
    document.getElementById('cardless-code').value = '';
    document.getElementById('cardless-amount').value = '';
    showScreen('cardless-withdrawal-screen');
    currentInputField = document.getElementById('cardless-code');
}

function processCardlessWithdrawal() {
    const code = document.getElementById('cardless-code').value;
    const amount = parseFloat(document.getElementById('cardless-amount').value);
    const mockValidCode = "XYZ123"; // Mock code for simulation
    if (!code || code !== mockValidCode) {
        alert('Invalid withdrawal code!');
    } else if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount!');
    } else if (amount > account.balance) {
        alert('Insufficient funds!');
    } else {
        account.balance -= amount;
        account.transactions.push(`Cardless Withdrawal of $${amount.toFixed(2)} on ${new Date().toLocaleString()}`);
        alert(`Successfully withdrew $${amount.toFixed(2)} using cardless withdrawal`);
        showOthers();
    }
}

function showExchangePhoneNumber() {
    document.getElementById('current-phone').value = account.phoneNumber;
    document.getElementById('new-phone').value = '';
    showScreen('exchange-phone-screen');
    currentInputField = document.getElementById('new-phone');
}

function processExchangePhoneNumber() {
    const currentPhone = document.getElementById('current-phone').value;
    const newPhone = document.getElementById('new-phone').value;
    if (currentPhone !== account.phoneNumber) {
        alert('Current phone number does not match!');
    } else if (!newPhone || newPhone.length !== 10) {
        alert('Please enter a valid 10-digit new phone number!');
    } else {
        account.phoneNumber = newPhone;
        account.transactions.push(`Phone number changed to ${newPhone} on ${new Date().toLocaleString()}`);
        alert('Phone number successfully changed!');
        showOthers();
    }
}

// Initialize
currentInputField = document.getElementById('card-number');
showScreen('welcome-screen');
"use strict";

// Data
const account1 = {
  owner: "Suchir Srivastava",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const displayMovements = function (movements, sort = false) {
  // first empty the existing movements:
  containerMovements.innerHTML = "";

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  // .slice() created a shallow copy because we didn't want to actually mutate the original array with .sort() -- good use case of chaining using .slice()

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal"; // check for deposit or withdrawal

    const html = `
      <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type} </div>
      <div class="movements__value">${mov}</div>
    </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// receives movements as input and calculates the balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance} €`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0) // checks for positive movement
    .reduce((acc, mov) => acc + mov, 0); // sums all positive movements
  labelSumIn.textContent = `${incomes}€`; // displays movements IN at bottom of page

  const out = acc.movements
    .filter((mov) => mov < 0) // checks for negative movement
    .reduce((acc, mov) => acc + Math.abs(mov), 0); // sums magnitude of all negative movements
  labelSumOut.textContent = `${out}€`; // displays movements IN at bottom of page

  // we get 1.2% interest per deposit
  // interest will only be counted if it is 1 Euro or greater
  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((interest) => interest >= 1)
    .reduce((acc, dep) => acc + dep);
  labelSumInterest.textContent = `${interest}€`;
};

// creating the username property in each of the accounts
const createUsernames = function (accounts) {
  // receiving an array of accounts as parameter
  accounts.forEach(function (acc) {
    acc.username = acc.owner // "Steven Thomas Williams"
      .toLowerCase() // "steven thomas williams"
      .split(" ") // ["steven", "thomas", "williams"]
      .map((name) => name[0]) // ["s", "t", "w"]
      .join(""); // stw
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display Movements
  displayMovements(acc.movements);
  // Display Balance
  calcDisplayBalance(acc);
  // Display Summary
  calcDisplaySummary(acc);
};

// EVENT HANDLERS:
let currentAccount;

// login feature
btnLogin.addEventListener("click", function (event) {
  // prevent form from submitting:
  event.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // used optional chaining: will only run if the currentAccount exists, which is useful because the input username can yield an undefined currentAccount
    // Display UI and Welcome Message:
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear fields:
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur(); // makes it so that cursor is no longer focused on login pin

    updateUI(currentAccount);
  }
});

// transfer money
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = ""; // text fields emptied after transfer

  // conditions for transferring money
  if (
    amount > 0 &&
    receiverAcc &&
    amount <= currentAccount.balance &&
    receiverAcc.username !== currentAccount.username
    // have to transfer non-zero positive amount
    // receiver's account must exist (not be undefined)
    // can only transfer as much as is present in user's bank account
    // user cannot transfer money to their own username (their own account)
  ) {
    currentAccount.movements.push(-amount); // add negative movement to current user
    receiverAcc.movements.push(amount); // add positive movement to recipient
  }

  // update UI
  updateUI(currentAccount);
});

// take out a loan
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  inputLoanAmount.blur();
  inputLoanAmount.value = "";

  // loan is granted only if there is a deposit with 10% or more of the loan request
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= 0.1 * amount)
  ) {
    currentAccount.movements.push(amount); // adds loan movement
    updateUI(currentAccount);
  }
});

// close an account:
btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  const closer = inputCloseUsername.value;
  const closerAccIndex = accounts.findIndex((acc) => acc.username === closer);
  const closerPin = Number(inputClosePin.value);

  inputClosePin.value = inputCloseUsername.value = "";
  inputClosePin.blur();

  if (
    // closerAcc &&
    currentAccount.username === closer &&
    currentAccount.pin === closerPin
  ) {
    accounts.splice(closerAccIndex, 1);
  }

  // Hide UI:
  containerApp.style.opacity = 0;
});

// sort movements
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

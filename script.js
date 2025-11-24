// LOCAL STORAGE HELPERS
const USERS_KEY = "winners_users";
const CURRENT_KEY = "winners_current_user";

function getUsers() {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : {};
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function ensureDefaultUsers() {
  let users = getUsers();
  if (!users["admin"]) {
    users["admin"] = { password: "admin123", balance: 0, role: "admin" };
  }
  if (!users["user1"]) {
    users["user1"] = { password: "1234", balance: 1000, role: "user" };
  }
  saveUsers(users);
}

function setCurrentUser(username) {
  localStorage.setItem(CURRENT_KEY, username);
}

function getCurrentUserName() {
  return localStorage.getItem(CURRENT_KEY);
}

function getCurrentUserObj() {
  const name = getCurrentUserName();
  if (!name) return { username: null, user: null };
  const users = getUsers();
  return { username: name, user: users[name] || null };
}

// LOGIN
function login() {
  const uInput = document.getElementById("username");
  const pInput = document.getElementById("password");
  if (!uInput || !pInput) return;

  const u = uInput.value.trim();
  const p = pInput.value.trim();
  const msgEl = document.getElementById("msg");

  const users = getUsers();
  if (!users[u] || users[u].password !== p) {
    if (msgEl) msgEl.innerText = "Wrong username or password!";
    return;
  }
  setCurrentUser(u);
  window.location.href = "dashboard.html";
}

// REGISTER
function registerUser() {
  const uInput = document.getElementById("username");
  const pInput = document.getElementById("password");
  const msgEl = document.getElementById("msg");
  if (!uInput || !pInput) return;

  const u = uInput.value.trim();
  const p = pInput.value.trim();

  if (!u || !p) {
    msgEl.innerText = "Enter username and password";
    return;
  }

  let users = getUsers();
  if (users[u]) {
    msgEl.innerText = "User already exists";
    return;
  }

  users[u] = { password: p, balance: 500, role: "user" }; // new user 500 coins
  saveUsers(users);
  msgEl.innerText = "Account created! Now login.";
}

// LOGOUT
function logout() {
  localStorage.removeItem(CURRENT_KEY);
  window.location.href = "login.html";
}

// DASHBOARD LOAD
function loadDashboard() {
  const nameSpan = document.getElementById("dashUser");
  const balSpan = document.getElementById("dashBalance");
  if (!nameSpan || !balSpan) return; // not on this page

  const { username, user } = getCurrentUserObj();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  nameSpan.innerText = username;
  balSpan.innerText = user.balance;
}

// SIMPLE PLAY: bet 10 coins
function fakePlay() {
  const { username, user } = getCurrentUserObj();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (user.balance < 10) {
    const msg = document.getElementById("dashMsg");
    if (msg) msg.innerText = "Not enough coins!";
    return;
  }

  // random 0–99
  const roll = Math.floor(Math.random() * 100);
  let win = 0;
  if (roll < 50) win = 20; // 50% chance to win 20

  let users = getUsers();
  users[username].balance = users[username].balance - 10 + win;
  saveUsers(users);

  const msg = document.getElementById("dashMsg");
  if (msg) msg.innerText = `Roll: ${roll} | You ${win ? "won " + win + " coins!" : "lost!"}`;

  loadDashboard();
}

// ADMIN PAGE
function loadAdmin() {
  const adminNameSpan = document.getElementById("adminName");
  if (!adminNameSpan) return; // not on this page

  const { username, user } = getCurrentUserObj();
  if (!user || user.role !== "admin") {
    // not admin
    window.location.href = "login.html";
    return;
  }
  adminNameSpan.innerText = username;
}

function adminAddCoins() {
  const target = document.getElementById("targetUser").value.trim();
  const amount = parseInt(document.getElementById("amount").value || "0");
  const msg = document.getElementById("adminMsg");

  if (!target || !amount) {
    msg.innerText = "Enter username and amount.";
    return;
  }

  let users = getUsers();
  if (!users[target]) {
    users[target] = { password: "1234", balance: 0, role: "user" };
  }
  users[target].balance += amount;
  saveUsers(users);

  msg.innerText = `Added ${amount} coins to ${target}`;
}

function adminRemoveCoins() {
  const target = document.getElementById("targetUser").value.trim();
  const amount = parseInt(document.getElementById("amount").value || "0");
  const msg = document.getElementById("adminMsg");

  if (!target || !amount) {
    msg.innerText = "Enter username and amount.";
    return;
  }

  let users = getUsers();
  if (!users[target]) {
    msg.innerText = "User not found.";
    return;
  }
  users[target].balance -= amount;
  if (users[target].balance < 0) users[target].balance = 0;
  saveUsers(users);

  msg.innerText = `Removed ${amount} coins from ${target}`;
}

// HEADER BUTTONS ON HOME PAGE
function setupHeaderButtons() {
  const loginBtn = document.querySelector(".login-btn");
  const regBtn = document.querySelector(".register-btn");
  const startBtn = document.querySelector(".start-btn");

  if (loginBtn) loginBtn.onclick = () => (window.location.href = "login.html");
  if (regBtn) regBtn.onclick = () => (window.location.href = "login.html");
  if (startBtn) startBtn.onclick = () => (window.location.href = "login.html");
}

// INITIALIZE ON EVERY PAGE
ensureDefaultUsers();
setupHeaderButtons();
loadDashboard();
loadAdmin();

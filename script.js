// STORAGE KE KEYS
const USERS_KEY = "winners_users";
const CURRENT_KEY = "winners_current_user";
const SETTINGS_KEY = "winners_settings";

// USERS HELPERS
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

// SETTINGS (GAME + TRADING)
function getSettings() {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) return JSON.parse(data);
  return {
    gameMode: "random",          // random | forceWin | forceLose
    priceHistory: [100, 100, 100, 100, 100] // fake price chart
  };
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function ensureDefaultSettings() {
  saveSettings(getSettings());
}

// LOGIN
function login() {
  const uInput = document.getElementById("username");
  const pInput = document.getElementById("password");
  const msgEl = document.getElementById("msg");
  if (!uInput || !pInput) return;

  const u = uInput.value.trim();
  const p = pInput.value.trim();

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

  users[u] = { password: p, balance: 500, role: "user" };
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
  const priceSpan = document.getElementById("currentPriceUser");
  const chartEl = document.getElementById("userChart");

  const { username, user } = getCurrentUserObj();
  if (!nameSpan && !balSpan && !priceSpan && !chartEl) return; // not dashboard

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (nameSpan) nameSpan.innerText = username;
  if (balSpan) balSpan.innerText = user.balance;

  const settings = getSettings();
  const lastPrice = settings.priceHistory[settings.priceHistory.length - 1];
  if (priceSpan) priceSpan.innerText = lastPrice;

  if (chartEl) renderChart(chartEl, settings.priceHistory);
}

// SIMPLE GAME (COST 10)
function playGame() {
  const dashMsg = document.getElementById("dashMsg");
  let { username, user } = getCurrentUserObj();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (user.balance < 10) {
    if (dashMsg) dashMsg.innerText = "Not enough coins!";
    return;
  }

  const settings = getSettings();
  let win = false;
  let roll = Math.floor(Math.random() * 100);

  if (settings.gameMode === "random") {
    win = roll < 50; // 50% chance
  } else if (settings.gameMode === "forceWin") {
    win = true;
  } else if (settings.gameMode === "forceLose") {
    win = false;
  }

  let users = getUsers();
  if (win) {
    users[username].balance = users[username].balance - 10 + 20;
    if (dashMsg) dashMsg.innerText = `You WON! Roll = ${roll}`;
  } else {
    users[username].balance = users[username].balance - 10;
    if (dashMsg) dashMsg.innerText = `You LOST! Roll = ${roll}`;
  }
  saveUsers(users);
  loadDashboard();
}

// ADMIN LOAD
function loadAdmin() {
  const adminNameSpan = document.getElementById("adminName");
  if (!adminNameSpan) return; // not on admin page

  const { username, user } = getCurrentUserObj();
  if (!user || user.role !== "admin") {
    window.location.href = "login.html";
    return;
  }

  adminNameSpan.innerText = username;

  // set game mode dropdown
  const settings = getSettings();
  const select = document.getElementById("gameModeSelect");
  if (select) select.value = settings.gameMode;

  // set price + chart
  const priceSpan = document.getElementById("currentPriceAdmin");
  const chartEl = document.getElementById("adminChart");
  const lastPrice = settings.priceHistory[settings.priceHistory.length - 1];
  if (priceSpan) priceSpan.innerText = lastPrice;
  if (chartEl) renderChart(chartEl, settings.priceHistory);
}

// ADMIN COIN CONTROL
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

// ADMIN GAME MODE SAVE
function saveGameMode() {
  const select = document.getElementById("gameModeSelect");
  const msg = document.getElementById("gameMsg");
  if (!select) return;

  const settings = getSettings();
  settings.gameMode = select.value;
  saveSettings(settings);

  if (msg) msg.innerText = "Game mode updated!";
}

// TRADING PRICE CONTROLS (ADMIN)
function priceUp() {
  const msg = document.getElementById("priceMsg");
  const settings = getSettings();
  const last = settings.priceHistory[settings.priceHistory.length - 1];
  const newPrice = last + 5;
  settings.priceHistory.push(newPrice);
  if (settings.priceHistory.length > 12) settings.priceHistory.shift();
  saveSettings(settings);
  updateAdminPriceUI();
  if (msg) msg.innerText = "Price moved UP.";
}

function priceDown() {
  const msg = document.getElementById("priceMsg");
  const settings = getSettings();
  const last = settings.priceHistory[settings.priceHistory.length - 1];
  const newPrice = Math.max(10, last - 5);
  settings.priceHistory.push(newPrice);
  if (settings.priceHistory.length > 12) settings.priceHistory.shift();
  saveSettings(settings);
  updateAdminPriceUI();
  if (msg) msg.innerText = "Price moved DOWN.";
}

function resetPrice() {
  const msg = document.getElementById("priceMsg");
  const settings = getSettings();
  settings.priceHistory = [100, 100, 100, 100, 100];
  saveSettings(settings);
  updateAdminPriceUI();
  if (msg) msg.innerText = "Price reset to 100.";
}

function updateAdminPriceUI() {
  const settings = getSettings();
  const lastPrice = settings.priceHistory[settings.priceHistory.length - 1];

  const priceSpanAdmin = document.getElementById("currentPriceAdmin");
  const chartAdmin = document.getElementById("adminChart");
  const priceSpanUser = document.getElementById("currentPriceUser");
  const chartUser = document.getElementById("userChart");

  if (priceSpanAdmin) priceSpanAdmin.innerText = lastPrice;
  if (chartAdmin) renderChart(chartAdmin, settings.priceHistory);

  if (priceSpanUser) priceSpanUser.innerText = lastPrice;
  if (chartUser) renderChart(chartUser, settings.priceHistory);
}

// CHART RENDER
function renderChart(container, history) {
  if (!container) return;
  container.innerHTML = "";
  const max = Math.max(...history);
  history.forEach(v => {
    const bar = document.createElement("div");
    bar.className = "bar";
    const h = max ? (v / max) * 100 : 50;
    bar.style.height = h + "%";
    container.appendChild(bar);
  });
}

// HEADER BUTTONS (HOME PAGE)
function setupHeaderButtons() {
  const loginBtn = document.querySelector(".login-btn");
  const regBtn = document.querySelector(".register-btn");
  const startBtn = document.querySelector(".start-btn");

  if (loginBtn) loginBtn.onclick = () => (window.location.href = "login.html");
  if (regBtn) regBtn.onclick = () => (window.location.href = "login.html");
  if (startBtn) startBtn.onclick = () => (window.location.href = "login.html");
}

// INIT ON EVERY PAGE
ensureDefaultUsers();
ensureDefaultSettings();
setupHeaderButtons();
loadDashboard();
loadAdmin();
updateAdminPriceUI();

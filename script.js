// Fake Database
let users = {
  "admin": { password: "1234", balance: 0, role: "admin" }
};

function login() {
  let u = document.getElementById("username").value;
  let p = document.getElementById("password").value;

  if (users[u] && users[u].password === p) {
    localStorage.setItem("user", u);
    window.location = "dashboard.html";
  } else {
    document.getElementById("msg").innerText = "Wrong username or password";
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location = "index.html";
}

function updateDashboard() {
  let user = localStorage.getItem("user");
  if (!user) return;

  document.getElementById("user").innerText = user;
  document.getElementById("balance").innerText = users[user].balance;
}
updateDashboard();

function addCoins() {
  let user = document.getElementById("targetUser").value;
  let amount = Number(document.getElementById("amount").value);

  if (!users[user]) users[user] = {password: "1234", balance: 0};

  users[user].balance += amount;
  document.getElementById("msg").innerText = "Coins Added!";
}

function removeCoins() {
  let user = document.getElementById("targetUser").value;
  let amount = Number(document.getElementById("amount").value);

  if (!users[user]) return;

  users[user].balance -= amount;
  if (users[user].balance < 0) users[user].balance = 0;

  document.getElementById("msg").innerText = "Coins Removed!";
}

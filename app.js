const STORAGE_KEY = 'atm_data';

const INITIAL_USERS = [
  { username: 'ana', password: '1234', balance: 5000 },
  { username: 'juan', password: '4321', balance: 3000 },
  { username: 'maria', password: '1111', balance: 7000 },
];

let appData = null;

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const welcomeText = document.getElementById('welcome-text');
const balanceDisplay = document.getElementById('balance-display');
const btnTransfer = document.getElementById('btn-transfer');
const btnLogout = document.getElementById('btn-logout');
const btnResetDemo = document.getElementById('btn-reset-demo');
const transferModal = document.getElementById('transfer-modal');
const transferForm = document.getElementById('transfer-form');
const transferMessage = document.getElementById('transfer-message');

function initStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      appData = JSON.parse(stored);
    } catch {
      appData = createInitialData();
      saveData();
    }
  } else {
    appData = createInitialData();
    saveData();
  }
}

function createInitialData() {
  return {
    users: INITIAL_USERS.map((user) => ({ ...user })),
    session: null,
  };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

function findUser(username) {
  return appData.users.find((user) => user.username === username);
}

function getBalance(username) {
  const user = findUser(username);
  return user ? user.balance : 0;
}

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `message ${type}`;
  element.hidden = false;
}

function clearMessage(element) {
  element.textContent = '';
  element.className = 'message';
  element.hidden = true;
}

function showView(viewName) {
  const isLogin = viewName === 'login';

  loginView.classList.toggle('active', isLogin);
  loginView.hidden = !isLogin;

  dashboardView.classList.toggle('active', !isLogin);
  dashboardView.hidden = isLogin;
}

function updateDashboard() {
  const username = appData.session;
  if (!username) return;

  welcomeText.textContent = `Hola, ${username}`;
  balanceDisplay.textContent = formatCurrency(getBalance(username));
}

function handleLogin(username, password) {
  const user = findUser(username);

  if (!user || user.password !== password) {
    showMessage(loginMessage, 'Usuario o contraseña incorrectos', 'error');
    return false;
  }

  appData.session = username;
  saveData();
  clearMessage(loginMessage);
  loginForm.reset();
  showView('dashboard');
  updateDashboard();
  return true;
}

function handleLogout() {
  appData.session = null;
  saveData();
  loginForm.reset();
  clearMessage(loginMessage);
  closeTransferModal();
  showView('login');
}

function handleResetDemo() {
  const currentSession = appData.session;
  appData = createInitialData();
  appData.session = currentSession;
  saveData();
  updateDashboard();
}

function openTransferModal() {
  transferForm.reset();
  clearMessage(transferMessage);
  transferModal.hidden = false;
  transferModal.setAttribute('aria-hidden', 'false');
  document.getElementById('transfer-destination').focus();
}

function closeTransferModal() {
  transferModal.hidden = true;
  transferModal.setAttribute('aria-hidden', 'true');
  transferForm.reset();
  clearMessage(transferMessage);
}

function handleTransfer(fromUsername, toUsername, amount) {
  if (!toUsername) {
    showMessage(transferMessage, 'La cuenta destino no existe', 'error');
    return false;
  }

  const destinationUser = findUser(toUsername);

  if (!destinationUser) {
    showMessage(transferMessage, 'La cuenta destino no existe', 'error');
    return false;
  }

  if (toUsername === fromUsername) {
    showMessage(transferMessage, 'No puedes transferir a tu misma cuenta', 'error');
    return false;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    showMessage(transferMessage, 'Ingresa un monto válido', 'error');
    return false;
  }

  const sourceUser = findUser(fromUsername);

  if (!sourceUser || sourceUser.balance < amount) {
    showMessage(transferMessage, 'Saldo insuficiente', 'error');
    return false;
  }

  sourceUser.balance -= amount;
  destinationUser.balance += amount;
  saveData();
  updateDashboard();

  showMessage(
    transferMessage,
    `Transferencia exitosa: ${formatCurrency(amount)} a ${toUsername}`,
    'success'
  );

  transferForm.reset();
  setTimeout(closeTransferModal, 1500);
  return true;
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearMessage(loginMessage);

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  handleLogin(username, password);
});

btnTransfer.addEventListener('click', openTransferModal);
btnLogout.addEventListener('click', handleLogout);
btnResetDemo.addEventListener('click', handleResetDemo);

transferForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearMessage(transferMessage);

  const destination = document.getElementById('transfer-destination').value.trim();
  const amount = parseFloat(document.getElementById('transfer-amount').value);

  if (!appData.session) return;

  handleTransfer(appData.session, destination, amount);
});

document.querySelectorAll('[data-close-modal]').forEach((element) => {
  element.addEventListener('click', closeTransferModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !transferModal.hidden) {
    closeTransferModal();
  }
});

initStorage();

if (appData.session && findUser(appData.session)) {
  showView('dashboard');
  updateDashboard();
} else {
  appData.session = null;
  saveData();
  showView('login');
}

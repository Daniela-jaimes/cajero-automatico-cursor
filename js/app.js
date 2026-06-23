function showView(viewId) {
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.add('hidden');
    view.classList.remove('active');
  });

  const target = document.getElementById(viewId);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }

  clearMessages();
}

function clearMessages() {
  const loginError = document.getElementById('login-error');
  const transferMessage = document.getElementById('transfer-message');

  if (loginError) {
    loginError.textContent = '';
    loginError.classList.add('hidden');
  }

  if (transferMessage) {
    transferMessage.textContent = '';
    transferMessage.className = 'message hidden';
  }
}

function showMessage(elementId, text, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden', 'error', 'success');
  el.classList.add(type);
}

function initMenu() {
  const user = getCurrentUser();
  if (!user) {
    showView('view-login');
    return;
  }

  const nameEl = document.getElementById('user-name');
  if (nameEl) nameEl.textContent = user.name;
  showView('view-menu');
}

function init() {
  seedIfEmpty();

  const user = getCurrentUser();
  if (user) {
    initMenu();
  } else {
    showView('view-login');
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const pin = document.getElementById('pin').value;
      const result = login(username, pin);

      if (result.success) {
        loginForm.reset();
        initMenu();
      } else {
        showMessage('login-error', result.message, 'error');
      }
    });
  }

  document.getElementById('btn-balance')?.addEventListener('click', () => {
    renderBalance();
    showView('view-balance');
  });

  document.getElementById('btn-transfer')?.addEventListener('click', () => {
    populateDestinationSelect();
    document.getElementById('transfer-form')?.reset();
    showView('view-transfer');
  });

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    logout();
    document.getElementById('login-form')?.reset();
    showView('view-login');
  });

  document.getElementById('btn-back-from-balance')?.addEventListener('click', () => {
    showView('view-menu');
  });

  document.getElementById('btn-back-from-transfer')?.addEventListener('click', () => {
    showView('view-menu');
  });

  const transferForm = document.getElementById('transfer-form');
  if (transferForm) {
    transferForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = getCurrentUser();
      if (!user) {
        showView('view-login');
        return;
      }

      const toId = document.getElementById('destination').value;
      const amount = document.getElementById('amount').value;
      const result = transfer(user.accountId, toId, amount);

      if (result.success) {
        showMessage('transfer-message', result.message, 'success');
        transferForm.reset();
        populateDestinationSelect();
      } else {
        showMessage('transfer-message', result.message, 'error');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);

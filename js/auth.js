const SESSION_KEY = 'cajero_session';
const FAILED_ATTEMPTS_KEY = 'cajero_failed_attempts';
const MAX_FAILED_ATTEMPTS = 3;

function getCurrentUser() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getFailedAttempts() {
  const count = sessionStorage.getItem(FAILED_ATTEMPTS_KEY);
  return count ? parseInt(count, 10) : 0;
}

function setFailedAttempts(count) {
  sessionStorage.setItem(FAILED_ATTEMPTS_KEY, String(count));
}

function clearFailedAttempts() {
  sessionStorage.removeItem(FAILED_ATTEMPTS_KEY);
}

function login(username, pin) {
  if (getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
    return { success: false, message: 'Demasiados intentos fallidos. Recargue la página.' };
  }

  const account = findAccountByUsername(username.trim());
  if (!account || account.pin !== pin) {
    const attempts = getFailedAttempts() + 1;
    setFailedAttempts(attempts);
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      return { success: false, message: 'Demasiados intentos fallidos. Recargue la página.' };
    }
    return { success: false, message: 'Usuario o PIN incorrecto' };
  }

  clearFailedAttempts();
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ accountId: account.id, name: account.name })
  );
  return { success: true };
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

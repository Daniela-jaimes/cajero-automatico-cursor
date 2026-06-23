function getBalance(accountId) {
  const account = findAccountById(accountId);
  return account ? account.balance : 0;
}

function renderBalance() {
  const user = getCurrentUser();
  if (!user) return;

  const balanceEl = document.getElementById('balance-amount');
  if (!balanceEl) return;

  const balance = getBalance(user.accountId);
  balanceEl.textContent = formatCurrency(balance);
}

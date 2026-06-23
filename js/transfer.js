function populateDestinationSelect() {
  const user = getCurrentUser();
  const select = document.getElementById('destination');
  if (!user || !select) return;

  const data = getData();
  if (!data) return;

  select.innerHTML = '<option value="">Seleccione una cuenta</option>';

  data.accounts
    .filter((account) => account.id !== user.accountId)
    .forEach((account) => {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = `${account.name} (${account.id})`;
      select.appendChild(option);
    });
}

function transfer(fromId, toId, amount) {
  if (fromId === toId) {
    return { success: false, message: 'No puede transferir a su propia cuenta' };
  }

  const parsedAmount = parseFloat(amount);
  if (!parsedAmount || parsedAmount <= 0 || isNaN(parsedAmount)) {
    return { success: false, message: 'Ingrese un monto válido mayor a 0' };
  }

  const data = getData();
  if (!data) {
    return { success: false, message: 'Error al leer los datos' };
  }

  const fromAccount = data.accounts.find((a) => a.id === fromId);
  const toAccount = data.accounts.find((a) => a.id === toId);

  if (!fromAccount || !toAccount) {
    return { success: false, message: 'Cuenta no encontrada' };
  }

  if (fromAccount.balance < parsedAmount) {
    return { success: false, message: 'Saldo insuficiente' };
  }

  fromAccount.balance -= parsedAmount;
  toAccount.balance += parsedAmount;

  data.transactions.push({
    id: `TX-${Date.now()}`,
    from: fromId,
    to: toId,
    amount: parsedAmount,
    date: new Date().toISOString(),
  });

  saveData(data);

  return {
    success: true,
    message: `Transferencia realizada: ${formatCurrency(parsedAmount)} a ${toAccount.name}`,
  };
}

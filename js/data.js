const STORAGE_KEY = 'cajero_data';

const SEED_ACCOUNTS = [
  { id: 'ACC-001', username: 'ana01', pin: '1234', name: 'Ana García', balance: 5000 },
  { id: 'ACC-002', username: 'luis02', pin: '5678', name: 'Luis Pérez', balance: 3200 },
  { id: 'ACC-003', username: 'maria03', pin: '9012', name: 'María López', balance: 7500 },
];

function getData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function seedIfEmpty() {
  if (getData()) return;
  saveData({
    accounts: SEED_ACCOUNTS.map((account) => ({ ...account })),
    transactions: [],
  });
}

function findAccountByUsername(username) {
  const data = getData();
  if (!data) return null;
  return data.accounts.find((a) => a.username === username) || null;
}

function findAccountById(id) {
  const data = getData();
  if (!data) return null;
  return data.accounts.find((a) => a.id === id) || null;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Prueba manual de la lógica del cajero (sin DOM).
 * Ejecutar: node test/manual-test.js
 */

const localStore = {};
const sessionStore = {};

global.localStorage = {
  getItem: (k) => localStore[k] ?? null,
  setItem: (k, v) => { localStore[k] = v; },
  removeItem: (k) => { delete localStore[k]; },
};

global.sessionStorage = {
  getItem: (k) => sessionStore[k] ?? null,
  setItem: (k, v) => { sessionStore[k] = v; },
  removeItem: (k) => { delete sessionStore[k]; },
};

global.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
};

require('../js/data.js');
require('../js/auth.js');
require('../js/transfer.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed += 1;
    console.log(`  OK: ${message}`);
  } else {
    failed += 1;
    console.error(`  FAIL: ${message}`);
  }
}

console.log('1. Seed localStorage');
seedIfEmpty();
const data = getData();
assert(data !== null, 'getData retorna datos');
assert(data.accounts.length === 3, '3 cuentas precargadas');
assert(findAccountByUsername('ana01').balance === 5000, 'Saldo inicial ana01');

console.log('2. Login correcto');
const okLogin = login('ana01', '1234');
assert(okLogin.success, 'Login ana01/1234 exitoso');
assert(getCurrentUser().accountId === 'ACC-001', 'Sesión con ACC-001');

console.log('3. Login incorrecto');
logout();
const badLogin = login('ana01', '0000');
assert(!badLogin.success, 'Login con PIN incorrecto falla');
assert(badLogin.message === 'Usuario o PIN incorrecto', 'Mensaje de error correcto');

console.log('4. Transferencia');
login('ana01', '1234');
const transferResult = transfer('ACC-001', 'ACC-002', 200);
assert(transferResult.success, 'Transferencia 200 exitosa');
assert(getBalance('ACC-001') === 4800, 'Saldo ana01 después de transferir');
assert(getBalance('ACC-002') === 3400, 'Saldo luis02 después de recibir');

console.log('5. Persistencia localStorage');
const persisted = JSON.parse(localStore.cajero_data);
assert(persisted.accounts[0].balance === 4800, 'Saldo persiste en localStorage');
assert(persisted.transactions.length === 1, 'Transacción registrada');

console.log('6. Validaciones transferencia');
const sameAccount = transfer('ACC-001', 'ACC-001', 100);
assert(!sameAccount.success, 'No transferir a misma cuenta');

const insufficient = transfer('ACC-001', 'ACC-002', 99999);
assert(!insufficient.success, 'Saldo insuficiente rechazado');

const invalidAmount = transfer('ACC-001', 'ACC-002', -50);
assert(!invalidAmount.success, 'Monto negativo rechazado');

console.log('7. Logout');
logout();
assert(getCurrentUser() === null, 'Sesión limpia tras logout');

console.log('');
console.log(`Resultado: ${passed} pasaron, ${failed} fallaron`);
process.exit(failed > 0 ? 1 : 0);

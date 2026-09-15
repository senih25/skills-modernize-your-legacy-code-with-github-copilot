const test = require('node:test');
const assert = require('node:assert/strict');

const { createAccount, formatMoney } = require('./index');

test('TC-001: account starts with the legacy balance', () => {
  const account = createAccount();
  assert.equal(account.getBalance(), 1000);
  assert.equal(formatMoney(account.getBalance()), '1000.00');
});

test('TC-002: credit persists the new balance', () => {
  const account = createAccount();
  assert.equal(account.credit(250.50), 1250.50);
  assert.equal(account.getBalance(), 1250.50);
});

test('TC-003: debit within available funds succeeds', () => {
  const account = createAccount();
  assert.deepEqual(account.debit(250.25), { success: true, balance: 749.75 });
});

test('TC-004: debit equal to the full balance is allowed', () => {
  const account = createAccount();
  assert.deepEqual(account.debit(1000), { success: true, balance: 0 });
});

test('TC-005: overdraft is rejected without changing balance', () => {
  const account = createAccount();
  const result = account.debit(1000.01);
  assert.equal(result.success, false);
  assert.equal(result.balance, 1000);
  assert.equal(account.getBalance(), 1000);
});

test('TC-006/007: state persists and balance reads are read-only', () => {
  const account = createAccount();
  account.credit(200);
  account.debit(150);
  assert.equal(account.getBalance(), 1050);
  assert.equal(account.getBalance(), 1050);
});

test('TC-010: cent precision is preserved', () => {
  const account = createAccount();
  account.credit(0.01);
  account.debit(0.02);
  assert.equal(account.getBalance(), 999.99);
  assert.equal(formatMoney(account.getBalance()), '999.99');
});

test('TC-011/012: zero-value credit and debit keep balance unchanged', () => {
  const account = createAccount();
  assert.equal(account.credit(0), 1000);
  assert.deepEqual(account.debit(0), { success: true, balance: 1000 });
});

test('invalid monetary input is rejected explicitly', () => {
  const account = createAccount();
  assert.throws(() => account.credit(-1), /non-negative finite/);
  assert.throws(() => account.debit(Number.NaN), /non-negative finite/);
});

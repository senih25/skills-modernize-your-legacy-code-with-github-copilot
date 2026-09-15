#!/usr/bin/env node

const readline = require('node:readline');

const DEFAULT_BALANCE = 1000.00;

function toCents(amount) {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new TypeError('Amount must be a non-negative finite number.');
  }
  return Math.round((amount + Number.EPSILON) * 100);
}

function fromCents(cents) {
  return cents / 100;
}

function formatMoney(amount) {
  return Number(amount).toFixed(2);
}

function createAccount(initialBalance = DEFAULT_BALANCE) {
  let balanceCents = toCents(initialBalance);

  function getBalance() {
    return fromCents(balanceCents);
  }

  function credit(amount) {
    balanceCents += toCents(amount);
    return getBalance();
  }

  function debit(amount) {
    const amountCents = toCents(amount);
    if (amountCents > balanceCents) {
      return {
        success: false,
        balance: getBalance(),
        message: 'Insufficient funds for this debit.',
      };
    }

    balanceCents -= amountCents;
    return { success: true, balance: getBalance() };
  }

  return { getBalance, credit, debit };
}

function createPrompt(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function runCli(account = createAccount(), input = process.stdin, output = process.stdout) {
  const rl = readline.createInterface({ input, output });

  try {
    let running = true;
    while (running) {
      output.write('\n--------------------------------\n');
      output.write('Account Management System\n');
      output.write('1. View Balance\n');
      output.write('2. Credit Account\n');
      output.write('3. Debit Account\n');
      output.write('4. Exit\n');
      output.write('--------------------------------\n');

      const choice = (await createPrompt(rl, 'Enter your choice (1-4): ')).trim();

      switch (choice) {
        case '1':
          output.write(`Current balance: ${formatMoney(account.getBalance())}\n`);
          break;
        case '2': {
          const amount = Number((await createPrompt(rl, 'Enter credit amount: ')).trim());
          try {
            const balance = account.credit(amount);
            output.write(`Amount credited. New balance: ${formatMoney(balance)}\n`);
          } catch (error) {
            output.write(`${error.message}\n`);
          }
          break;
        }
        case '3': {
          const amount = Number((await createPrompt(rl, 'Enter debit amount: ')).trim());
          try {
            const result = account.debit(amount);
            if (result.success) {
              output.write(`Amount debited. New balance: ${formatMoney(result.balance)}\n`);
            } else {
              output.write(`${result.message}\n`);
            }
          } catch (error) {
            output.write(`${error.message}\n`);
          }
          break;
        }
        case '4':
          running = false;
          break;
        default:
          output.write('Invalid choice, please select 1-4.\n');
      }
    }

    output.write('Exiting the program. Goodbye!\n');
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  runCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  DEFAULT_BALANCE,
  createAccount,
  formatMoney,
  runCli,
};

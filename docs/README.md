# Legacy COBOL Accounting System Analysis

This document captures the behavior that must be preserved while modernizing the school accounting application from COBOL to Node.js.

## File responsibilities

### `main.cob`

`main.cob` is the interactive entry point. It repeatedly displays a four-option menu until the user chooses Exit. The menu routes View Balance, Credit Account, and Debit Account requests to the `Operations` program by passing the fixed-width commands `TOTAL `, `CREDIT`, and `DEBIT ` respectively. Invalid menu choices are rejected without changing account state.

### `operations.cob`

`operations.cob` contains the business operations. For `TOTAL ` it reads the current balance from `DataProgram` and displays it. For `CREDIT` it accepts an amount, reads the current balance, adds the amount, writes the new balance, and displays the result. For `DEBIT ` it accepts an amount and reads the balance, but subtracts and writes only when the available balance is greater than or equal to the requested amount. Otherwise it displays an insufficient-funds message and leaves the stored balance unchanged.

### `data.cob`

`data.cob` acts as the persistence boundary. Its `STORAGE-BALANCE` starts at `1000.00`. A `READ` operation copies the stored value into the caller-provided balance field, while `WRITE` replaces the stored value with the caller-provided balance. The monetary fields use two decimal places.

## Key business requirements

- The initial account balance is **1000.00**.
- Viewing the balance is read-only.
- A credit increases the balance by the entered amount and persists the result.
- A debit decreases the balance only when sufficient funds are available.
- A rejected debit must not modify the stored balance.
- The modern implementation should preserve decimal monetary semantics and explicit validation boundaries.
- The user-facing command flow remains view balance, credit, debit, and exit.

## Data flow

```mermaid
sequenceDiagram
    actor User
    participant Main as main.cob
    participant Ops as operations.cob
    participant Data as data.cob

    User->>Main: Select menu action
    alt View balance
        Main->>Ops: TOTAL
        Ops->>Data: READ balance
        Data-->>Ops: Current balance
        Ops-->>User: Display balance
    else Credit account
        Main->>Ops: CREDIT
        Ops-->>User: Request credit amount
        User->>Ops: Amount
        Ops->>Data: READ balance
        Data-->>Ops: Current balance
        Ops->>Ops: balance = balance + amount
        Ops->>Data: WRITE new balance
        Ops-->>User: Display new balance
    else Debit account
        Main->>Ops: DEBIT
        Ops-->>User: Request debit amount
        User->>Ops: Amount
        Ops->>Data: READ balance
        Data-->>Ops: Current balance
        alt Sufficient funds
            Ops->>Ops: balance = balance - amount
            Ops->>Data: WRITE new balance
            Ops-->>User: Display new balance
        else Insufficient funds
            Ops-->>User: Reject debit; balance unchanged
        end
    else Exit
        Main-->>User: Goodbye
    end
```

## Modernization boundary

The Node.js replacement should separate account state from operation dispatch, expose deterministic credit/debit/balance functions for testing, and preserve the COBOL system's no-overdraft rule before replacing the interactive shell.

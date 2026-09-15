# Legacy Accounting System Test Plan

This plan defines the business-behavior baseline that the Node.js replacement must preserve. The cases are derived from `main.cob`, `operations.cob`, and `data.cob`. Actual Result and Status remain unexecuted until the legacy binary or replacement implementation is run in a controlled test environment.

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-001 | Verify initial balance | Fresh application state | Start the application; choose View Balance | Balance is `1000.00`; no state change occurs | Not executed | Not executed | Baseline from `STORAGE-BALANCE` |
| TC-002 | Credit account | Balance is `1000.00` | Choose Credit Account; enter `250.50`; then view balance | Credit succeeds and persisted balance is `1250.50` | Not executed | Not executed | Validates READ → add → WRITE flow |
| TC-003 | Debit within available funds | Balance is `1000.00` | Choose Debit Account; enter `250.25`; then view balance | Debit succeeds and persisted balance is `749.75` | Not executed | Not executed | Validates READ → sufficient-funds check → subtract → WRITE |
| TC-004 | Debit exactly equal to balance | Balance is `1000.00` | Choose Debit Account; enter `1000.00`; then view balance | Debit succeeds because balance >= amount; persisted balance becomes `0.00` | Not executed | Not executed | Boundary condition for no-overdraft rule |
| TC-005 | Reject debit exceeding balance | Balance is `1000.00` | Choose Debit Account; enter `1000.01`; then view balance | System displays insufficient-funds message and balance remains `1000.00` | Not executed | Not executed | Rejected debit must not call WRITE |
| TC-006 | Preserve credited state for later debit | Balance is `1000.00` | Credit `200.00`; debit `150.00`; view balance | Operations use persisted state and final balance is `1050.00` | Not executed | Not executed | Validates cross-operation persistence |
| TC-007 | View balance is read-only | Balance has a known non-default value | View balance twice | Both reads return the same value and do not modify storage | Not executed | Not executed | Validates TOTAL/READ path |
| TC-008 | Invalid menu option | Application is at main menu | Enter a value outside `1-4` | Invalid-choice message is displayed; menu continues; balance remains unchanged | Not executed | Not executed | Main loop resilience |
| TC-009 | Exit flow | Application is at main menu | Choose option `4` | Continue flag becomes `NO`; loop stops; goodbye message is displayed | Not executed | Not executed | Validates clean termination |
| TC-010 | Decimal precision | Balance is `1000.00` | Credit `0.01`; debit `0.02`; view balance | Final balance is `999.99` with two decimal places | Not executed | Not executed | Protects monetary precision semantics |
| TC-011 | Zero-value credit | Balance is `1000.00` | Credit `0.00`; view balance | Operation completes without changing balance | Not executed | Not executed | Current COBOL logic does not reject zero |
| TC-012 | Zero-value debit | Balance is `1000.00` | Debit `0.00`; view balance | Sufficient-funds condition passes and balance remains unchanged | Not executed | Not executed | Current COBOL logic permits zero debit |

## Acceptance criteria for modernization

The Node.js implementation should pass equivalent automated unit/integration tests for every deterministic rule above. In particular, it must preserve the initial `1000.00` balance, credit persistence, the sufficient-funds guard for debit, unchanged state after rejected debits, read-only balance queries, and explicit command dispatch for balance/credit/debit operations.

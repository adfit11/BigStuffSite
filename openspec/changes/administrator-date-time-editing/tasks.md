# Tasks

## 1. Timestamp Helper Behavior

- [ ] 1.1 Add an admin taken timestamp helper module for parsing effective ISO timestamps into date and minute-precision time parts, and verify `node:test` coverage shows imported and overridden timestamps produce the expected control values.
- [ ] 1.2 Add helper behavior for composing a `takenAtOverride` from date and time parts without browser-local timezone conversion, and verify tests cover changing only the date and changing only the time while preserving the other displayed part.
- [ ] 1.3 Add non-destructive helper behavior for empty or invalid date/time parts, and verify tests cover cleared date, cleared time, invalid existing timestamps, invalid calendar dates, and invalid clock times.

## 2. Admin Editor Wiring

- [ ] 2.1 Replace the single admin `datetime-local` taken timestamp input with separate date and time controls, and verify `npm run typecheck` accepts the updated JSX and helper imports.
- [ ] 2.2 Wire date changes so they save `takenAtOverride` with the new date and existing displayed time, and verify helper tests cover the exact saved ISO timestamp.
- [ ] 2.3 Wire time changes so they save `takenAtOverride` with the existing displayed date and new time, and verify helper tests cover the exact saved ISO timestamp.
- [ ] 2.4 Ensure empty or invalid date/time edits do not overwrite the previous effective timestamp, and verify tests cover the non-destructive update path used by the editor.

## 3. Admin Queue Ordering

- [ ] 3.1 Keep Date sorting based on the effective taken timestamp, including edited time of day, and verify tests cover same-day photos sorting earlier time before later time.
- [ ] 3.2 Verify tests cover a `takenAtOverride` time edit changing the same-day queue order without changing the imported timestamp.
- [ ] 3.3 Run `npm test` and `npm run typecheck` to verify the full automated suite passes.

# Design

## Context

See proposal.md for motivation. The admin app currently keeps all editor behavior in `src/admin/main.tsx`. `PhotoEditor` renders one `datetime-local` input for the effective taken timestamp and writes changes to `takenAtOverride`. The helper that formats the value uses UTC ISO parts, while the helper that parses edited values constructs a JavaScript `Date` from a local datetime string, which can shift the saved timestamp depending on the browser timezone.

Existing automated tests use `node:test` against TypeScript modules through `tsx`. There is no React component test harness in the project today.

## Goals / Non-Goals

**Goals:**

- Let administrators edit taken date and taken time independently.
- Preserve the existing `takenAtOverride` data model and public data pipeline.
- Make timestamp parsing and recomposition deterministic across browser timezones.
- Add focused tests around timestamp helpers and admin date sort behavior.

**Non-Goals:**

- Add a new chronology/order field.
- Change public photo ordering behavior or public `takenAt` formatting.
- Add a browser/component testing dependency solely for this change.
- Migrate existing editorial timestamp values.

## Decisions

### Extract pure admin timestamp helpers

Move date/time part logic out of `src/admin/main.tsx` into a small admin module, such as `src/admin/takenTimestamp.ts`. The module should expose pure functions for:

- reading date and minute-precision time parts from an effective ISO timestamp,
- composing a `takenAtOverride` ISO timestamp from date and time parts,
- replacing only the date part,
- replacing only the time part,
- comparing effective taken timestamps for admin date sorting.

Rationale: the fragile behavior is not React rendering; it is timestamp manipulation. Pure helpers fit the existing `node:test` setup and let implementation add robust coverage without introducing a component test stack.

Alternative considered: test the editor through React rendering. That would exercise labels and input wiring, but the repo has no test harness for React components today and the main risk is pure date/time recomposition.

### Treat admin controls as editing stored timestamp parts

The split controls should display and preserve the date and time parts of the stored ISO timestamp directly. Composing an override should avoid `new Date("YYYY-MM-DDTHH:mm")`, because that string is interpreted in the browser's local timezone. Instead, compose a normalized ISO string from validated date and time parts, for example `YYYY-MM-DDTHH:mm:00.000Z`.

Rationale: existing values are stored as ISO strings with `Z`, and current display already slices UTC ISO parts. Keeping date/time controls aligned with stored parts avoids silent timezone shifts when only one field changes.

Alternative considered: interpret the split controls as local civil time. That could be reasonable for a broader product decision, but it would change the meaning of existing editorial timestamps and risks changing public chronology.

### Keep invalid or partial edits non-destructive

If a date or time edit cannot form a valid timestamp, the editor should not write a replacement `takenAtOverride`. The UI can either revert to the last valid value immediately or keep transient local input state until a valid pair exists, but saved editorial data and admin ordering must continue using the prior effective timestamp.

Rationale: chronology should not be corrupted by a half-finished edit or by a browser emitting an empty value.

Alternative considered: clearing either field removes `takenAtOverride`. That is ambiguous with split controls because clearing time alone would unexpectedly discard an explicit date correction.

### Keep admin sorting based on effective timestamp

The admin queue's Date sort already compares the effective timestamp from `takenAtOverride ?? photo.takenAt`. This should continue, but the comparison should be covered with same-day, different-time tests and should reuse the same helper module if practical.

Rationale: time editing matters because it changes same-day chronology. Sorting tests make that contract visible.

Alternative considered: leave sorting untouched and only test helper recomposition. That would miss the observable behavior the administrator is trying to correct.

## Risks / Trade-offs

- Existing helper behavior has timezone-dependent parsing -> Mitigation: compose ISO timestamps from validated string parts instead of local `Date` parsing.
- HTML date/time inputs can produce empty values during editing -> Mitigation: treat empty or invalid parts as non-destructive and cover that behavior with tests.
- Minute-precision controls may drop seconds from imported timestamps after an edit -> Mitigation: accept minute precision as matching the current `datetime-local` behavior and make it explicit in helper tests.
- Moving helpers out of `main.tsx` can expose admin internals -> Mitigation: keep the module narrow and domain-named around taken timestamps rather than generic date utilities.

## Migration Plan

No data migration is required. Existing `takenAtOverride` values remain valid ISO timestamps. Rollback is the previous combined field reading and writing the same property.

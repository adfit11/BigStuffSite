# Proposal

## Why

Administrators currently edit a photo's taken timestamp through one combined date-time field, which makes it awkward to correct only the date or only the time while preserving the other value. Same-day photo chronology depends on predictable time-of-day edits, so the admin editor should make those edits explicit and robust.

## What Changes

- Replace the combined admin taken timestamp control with separate taken date and taken time controls.
- Preserve the existing timestamp model by continuing to save edits as `takenAtOverride` ISO strings.
- Ensure changing the date preserves the existing time, and changing the time preserves the existing date.
- Define predictable behavior for invalid or empty date/time input so the editor does not accidentally corrupt chronology.
- Add focused tests around date/time parsing, recomposition, preservation, invalid input, and sorting effects.

## Capabilities

### New Capabilities

- `admin-photo-editing`: Covers administrator editing of photo metadata used for public publication, including taken date and time overrides.

### Modified Capabilities

- None.

## Impact

- Affects `src/admin/main.tsx`, especially the `PhotoEditor` taken timestamp controls and timestamp helper functions.
- May introduce a small admin date/time helper module to make parsing and recomposition testable without rendering the React admin app.
- Affects admin queue ordering indirectly because date sorting already uses the effective taken timestamp.
- Affects saved `data/editorial.json` values only through the existing `takenAtOverride` field; no schema or public data contract change is expected.
- Verification should include unit tests for helper behavior and focused coverage that admin date sorting responds predictably to edited date or time values.

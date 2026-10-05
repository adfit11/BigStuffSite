# Design

## Context

The public app derives `filteredPhotos` from the loaded public photo data, selected tags, and title query. That array is then reused by the map, desktop title list, mobile rail, next/previous navigation, marker readiness, and featured-photo selection. The current filtering helper preserves source data order; the existing selection helper independently chooses the newest matching photo by `takenAt`.

## Goals / Non-Goals

**Goals:**

- Make every filtered browsing surface receive photos ordered newest-first by `takenAt`.
- Preserve the existing default featured-photo behavior and explicit URL photo selection.
- Keep next/previous navigation operating over the same visible order as the desktop list and mobile rail.
- Keep map markers and marker readiness aligned with the same matching photo set, without changing map clustering behavior.

**Non-Goals:**

- Do not change public data generation order or persisted photo metadata.
- Do not add a user-facing sort control.
- Do not change date formatting, filters, URL parameters, or map clustering rules.

## Decisions

### Sort filtered photos in the shared helper

Apply newest-first ordering in the shared public filtering helper after tag/title filtering. This ensures the desktop title list, mobile rail, navigation, map inputs, marker readiness, and initial default selection consume one consistent ordered result.

Alternative considered: sort only inside `PhotoList` and `PhotoRail`. That would satisfy the visible list/rail but leave next/previous navigation and any other consumer on the older source order.

### Use descending `takenAt` with stable tie behavior

Sort by `takenAt` descending. For equal timestamps, preserve the existing relative source order so ordering is deterministic without inventing secondary behavior not requested by the user.

Alternative considered: break ties by title or id. That would be deterministic but arbitrary from a visitor perspective and would create behavior beyond the requested chronological order.

### Keep selection logic compatible

Continue using the existing newest-photo selection behavior for default and filter fallback. Since the filtered list will already be newest-first, implementation can either keep the existing reducer or reuse the ordered list's first item if tests confirm equivalent behavior.

Alternative considered: replace selection behavior wholesale with list-first behavior. That is simpler, but the existing reducer's tie behavior may differ from a stable newest-first sort unless addressed deliberately.

## Risks / Trade-offs

- Changing order affects next/previous direction expectations -> Verify navigation against the ordered list and smoke-check desktop/mobile browsing.
- Equal `takenAt` values can be ambiguous -> Preserve source order for ties and cover it with focused tests.
- Sorting in-place could mutate shared photo data -> Return a copied/sorted array rather than mutating `data.photos`.

## Migration Plan

1. Add newest-first ordering to the shared filtering path with focused tests.
2. Verify desktop list and mobile rail render in newest-first order.
3. Verify default selection, explicit URL selection, filters, and next/previous navigation still operate against the ordered matching set.
4. Rollback is a code revert; no data migration is required.

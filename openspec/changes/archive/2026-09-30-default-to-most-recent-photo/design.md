# Design

## Context

The public app receives `public-data.json` with `photos` sorted oldest-to-newest by `takenAt`, then title, then id. `PublicApp` filters that array and currently computes the featured photo as the URL-selected photo if present, otherwise `filteredPhotos[0]`. `PhotoList` on desktop and `PhotoRail` on mobile both receive the same `featuredId`, so changing the featured fallback changes the default active item for both surfaces.

## Goals / Non-Goals

**Goals:**

- Make the default featured photo the newest matching photo by `takenAt`.
- Keep valid URL-selected photos authoritative over the newest fallback.
- Keep desktop title list and mobile rail synchronized through the existing shared `featuredId`.
- Keep behavior deterministic when dates tie.

**Non-Goals:**

- Reorder `public-data.json` or change the generated data contract.
- Change map marker ordering, clustering, title-list rendering, or mobile rail layout.
- Add a user-facing sort control.
- Change filtering semantics or query-string parameter names.

## Decisions

### Select newest as a UI fallback, not by re-sorting public data

Add a small selection helper that chooses the newest photo from a candidate set when no valid requested photo exists. Use it in both initial selection and later fallback when filters remove the current featured photo.

Alternatives considered:

- Reverse `public-data.json` generation. This would affect every consumer of public photo order, including list and rail rendering, and could create unnecessary churn in generated data.
- Reverse `filteredPhotos` before rendering. This would make the UI order change when the request only asks for the default loaded photo.

### Preserve valid explicit URL selection

Keep the `photo` URL parameter as the first choice when it points to a photo in the currently matching set. Use newest fallback only when the URL has no photo, names an unavailable photo, or filters remove the current selection.

Alternatives considered:

- Always prefer newest, even with a URL photo. That would break deep links and the existing shareable photo behavior.

### Use existing deterministic tie-breakers

When multiple matching photos share the same newest `takenAt`, choose the one that appears latest in the existing filtered array. Because the generated array is already sorted by `takenAt`, title, then id, this preserves deterministic secondary ordering without adding another public rule.

Alternatives considered:

- Add a new title/id tie-breaker helper in the UI. This duplicates generated-data knowledge and increases the chance of drift.

## Risks / Trade-offs

- A future change could alter generated photo ordering and affect date ties -> Keep helper naming and tests explicit that the primary rule is newest `takenAt`, with deterministic fallback based on current array order.
- Filter changes may update the active photo more often than before -> This is desired when the current photo no longer matches; preserve the current photo when it still matches.
- Initial loading preloads the chosen default photo -> Reuse the same selection helper for preload and featured state so the loaded interface matches the image readiness work.

## Migration Plan

1. Add or update featured-photo selection helpers in `src/public/main.tsx`.
2. Use newest fallback during initial view-state resolution and when filtered photos no longer contain the current `featuredId`.
3. Add focused tests for newest default selection, URL-selected preservation, and filtered fallback behavior where practical.
4. Verify desktop and mobile smoke behavior in a browser.

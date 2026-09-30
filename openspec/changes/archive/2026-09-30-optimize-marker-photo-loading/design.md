# Design

## Context

The public app currently fetches `public-data.json`, derives the initial filters and featured photo, waits for the featured large image with a timeout, then shows the interface. Map markers are created later by Leaflet using `divIcon` HTML that points at `photo.derivatives.marker`; those marker images are eager, async-decoded `<img>` elements, but the app does not wait for them before removing the pineapple loading state.

Marker derivatives already exist as small WebP files generated from thumbs by `scripts/generate-marker-derivatives.ts`. The first map render can include either individual photo markers or clusters depending on zoom and filtering, so readiness must be based on the same initial photo set the map will render rather than every photo in the catalog.

## Goals / Non-Goals

**Goals:**

- Keep the pineapple loading state visible until the initial featured photo and the initial marker image set are ready, subject to a bounded timeout.
- Preload marker image URLs before the public interface mounts so Leaflet markers can display without a visible empty-image phase.
- Keep marker files small and appropriate for their displayed size.
- Preserve existing no-interaction transition behavior and data-load error handling.

**Non-Goals:**

- Do not wait for OpenStreetMap tile images or other third-party network assets.
- Do not preload every large photo in the catalog.
- Do not change map clustering behavior, filter semantics, or featured-photo selection behavior.
- Do not introduce a new image service or runtime dependency.

## Decisions

### Preload initial marker images in the loading pipeline

Add a readiness helper that takes the initially filtered photos and preloads their `derivatives.marker` URLs with `Image` objects before `setLoadState({ status: "loaded" })`. Run it alongside the existing featured-large-image readiness wait so the spinner covers both pieces of first-view imagery.

Alternative considered: wait for marker `<img>` load events after Leaflet creates DOM nodes. That couples readiness to Leaflet internals and would require showing the interface before readiness can be observed, which defeats the requested loading behavior.

### Bound marker readiness separately from data errors

Marker image failures and slow marker image requests should resolve readiness after a timeout instead of sending the app to the error state. The public data fetch remains the hard failure that shows an error. This keeps the visitor out of indefinite loading while still improving the common case.

Alternative considered: treat any marker image failure as a load error. That makes the whole page unavailable because of one tiny decorative image, which is too brittle.

### Limit the initial marker preload set to first-render map photo markers

Use the initially filtered photo set to identify marker image URLs, dedupe them, and cap the amount of initial waiting if needed. Cluster icons do not use photos, but the initial zoom can change across implementation details; preloading the filtered marker derivatives is a conservative and simple approximation that ensures marker photos are warm when individual markers appear after first interaction.

Alternative considered: reproduce Leaflet map item construction exactly in the loading helper and only preload non-cluster markers at zoom 2. That would likely preload few or no marker photos on clustered views and would not satisfy the user's goal of giving marker photos time to load.

### Keep marker derivatives tuned for displayed size

Review the marker derivative generation settings so generated files remain close to the marker display size and compressed aggressively enough for map use. If tuning changes, regenerate affected public marker files through the existing build scripts.

Alternative considered: use existing thumb derivatives directly. Thumbs are larger than marker display needs, so this would increase first-view bytes and work against the speed goal.

## Risks / Trade-offs

- Longer initial spinner on slow connections → Keep a bounded marker timeout and resolve failed marker loads.
- Waiting on all filtered markers could be too much for broad catalog views → Dedupe URLs, keep marker files tiny, and cap readiness time.
- Preloaded marker URLs and Leaflet marker URLs could diverge → Reuse the same `assetUrl(photo.derivatives.marker)` path construction in both places.
- Browser cache behavior varies → Verify through browser smoke checks that marker requests complete before the interface appears in the common case, not only through unit tests.

## Migration Plan

1. Add marker readiness helpers and wire them into the existing initial loading flow.
2. Tune marker derivative generation if file-size inspection shows current marker files are larger than needed.
3. Run typecheck, tests, build, and browser smoke checks for default load behavior.
4. Rollback is a code revert: the public interface can return to waiting only for the featured large photo without data migration.

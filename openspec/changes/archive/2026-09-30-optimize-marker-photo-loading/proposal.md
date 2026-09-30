# Proposal

## Why

The public map can become visible before its small marker photos are ready, which makes the first map view feel unfinished even though the loading spinner has gone away. Keeping the pineapple spinner up until marker images are ready gives the app a cleaner first render while allowing marker assets to be optimized for faster loading.

## What Changes

- Extend initial photo readiness so the loading spinner remains visible until the marker photos needed for the first map render have loaded or safely timed out.
- Optimize marker photo loading by ensuring the small marker derivatives are treated as first-view assets and fetched efficiently.
- Preserve the existing error behavior: data failures still replace the spinner with an error instead of waiting forever.
- Preserve explicit photo selection and existing map/list behavior after the initial loading state completes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `public-loading-experience`: Initial loading readiness now includes the small marker photos needed for the initial public map view, so the spinner stays visible until those assets are ready or a bounded fallback is reached.

## Impact

- Affected code: `src/public/main.tsx`, `src/public/styles.css`, marker derivative usage under `public/photos/markers/`, and the public data-driven loading path.
- Tests: add focused tests or browser smoke checks that verify the app waits for marker readiness, handles marker load errors/timeouts, and still exits loading without user interaction.
- Build/data pipeline: marker derivative generation may need tuning so marker files are appropriately small and cache-friendly.

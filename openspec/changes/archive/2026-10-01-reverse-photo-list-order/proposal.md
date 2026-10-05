# Proposal

## Why

The public photo list currently follows the source data order, which makes recent additions harder to scan. Showing the newest photo first gives visitors a clearer chronological browse path that matches the current default featured-photo behavior.

## What Changes

- Order the desktop title list from newest to oldest by `takenAt`.
- Order the mobile photo rail from newest to oldest by `takenAt`.
- Preserve existing filtering, title search, explicit photo selection, map marker behavior, and next/previous navigation against the same ordered result set.
- Keep the most recent matching photo as the default featured photo when no valid explicit photo is requested.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `public-photo-selection`: Browsing surfaces that list matching photos now expose those photos in newest-first chronological order.

## Impact

- Affected code: public photo filtering/order helpers and the components that consume the filtered photo list in `src/public/main.tsx`.
- Tests: add or update focused tests to verify newest-first ordering, tie behavior, and that default selection still chooses the newest matching photo.
- User-visible behavior: desktop and mobile browsing order changes, while URL photo selection and filters continue to work.

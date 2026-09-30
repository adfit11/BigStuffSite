# Proposal

## Why

When the public site opens without a specific photo in the URL, it currently falls back to the first filtered photo, which is the oldest item because public data is sorted oldest-to-newest. Visitors should land on the newest published photo by default on both desktop and mobile.

## What Changes

- Select the most recent matching photo as the default featured photo when no explicit `photo` URL parameter is present.
- Apply the same default selection behavior to the desktop title list and the mobile photo rail.
- Preserve existing explicit selection behavior when the URL names a valid photo.
- Preserve current filtering behavior, with the default recalculated from the currently matching filtered set when needed.

## Capabilities

### New Capabilities

- `public-photo-selection`: Covers how the public site chooses and synchronizes the featured/default photo across desktop and mobile photo browsing surfaces.

### Modified Capabilities

- None.

## Impact

- Affects `src/public/main.tsx` initial featured-photo selection and fallback behavior when filters or URL parameters are applied.
- May benefit from extracting or testing small date-based selection helpers.
- No data schema, photo import, build pipeline, or runtime dependency changes are expected.
- Verification should include desktop title-list and mobile rail behavior, plus URL-selected photo preservation.

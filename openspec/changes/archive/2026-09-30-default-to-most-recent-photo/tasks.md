# Tasks

## 1. Selection Logic

- [x] 1.1 Add or update a featured-photo selection helper that returns the newest photo by `takenAt` from a matching set and verify it behaves deterministically for date ties.
- [x] 1.2 Use the helper during initial public app load and verify a URL without `photo` preloads/features the newest published matching photo.
- [x] 1.3 Preserve valid explicit URL photo selection and verify a matching `photo` parameter remains featured instead of being replaced by the newest photo.
- [x] 1.4 Use newest fallback when filters remove the current featured photo and verify the newly featured photo is the most recent remaining match.

## 2. Surface Synchronization

- [x] 2.1 Verify the desktop title list marks and scrolls to the newest default photo when the page opens without an explicit photo.
- [x] 2.2 Verify the mobile photo rail marks and positions the newest default photo when the page opens without an explicit photo.
- [x] 2.3 Verify the map, feature panel, desktop list, and mobile rail continue sharing the same `featuredId` after default selection and manual selection.

## 3. Regression Checks

- [x] 3.1 Run `npm run typecheck` and verify it completes successfully.
- [x] 3.2 Run `npm test` and verify existing tests still pass.
- [x] 3.3 Run `npm run build` and verify the public site builds successfully.
- [x] 3.4 Run browser smoke checks for default newest selection, explicit URL selection, and filtered fallback on desktop and mobile.

# Tasks

## 1. Shared Ordering Behavior

- [x] 1.1 Add newest-first ordering to the shared filtered-photo path and verify unit tests show matching photos ordered by `takenAt` descending.
- [x] 1.2 Preserve stable source order for photos with equal `takenAt` values and verify this tie behavior with a focused unit test.
- [x] 1.3 Verify the ordering helper does not mutate the source photo array with a focused unit test.

## 2. Selection And Browsing Integration

- [x] 2.1 Verify default featured-photo selection still chooses the most recent matching photo after ordering changes by running the relevant unit tests.
- [x] 2.2 Verify explicit URL photo selection remains preserved even when the requested photo is not first in newest-first order.
- [x] 2.3 Verify next/previous navigation uses the same newest-first ordered result set as the desktop list and mobile rail with browser smoke coverage.

## 3. Visual Surface Verification

- [x] 3.1 Verify the desktop title list renders matching photos newest-first in a browser smoke check.
- [x] 3.2 Verify the mobile photo rail renders matching photos newest-first in a browser smoke check.
- [x] 3.3 Verify filtered desktop/mobile views remain newest-first after tag or title filtering in a browser smoke check or focused unit coverage.

## 4. Final Validation

- [x] 4.1 Run `npm run typecheck` and verify it passes.
- [x] 4.2 Run `npm test` and verify it passes.
- [x] 4.3 Run `npm run build` and verify it passes.
- [x] 4.4 Run `openspec validate "reverse-photo-list-order" --strict` and verify the change remains valid.

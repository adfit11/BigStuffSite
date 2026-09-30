# Tasks

## 1. Loading Readiness Flow

- [x] 1.1 Remove the interaction-gated loading delay from `src/public/main.tsx` and verify the app no longer waits for click, tap, scroll, key, or wheel input before leaving the loading state.
- [x] 1.2 Add bounded initial-photo readiness handling after `public-data.json` loads and verify a slow or failed initial photo cannot keep the app loading indefinitely.
- [x] 1.3 Preserve the existing data-load error path and verify a failed `public-data.json` request replaces loading copy with an error message.

## 2. Pineapple Loading UI

- [x] 2.1 Replace `LoadingGuide` markup with a loading component that shows pineapple-themed animated markup and verify the visible text tells users the photos are loading.
- [x] 2.2 Remove guide-specific instruction copy from the loading state and verify the loading UI does not mention tap, scroll, map selection, image click, location visit, or list scrolling instructions.
- [x] 2.3 Update `src/public/styles.css` with pineapple loader styling and verify the loader is visually stable on desktop and mobile viewport sizes.
- [x] 2.4 Add reduced-motion styling for the pineapple loader and verify the loading state remains understandable when `prefers-reduced-motion: reduce` is active.

## 3. Verification

- [x] 3.1 Run `npm run typecheck` and verify it completes successfully.
- [x] 3.2 Run `npm run build` and verify the public site builds successfully.
- [x] 3.3 Run a browser smoke check of the public page and verify the loading state appears before the photo interface, then transitions to the loaded map/photo experience.

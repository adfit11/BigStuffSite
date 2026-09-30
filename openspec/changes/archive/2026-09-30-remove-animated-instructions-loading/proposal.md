# Proposal

## Why

The public site currently holds visitors on an animated instruction mockup before the photo experience appears. That delay should instead reassure visitors that the photo collection is loading, without teaching controls that are only useful after the app is ready.

## What Changes

- Replace the instruction-oriented loading guide with a pineapple-themed loading animation.
- Show clear loading copy that tells users the photos are loading.
- Remove the tap/scroll/click/map/list/location instruction callouts from the initial load state.
- Keep the loading state responsive and accessible while preserving the current public photo experience after data loads.

## Capabilities

### New Capabilities

- `public-loading-experience`: Covers the public site's initial loading state before photo data and imagery are ready.

### Modified Capabilities

- None.

## Impact

- Affects `src/public/main.tsx` loading-state rendering and any helper functions that only exist to hold the instruction guide onscreen.
- Affects `src/public/styles.css` loading-state styling, animation, and responsive rules.
- No new runtime dependencies are expected.
- Verification should include typecheck/build plus a browser check of desktop and mobile loading states.

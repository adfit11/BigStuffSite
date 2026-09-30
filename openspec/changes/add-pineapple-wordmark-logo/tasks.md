# Tasks

## 1. Header Logo Markup

- [x] 1.1 Replace the plain `.site-title` heading with semantic logo lockup markup and verify the words “Big Stuff” remain real text in the DOM.
- [x] 1.2 Preserve the supporting public count copy in the header and verify it still displays with the current total photo count.

## 2. Pineapple Wordmark Styling

- [x] 2.1 Add a static pineapple mark for the header using code-native HTML/CSS and verify no new raster image asset is introduced.
- [x] 2.2 Style the “Big Stuff” wordmark so it is visually paired with the pineapple mark and verify the logo reads as one cohesive lockup.
- [x] 2.3 Ensure the header mark uses compatible shape, color, and styling cues from the existing pineapple loading spinner while keeping the header logo static.

## 3. Responsive Integration

- [x] 3.1 Verify the desktop map header logo fits without clipping or overlapping map controls, panel content, or the supporting count copy.
- [x] 3.2 Verify the mobile map header logo fits within the smaller header area without clipping or unreadable text.
- [x] 3.3 Verify reduced-motion styling still disables only loading-spinner motion and does not create header layout shifts.

## 4. Loading Preservation

- [x] 4.1 Verify the existing pineapple loading spinner still appears during the loading state with its loading text unchanged.
- [x] 4.2 Verify the loading spinner behavior is not replaced by, or coupled to, the static header logo.

## 5. Final Validation

- [x] 5.1 Run `npm run typecheck` and verify it passes.
- [x] 5.2 Run `npm test` and verify it passes.
- [x] 5.3 Run `npm run build` and verify it passes.
- [x] 5.4 Run `openspec validate "add-pineapple-wordmark-logo" --strict` and verify the change remains valid.

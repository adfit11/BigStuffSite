# Proposal

## Why

The public site currently uses a plain text heading in the map banner, while the loading experience already has a distinctive pineapple visual. A branded logo lockup can make the public site feel more cohesive by carrying that pineapple language into the main header without changing loading behavior.

## What Changes

- Replace the current public heading/banner treatment with a branded “Big Stuff” wordmark.
- Pair the words “Big Stuff” with a pineapple mark that shares the loading spinner’s visual language.
- Keep the logo polished, legible, and responsive across desktop and mobile map header layouts.
- Prefer an HTML/CSS implementation that avoids introducing a separate image asset unless implementation reveals a clear reason to do so.
- Preserve the existing pineapple loading spinner behavior and appearance.

## Capabilities

### New Capabilities

- `public-branding`: Defines the public site’s visible brand/logo treatment and how it appears in the public map header.

### Modified Capabilities

- None.

## Impact

- Affected code: `src/public/main.tsx` and `src/public/styles.css`, particularly the `site-title` map header and reusable pineapple styling.
- Visual behavior: the public map header becomes a compact logo/wordmark lockup instead of a plain text heading.
- Tests/verification: browser screenshots or smoke checks should verify desktop and mobile layout, text legibility, and that the loading spinner still works unchanged.

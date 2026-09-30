# Design

## Context

The public React app currently renders `LoadingGuide` while `loadState.status === "loading"`. That guide mimics the final map and photo-panel layout, includes pulsing instruction callouts, and is held onscreen by `MIN_LOADING_GUIDE_MS` plus `waitForUserInteraction(MAX_LOADING_GUIDE_MS)`. The loaded interface then shows Leaflet markers and large WebP photo assets from `public-data.json`.

## Goals / Non-Goals

**Goals:**

- Replace the instructional loading guide with a compact, branded loading component that is clear on desktop and mobile.
- Use a CSS-only pineapple-themed animation so the change adds no dependencies and works in the static Vite site.
- Let the app leave loading once initial data and the first likely visible photo are ready or have failed gracefully.
- Respect `prefers-reduced-motion` while keeping the loading state visually understandable.

**Non-Goals:**

- Redesign the loaded map, photo panel, filters, rail, markers, or lightbox.
- Add a full onboarding/tutorial flow elsewhere.
- Preload every photo in the collection before showing the app.
- Change the public data generation pipeline or photo derivative formats.

## Decisions

### Replace `LoadingGuide` with a purpose-built loader

Create a loading component that renders a centered pineapple loader, a primary message such as "Loading photos", and concise supporting copy. Remove the guide-specific mock map/panel structure and instruction callouts from the loading path.

Alternatives considered:

- Keep the mock layout but swap its labels. This would preserve unnecessary complexity and still feel like onboarding rather than loading feedback.
- Show only text. This would satisfy clarity but miss the requested pineapple-themed animation and make the wait feel more inert.

### Use CSS for the pineapple animation

Build the pineapple visual with semantic markup and CSS shapes/pseudo-elements: pineapple body, leaves, and a simple spin/pulse/bob animation. Add a `prefers-reduced-motion: reduce` rule that pauses or simplifies the motion.

Alternatives considered:

- Add an image or SVG asset. That is workable, but a CSS-only loader is easier to tune responsively and avoids adding asset pipeline work for a small state.
- Use a third-party spinner. This would add dependency weight and would not naturally express the pineapple theme.

### Base the transition on readiness, not interaction

Remove the `waitForUserInteraction` gate and the instruction-timing behavior. Keep the data fetch as the primary requirement, then give the browser a chance to load the initial visible large image before revealing the full interface. If that image cannot be preloaded, continue to the app rather than blocking indefinitely.

Implementation can derive the initial photo from the loaded data and URL query parameters using the same selection rules as the main app. Preload only that initial large image with an `Image` object and a bounded timeout so visitors are not trapped by a slow or broken asset.

Alternatives considered:

- Wait only for `public-data.json`. This is simple but does less to address the request to give photos time to load.
- Wait for every photo. This would make first paint hostage to the entire collection and scale poorly as more photos are added.

### Preserve the existing error state path

Keep the explicit error branch when public data cannot be loaded, but ensure it replaces the pineapple loading message with failure copy and remains accessible through the existing `main` container.

## Risks / Trade-offs

- Initial image preload may add a short wait on slow connections → Use a bounded timeout and continue if the image does not finish.
- CSS pineapple may look too decorative or too subtle at small sizes → Verify screenshots at desktop and mobile widths and keep dimensions stable.
- Removing the guide removes implicit first-use hints → Accept this because the request explicitly removes animated instructions on load; any future onboarding should be separate from loading.
- Reduced-motion styling may accidentally freeze the only visible state change → Keep text visible and make the static pineapple clearly read as a loading indicator.

## Migration Plan

1. Replace the loading component markup in `src/public/main.tsx`.
2. Remove interaction-gated loading helpers that are no longer used.
3. Add bounded initial-image readiness handling in the existing data load flow.
4. Replace guide CSS with pineapple-loader CSS and responsive/reduced-motion rules.
5. Run typecheck/build and verify the loading state in a browser at desktop and mobile sizes.

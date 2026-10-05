# Design

## Context

The public map header currently renders a floating `.site-title` card containing a plain `h1` with “Big Stuff” and supporting count text. The loading state already has a CSS-built pineapple made from `.pineapple-loader`, `.pineapple-crown`, and `.pineapple-body`; it is animated and has reduced-motion handling. The new header logo should borrow that visual language while leaving the loading indicator intact.

## Goals / Non-Goals

**Goals:**

- Replace the plain header heading with a compact logo lockup containing a pineapple mark and “Big Stuff” wordmark.
- Keep the mark visually related to the loading pineapple through shape, color, and styling.
- Make the lockup fit desktop and mobile map header constraints without clipping or crowding map controls.
- Avoid introducing a new raster image asset.

**Non-Goals:**

- Do not change the loading spinner’s timing, animation, markup role, or text.
- Do not redesign the full public layout, map, filter panel, or photo viewer.
- Do not add a site navigation system or broader brand guidelines.

## Decisions

### Use a code-native logo lockup

Create semantic header markup for a logo lockup inside `.site-title`, with a pineapple mark element and wordmark text. Implement the mark with HTML/CSS using the existing pineapple colors and simplified geometry sized for header use.

Alternative considered: generate a PNG/SVG logo asset. A code-native implementation fits the current spinner approach, stays crisp at different sizes, and avoids asset pipeline work for a small in-app brand mark.

### Separate static header mark from animated loading spinner

Share visual tokens and class patterns where practical, but keep the header mark as a static, compact variant rather than reusing `.pineapple-loader` directly. This avoids the header logo bobbing or glowing continuously and prevents reduced-motion changes from accidentally changing header layout.

Alternative considered: reuse `.pineapple-loader` directly at a smaller size. That risks carrying loading-specific animation and dimensions into the header, where the logo should behave as a stable brand element.

### Preserve existing header content hierarchy

Keep the existing count/supporting copy available below or beside the logo, but make the logo the primary first-viewport brand signal. The wordmark text should remain real text in the DOM for accessibility and crisp rendering.

Alternative considered: replace all header text with a purely decorative mark. That would weaken the brand name and require extra accessible labeling.

## Risks / Trade-offs

- Header may crowd the map on mobile -> Use responsive sizing and verify at mobile widths.
- Pineapple mark could diverge from spinner over time -> Centralize reusable color values or document related CSS blocks with clear naming.
- Static logo may feel less playful than the animated loader -> Preserve playfulness through shape/color/wordmark styling rather than motion.
- Text could overflow in narrow layouts -> Use fixed logo proportions, responsive type sizes, and browser screenshot checks.

## Migration Plan

1. Replace the `.site-title` heading markup with logo lockup markup while preserving the supporting count text.
2. Add CSS for the static pineapple mark and wordmark using existing palette cues.
3. Verify desktop and mobile screenshots for fit, legibility, and no overlap.
4. Verify the loading spinner still renders and animates/reduces motion as before.
5. Rollback is a code/CSS revert; no data migration is required.

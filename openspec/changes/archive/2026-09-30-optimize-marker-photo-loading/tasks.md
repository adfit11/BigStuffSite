# Tasks

## 1. Marker Readiness Planning

- [x] 1.1 Identify the initial filtered photo set before leaving the loading state and verify the helper returns the same photos used for initial selection/filter behavior with unit coverage or existing filter smoke checks.
- [x] 1.2 Add a deduped marker URL collection helper for the initial photo set and verify it returns marker derivative URLs, not large or thumb derivative URLs.

## 2. Loading Pipeline

- [x] 2.1 Implement bounded marker image preloading with success, error, and timeout resolution paths and verify each path with focused tests or deterministic browser checks.
- [x] 2.2 Wire marker image readiness into the existing pineapple loading flow alongside featured-photo readiness and verify the public interface is not rendered until the marker readiness promise resolves.
- [x] 2.3 Preserve public data error handling and verify a failed `public-data.json` request still replaces the spinner with the error state.

## 3. Marker Asset Optimization

- [x] 3.1 Inspect current marker derivative dimensions and file sizes, tune `scripts/generate-marker-derivatives.ts` only if needed, and verify generated markers remain sized/compressed for 46px map markers.
- [x] 3.2 Ensure map marker HTML continues to use marker derivatives as eager initial-view assets and verify the rendered marker image URLs point at `/photos/markers/*.webp`.

## 4. Integration Verification

- [x] 4.1 Run `npm run typecheck` and verify it passes.
- [x] 4.2 Run `npm test` and verify it passes.
- [x] 4.3 Run `npm run build` and verify public data, marker generation, and the site build all pass.
- [x] 4.4 Run desktop and mobile browser smoke checks and verify the pineapple spinner remains visible until marker-photo readiness completes, then the map/list interface appears without user interaction.
- [x] 4.5 Run `openspec validate "optimize-marker-photo-loading" --strict` and verify the change remains valid.

# Tasks

## 1. Featured Photo Map Framing

- [x] 1.1 Add a dedicated featured-photo context zoom constant in `src/public/main.tsx`, update the featured-photo `map.flyTo` call to use it, and verify the selected photo still centers while the destination zoom is broader than `CLUSTER_DISABLE_ZOOM`
- [x] 1.2 Confirm cluster expansion still uses `CLUSTER_DISABLE_ZOOM` in the cluster marker `fitBounds` path and verify no marker clustering, marker spreading, filtering, photo ordering, URL, or layout logic was changed
- [x] 1.3 Run `npm test` and `npm run typecheck` and verify both commands pass
- [x] 1.4 Run the public site locally and verify on desktop and mobile-sized viewports that navigating between photos shows surrounding land context while keeping the selected marker visible

# Proposal

## Why

Navigating to a featured photo currently zooms the public map into a tight local view, which hides the surrounding land context that helps visitors understand where the photo sits geographically. The desired change is small: keep the existing photo navigation and marker behavior, but make automatic photo navigation land on a wider, geographically generous map view.

## What Changes

- Adjust the map's automatic featured-photo navigation so it centers the selected photo at a broader context zoom rather than forcing the close cluster/detail zoom.
- Keep existing photo selection, filtering, marker rendering, clustering, cluster expansion, list sync, and mobile rail behavior intact.
- Introduce no new controls, layouts, assets, APIs, or dependencies.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `public-photo-selection`: Add map framing behavior for selected photos so synchronized photo navigation shows more surrounding land context.

## Impact

- Affected code: `src/public/main.tsx`, specifically the `PhotoMap` featured-photo `flyTo` behavior.
- Affected tests: add focused coverage for the chosen featured-photo navigation zoom behavior if practical, or verify via existing public app tests plus a manual map interaction check.
- No API, data model, asset pipeline, dependency, or deployment changes are expected.

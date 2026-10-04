# Design

## Context

`PhotoMap` currently uses Leaflet for marker rendering and synchronized map movement. The featured-photo effect calls `map.flyTo` with `Math.max(map.getZoom(), CLUSTER_DISABLE_ZOOM)`, so selecting a photo forces the map to at least the same close zoom used to break clusters apart.

## Goals / Non-Goals

**Goals:**

- Make featured-photo navigation land on a wider, geographically generous map view.
- Keep cluster expansion and marker display behavior unchanged.
- Keep the implementation limited to the public map component.

**Non-Goals:**

- No new map controls or user preferences.
- No changes to photo ordering, filtering, URL state, marker assets, or layout.
- No replacement of Leaflet or map tile behavior.

## Decisions

- Add a dedicated featured-photo context zoom constant and use it for automatic featured-photo `flyTo` calls.
  - Rationale: featured-photo framing and cluster detail are different behaviors, so they should not share `CLUSTER_DISABLE_ZOOM`.
  - Alternative considered: lower `CLUSTER_DISABLE_ZOOM`. This would also change clustering behavior, which is outside the intended scope.

- Use a broad fixed context zoom for automatic photo navigation.
  - Rationale: the request is to simply zoom out enough that more surrounding land is in frame; a fixed zoom keeps the change small and predictable.
  - Alternative considered: compute dynamic bounds around each photo. That is more complex and unnecessary for this change.

## Risks / Trade-offs

- Chosen zoom feels too broad or too tight on one viewport -> Mitigation: verify the selected photo remains easy to locate on desktop and mobile, then adjust the single featured-photo context zoom constant if needed.
- Existing manual zoom state is overridden when the featured photo changes -> Mitigation: preserve the current synchronized navigation model and only change the automatic destination zoom.

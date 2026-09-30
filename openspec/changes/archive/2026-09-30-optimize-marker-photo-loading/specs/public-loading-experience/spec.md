# Spec Delta

## ADDED Requirements

### Requirement: Marker photos are optimized for initial map display
The public site SHALL provide small marker photo assets that are optimized for the map markers shown in the initial public photo experience.

#### Scenario: Initial marker photos are requested
- **WHEN** the public app prepares the first map view
- **THEN** it uses the marker photo derivatives for map marker images instead of larger display photos
- **AND** those marker images are eligible to load promptly as initial-view assets

#### Scenario: Marker assets are generated
- **WHEN** marker photo derivatives are generated for public photos
- **THEN** each marker derivative is sized and compressed for small map marker display

## MODIFIED Requirements

### Requirement: Loading state transitions without user interaction
The public site SHALL transition from the loading state to the photo interface once the initial photo experience is ready, without requiring the visitor to click, tap, scroll, press a key, or wait for instruction timing. The initial photo experience SHALL include the featured photo and the small marker photos needed for the first map view, subject to bounded fallback behavior for failed or slow marker image requests.

#### Scenario: Initial photo experience is ready
- **WHEN** the public data, featured photo, and initial marker photos are ready
- **THEN** the page shows the photo interface without waiting for visitor interaction

#### Scenario: Initial marker photo cannot load promptly
- **WHEN** one or more initial marker photos fail to load or exceed the bounded readiness timeout
- **THEN** the page exits the loading state and shows the photo interface without leaving the visitor in an indefinite loading state

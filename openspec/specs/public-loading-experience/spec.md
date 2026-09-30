# public-loading-experience Specification

## Purpose

Defines the public site's initial loading experience so visitors receive clear, branded feedback while photo data and initial imagery become ready.

## Requirements

### Requirement: Loading state communicates photo readiness
The public site SHALL show an initial loading state that explicitly tells visitors the photos are loading until the photo experience is ready to display.

#### Scenario: Visitor opens the public site while photos are loading
- **WHEN** the public app has not finished preparing the initial photo experience
- **THEN** the page presents loading text that tells the visitor the photos are loading

#### Scenario: Public data cannot be loaded
- **WHEN** the public photo data fails to load
- **THEN** the page replaces the loading message with an error message instead of leaving the visitor in an indefinite loading state

### Requirement: Loading animation uses pineapple theming
The public site SHALL include an animated loading indicator whose visual theme is recognizable as a pineapple.

#### Scenario: Loading state is displayed
- **WHEN** the initial loading state is visible
- **THEN** the loading indicator is animated and visually themed around a pineapple

#### Scenario: Motion-sensitive visitor views the loading state
- **WHEN** the visitor has requested reduced motion
- **THEN** the loading state remains understandable without relying on continuous motion

### Requirement: Loading state omits instruction guide content
The public site SHALL NOT show onboarding-style instructions during the initial loading state.

#### Scenario: Loading state is displayed
- **WHEN** the initial loading state is visible
- **THEN** the page does not show tap, scroll, map selection, image click, location visit, or list scrolling instructions

### Requirement: Marker photos are optimized for initial map display
The public site SHALL provide small marker photo assets that are optimized for the map markers shown in the initial public photo experience.

#### Scenario: Initial marker photos are requested
- **WHEN** the public app prepares the first map view
- **THEN** it uses the marker photo derivatives for map marker images instead of larger display photos
- **AND** those marker images are eligible to load promptly as initial-view assets

#### Scenario: Marker assets are generated
- **WHEN** marker photo derivatives are generated for public photos
- **THEN** each marker derivative is sized and compressed for small map marker display

### Requirement: Loading state transitions without user interaction
The public site SHALL transition from the loading state to the photo interface once the initial photo experience is ready, without requiring the visitor to click, tap, scroll, press a key, or wait for instruction timing. The initial photo experience SHALL include the featured photo and the small marker photos needed for the first map view, subject to bounded fallback behavior for failed or slow marker image requests.

#### Scenario: Initial photo experience is ready
- **WHEN** the public data, featured photo, and initial marker photos are ready
- **THEN** the page shows the photo interface without waiting for visitor interaction

#### Scenario: Initial marker photo cannot load promptly
- **WHEN** one or more initial marker photos fail to load or exceed the bounded readiness timeout
- **THEN** the page exits the loading state and shows the photo interface without leaving the visitor in an indefinite loading state

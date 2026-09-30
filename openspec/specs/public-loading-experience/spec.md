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

### Requirement: Loading state transitions without user interaction
The public site SHALL transition from the loading state to the photo interface once the initial photo experience is ready, without requiring the visitor to click, tap, scroll, press a key, or wait for instruction timing.

#### Scenario: Initial photo experience is ready
- **WHEN** the public data and initial display needs are ready
- **THEN** the page shows the photo interface without waiting for visitor interaction

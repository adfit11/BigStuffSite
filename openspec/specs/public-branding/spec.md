# Public Branding Specification

## Purpose

Defines the public site's visible brand treatment so the map header presents a recognizable Big Stuff logo that fits the existing public experience.

## Requirements

### Requirement: Public header displays a branded Big Stuff logo
The public site SHALL replace the current plain heading treatment in the public map header with a branded logo lockup that includes the words “Big Stuff”.

#### Scenario: Public map header is visible
- **WHEN** the public photo interface is displayed
- **THEN** the map header presents “Big Stuff” as a clear wordmark
- **AND** the wordmark is paired with a pineapple mark

### Requirement: Logo uses the pineapple loading visual language
The public logo SHALL use a pineapple mark that visually relates to the existing pineapple loading indicator.

#### Scenario: Visitor compares loading and header branding
- **WHEN** the visitor sees the loading indicator and later sees the public map header
- **THEN** the header logo uses compatible pineapple shape, color, and styling cues
- **AND** the existing loading indicator behavior and appearance remain unchanged

### Requirement: Logo is responsive and legible
The public logo SHALL remain readable and visually balanced in the public map header across desktop and mobile layouts.

#### Scenario: Desktop visitor views the public map header
- **WHEN** the public map header is displayed on a desktop viewport
- **THEN** the pineapple mark and “Big Stuff” wordmark fit within the header without overlapping map controls or panel content

#### Scenario: Mobile visitor views the public map header
- **WHEN** the public map header is displayed on a mobile viewport
- **THEN** the pineapple mark and “Big Stuff” wordmark fit within the smaller header area without clipping or unreadable text

### Requirement: Logo avoids unnecessary image assets
The public logo SHALL be implemented without a separate raster image asset unless a code-based implementation cannot meet the visual and responsive requirements.

#### Scenario: Logo is implemented with code-native styling
- **WHEN** the public header logo is rendered
- **THEN** it does not depend on a new raster image file
- **AND** it remains crisp at desktop and mobile display sizes

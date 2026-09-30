# Spec Delta

## Purpose

Defines how the public site selects the featured photo and keeps that selection consistent across desktop and mobile browsing surfaces.

## ADDED Requirements

### Requirement: Default selection uses the most recent matching photo
The public site SHALL select the most recent matching photo as the featured photo when the visitor opens the site without a valid explicit photo selection.

#### Scenario: Desktop visitor opens the public site without a photo parameter
- **WHEN** a desktop visitor opens the public site and the URL does not name a valid photo
- **THEN** the desktop photo viewer features the matching photo with the most recent `takenAt` value
- **AND** the desktop title list marks that same photo as active

#### Scenario: Mobile visitor opens the public site without a photo parameter
- **WHEN** a mobile visitor opens the public site and the URL does not name a valid photo
- **THEN** the mobile photo rail features the matching photo with the most recent `takenAt` value
- **AND** the mobile rail positions that same photo as the active item

#### Scenario: Filters leave a different matching set
- **WHEN** filtering changes the set of matching photos and the current featured photo no longer matches
- **THEN** the public site features the most recent photo in the filtered matching set

### Requirement: Explicit photo selection is preserved
The public site SHALL preserve a valid explicit photo selection from the URL instead of replacing it with the most recent photo.

#### Scenario: URL names a matching photo
- **WHEN** the URL contains a `photo` parameter for a photo that matches the current filters
- **THEN** the public site features that photo
- **AND** the desktop title list or mobile rail marks that same photo as active

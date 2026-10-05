# Spec Delta

## ADDED Requirements

### Requirement: Browsing order uses newest-first chronology
The public site SHALL present matching photos in newest-first chronological order on browsing surfaces that list or scroll through photos.

#### Scenario: Desktop visitor views the title list
- **WHEN** a desktop visitor views matching photos in the title list
- **THEN** the list shows photos ordered by `takenAt` from newest to oldest

#### Scenario: Mobile visitor views the photo rail
- **WHEN** a mobile visitor views matching photos in the photo rail
- **THEN** the rail shows photos ordered by `takenAt` from newest to oldest

#### Scenario: Filters change the matching set
- **WHEN** filtering changes the matching photo set
- **THEN** the remaining matching photos stay ordered by `takenAt` from newest to oldest

## MODIFIED Requirements

### Requirement: Default selection uses the most recent matching photo
The public site SHALL select the most recent matching photo as the featured photo when the visitor opens the site without a valid explicit photo selection. The active item in desktop and mobile browsing surfaces SHALL align with the newest-first chronological order of the matching photo set.

#### Scenario: Desktop visitor opens the public site without a photo parameter
- **WHEN** a desktop visitor opens the public site and the URL does not name a valid photo
- **THEN** the desktop photo viewer features the matching photo with the most recent `takenAt` value
- **AND** the desktop title list marks that same photo as active
- **AND** that photo appears before older matching photos in the title list

#### Scenario: Mobile visitor opens the public site without a photo parameter
- **WHEN** a mobile visitor opens the public site and the URL does not name a valid photo
- **THEN** the mobile photo rail features the matching photo with the most recent `takenAt` value
- **AND** the mobile rail positions that same photo as the active item
- **AND** that photo appears before older matching photos in the rail

#### Scenario: Filters leave a different matching set
- **WHEN** filtering changes the set of matching photos and the current featured photo no longer matches
- **THEN** the public site features the most recent photo in the filtered matching set
- **AND** the filtered browsing surfaces show matching photos from newest to oldest

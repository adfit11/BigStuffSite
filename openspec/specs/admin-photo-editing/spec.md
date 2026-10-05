# Admin Photo Editing Specification

## Purpose

Defines how administrators edit photo metadata used for publication, including predictable taken date and time overrides for chronology-sensitive photo ordering.

## Requirements

### Requirement: Taken timestamp is editable as separate date and time parts
The admin photo editor SHALL present separate controls for a photo's taken date and taken time while continuing to save the effective override as one `takenAtOverride` timestamp.

#### Scenario: Administrator views an imported timestamp
- **WHEN** an administrator opens a photo without a taken timestamp override
- **THEN** the editor shows the imported photo's taken date in the date control
- **AND** the editor shows the imported photo's taken time in the time control

#### Scenario: Administrator views an overridden timestamp
- **WHEN** an administrator opens a photo with a taken timestamp override
- **THEN** the editor shows the override's taken date in the date control
- **AND** the editor shows the override's taken time in the time control

#### Scenario: Administrator changes only the taken date
- **WHEN** an administrator changes the taken date and leaves the taken time unchanged
- **THEN** the editor saves a taken timestamp override using the new date
- **AND** the saved override preserves the previously displayed time
- **AND** the saved override does not shift the displayed date or time because of the browser timezone

#### Scenario: Administrator changes only the taken time
- **WHEN** an administrator changes the taken time and leaves the taken date unchanged
- **THEN** the editor saves a taken timestamp override using the new time
- **AND** the saved override preserves the previously displayed date
- **AND** the saved override does not shift the displayed date or time because of the browser timezone

### Requirement: Partial or invalid timestamp edits do not corrupt chronology
The admin photo editor SHALL avoid replacing the effective taken timestamp with an invalid or partial timestamp when date or time input is empty or invalid.

#### Scenario: Administrator clears the date control
- **WHEN** an administrator clears the taken date control without entering a valid replacement date
- **THEN** the editor does not save an invalid taken timestamp override
- **AND** the photo keeps its previous effective taken timestamp for admin ordering and publication data

#### Scenario: Administrator clears the time control
- **WHEN** an administrator clears the taken time control without entering a valid replacement time
- **THEN** the editor does not save an invalid taken timestamp override
- **AND** the photo keeps its previous effective taken timestamp for admin ordering and publication data

#### Scenario: Existing timestamp is invalid
- **WHEN** the photo's effective taken timestamp cannot be parsed into valid date and time parts
- **THEN** the editor leaves the date and time controls empty
- **AND** the editor does not create a taken timestamp override until valid date and time values are available

### Requirement: Admin date sorting uses the effective date and time
The admin photo queue SHALL order photos by the full effective taken timestamp, including the time of day, when date sorting is selected.

#### Scenario: Same-day photos have different times
- **WHEN** the admin photo queue is sorted by date
- **AND** two visible photos have the same taken date but different taken times
- **THEN** the photo with the earlier effective taken time appears before the photo with the later effective taken time

#### Scenario: Time edit changes same-day order
- **WHEN** an administrator changes a photo's taken time so it moves earlier or later than another visible photo on the same date
- **THEN** the admin photo queue date order reflects the updated effective taken timestamp

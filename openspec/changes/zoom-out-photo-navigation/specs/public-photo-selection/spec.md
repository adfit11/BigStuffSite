# Spec Delta

## ADDED Requirements

### Requirement: Featured photo navigation uses geographically generous map framing
The public site SHALL center the map on the featured photo using a geographically generous zoom level that shows surrounding land context instead of forcing a tight local-detail view.

#### Scenario: Visitor navigates to a featured photo
- **WHEN** a visitor changes the featured photo through the public photo interface or opens a URL that selects a photo
- **THEN** the map centers on the featured photo
- **AND** the map shows surrounding land context around that photo rather than a close street-scale view

#### Scenario: Visitor expands a cluster
- **WHEN** a visitor selects a cluster marker on the map
- **THEN** the map can still zoom into the cluster far enough to reveal the nearby photo markers

# Big Stuff Site

A personal photo-map website that presents a curated photo album as a chronological journey across locations.

## Language

**Album**:
A curated set of photos that belongs together as one browsable journey.
_Avoid_: Gallery, collection

**Photo Entry**:
One record in the site's update file, representing a single photo and its display metadata.
_Avoid_: Item, row, marker

**Photo ID**:
A stable identifier for a photo entry derived from the image file's content, so the same photo keeps its identity even if renamed.
_Avoid_: Filename, row ID

**Source Photo**:
A full-size downloaded image file used as local input for import and derivative generation; source photos are not committed or published.
_Avoid_: Public photo, derivative

**Photo Derivative**:
An optimized public image generated from a source photo for visitor-facing display.
_Avoid_: Source photo, original

**Update File**:
The text data file replaced when the album changes; it contains the photo entries the site renders.
_Avoid_: Database, feed

**Admin Interface**:
A private editing surface used by the site owner to add or revise human-authored metadata for photo entries.
_Avoid_: CMS, dashboard

**Public Site**:
The static viewer that visitors use to browse the photo map and chronological list.
_Avoid_: Admin site, editor

**Description**:
Human-authored text that explains or captions a photo entry.
_Avoid_: Caption, notes

**Title**:
A required human-authored name for a photo entry before it can appear on the public site.
_Avoid_: Filename, heading

**Tag**:
A short human-authored label that groups photo entries for browsing and filtering; a photo entry may have multiple tags.
_Avoid_: Category, keyword

**Tag List**:
The fixed set of tags available for assigning to photo entries and filtering the public site.
_Avoid_: Tag suggestions, free-form tags

**Tag Filter**:
A public-site filter that shows only photo entries containing every selected tag.
_Avoid_: Search, category filter

**Featured Photo Entry**:
The photo entry currently emphasized in the public site, synchronized between the chronological list and map.
_Avoid_: Selected photo, active item

**Photo List**:
The chronological public-site navigation list that displays photo entry titles.
_Avoid_: Feed, gallery

**Photo Viewer**:
The public-site view that presents the featured photo entry with its image, title, metadata, tags, and optional description.
_Avoid_: Modal, gallery

**Photo Rail**:
The mobile horizontal photo navigation surface where fast swiping moves through photo entries and the centered photo becomes featured.
_Avoid_: Carousel, slideshow

**Marker Spread**:
A display-only offset applied to overlapping or very close map markers so individual photo entries remain clickable without changing their stored coordinates.
_Avoid_: Cluster, adjusted location


**Owner**:
The person who manages photo entries, edits editorial metadata, and controls the tag list through the admin interface.
_Avoid_: User, visitor

**Publishable Photo Entry**:
A photo entry with coordinates, a display location name, a title, and at least one tag; only publishable photo entries appear on the public site.
_Avoid_: Complete photo, approved photo

**Incomplete Photo Entry**:
A photo entry missing one or more publishability requirements and therefore shown for owner attention in the admin interface.
_Avoid_: Draft, unpublished photo

**Detected Location Name**:
A machine-generated place name derived from a photo entry's coordinates.
_Avoid_: Location

**Display Location Name**:
The place name shown to visitors, using the owner's correction when present and the detected location name otherwise.
_Avoid_: Corrected location, label

**Taken Date**:
The date a photo entry is shown under in chronological browsing, preferably imported from EXIF and owner-correctable when needed.
_Avoid_: File date, upload date

**Unmapped Photo Entry**:
A photo entry without coordinates; it remains browsable but has no map marker until the owner adds coordinates.
_Avoid_: Invalid photo, skipped photo

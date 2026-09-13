Status: ready-for-agent
Labels: ready-for-agent

# PRD: Personal Photo Map Site

## Problem Statement

The owner has a particular Google Photos album they want to turn into a personal website, but Google Photos links and APIs are not a reliable source of all required metadata. The owner needs a way to download chosen photos, import their embedded metadata, enrich them locally with titles, descriptions, tags, and corrected locations, then publish a static map-based Public Site without exposing incomplete edits or full-size Source Photos.

## Solution

Build a Vite, React, and TypeScript application with three local workflows: import Source Photos, edit editorial metadata in a local Admin Interface, and build a static Public Site for GitHub Pages. The importer reads local Source Photos, creates stable Photo IDs from content hashes, extracts Taken Date and GPS metadata, reverse-geocodes coordinates into Detected Location Names, generates Photo Derivatives, and writes generated imported data. The Admin Interface lets the Owner add Titles, optional Descriptions, Tags from a fixed Tag List, coordinate corrections, Display Location Names, and Taken Date corrections. A build step merges imported and editorial data by Photo ID and emits public data containing only Publishable Photo Entries.

The Public Site presents the Album as a chronological journey. On desktop, a Leaflet/OpenStreetMap world map dominates the layout, with a feature panel and title-only Photo List beside it. On mobile, the map appears above a fast horizontal Photo Rail with no title list. Markers are thumbnail-based, filtered-out markers are hidden, overlapping markers use Marker Spread rather than clustering, and the Featured Photo Entry stays synchronized across map, list, rail, filters, URLs, and lightbox navigation.

## User Stories

1. As an Owner, I want to download selected photos from Google Photos and place them in a local Source Photo folder, so that I can control exactly which photos enter the Album.
2. As an Owner, I want Source Photos ignored by git, so that full-size originals are not committed or published.
3. As an Owner, I want to run an import command, so that new Source Photos become Photo Entries without manual transcription.
4. As an Owner, I want the importer to generate Photo IDs from file content, so that renamed files keep their editorial metadata.
5. As an Owner, I want exact duplicate Source Photos skipped and reported, so that duplicate files do not create duplicate Photo Entries.
6. As an Owner, I want unsupported files skipped and reported, so that one bad file does not fail the whole import.
7. As an Owner, I want the importer to support JPEG, PNG, and WebP, so that common downloaded image formats work without HEIC/HEIF complexity.
8. As an Owner, I want the importer to extract Taken Date from EXIF where possible, so that the Album is chronologically ordered from the original photo metadata.
9. As an Owner, I want file modified time used only as a fallback Taken Date, so that photos without EXIF still enter the workflow.
10. As an Owner, I want lower-confidence dates to be correctable in admin, so that ordering can be fixed manually.
11. As an Owner, I want the importer to extract GPS coordinates where present, so that mapped photos can appear on the Public Site.
12. As an Owner, I want Unmapped Photo Entries imported but kept incomplete, so that I can add coordinates later.
13. As an Owner, I want reverse-geocoding to create Detected Location Names, so that I do not have to type every place name by hand.
14. As an Owner, I want reverse-geocoding cached by coordinates rounded to five decimal places, so that repeated imports avoid unnecessary network lookups without blurring distinct places too much.
15. As an Owner, I want failed reverse-geocoding to leave a photo incomplete, so that admin can add a Display Location Name before publication.
16. As an Owner, I want imported data separated from editorial data, so that rerunning imports never overwrites Titles, Descriptions, Tags, or corrections.
17. As an Owner, I want the Admin Interface to be local-only, so that editing controls and incomplete photos are not exposed on GitHub Pages.
18. As an Owner, I want the Admin Interface to save changes through a local server, so that a Save button can write editorial data directly.
19. As an Owner, I want explicit Save behavior, so that edits are only committed when I choose.
20. As an Owner, I want warnings for unsaved changes, so that I do not lose edits when switching photos or closing admin.
21. As an Owner, I want admin to open to Incomplete Photo Entries, so that I can quickly finish photos that are not yet publishable.
22. As an Owner, I want an All Photos admin view, so that I can inspect every imported photo regardless of publishability.
23. As an Owner, I want status badges in All Photos, so that I can distinguish Publishable Photo Entries from Incomplete Photo Entries.
24. As an Owner, I want a Tags admin view, so that I can manage the fixed Tag List.
25. As an Owner, I want only the Admin Interface to create and manage Tags, so that public filtering vocabulary stays controlled.
26. As an Owner, I want a Photo Entry to support multiple Tags, so that one photo can belong to several browsing groups.
27. As an Owner, I want tag deletion blocked while a Tag is in use, so that existing Publishable Photo Entries do not become incomplete accidentally.
28. As an Owner, I want usage counts for Tags, so that I understand the effect of changing the Tag List.
29. As an Owner, I want a side-panel editor for a Photo Entry, so that I can edit metadata while keeping photo context visible.
30. As an Owner, I want direct latitude and longitude fields, so that I can add or correct coordinates precisely.
31. As an Owner, I want a read-only map preview in admin, so that I can catch coordinate mistakes.
32. As an Owner, I want to add a required Title to each Photo Entry, so that every public photo has a meaningful name.
33. As an Owner, I want to add an optional Description, so that some photos can include extra context without forcing every photo to have one.
34. As an Owner, I want to correct Display Location Names, so that public location labels can be more natural than machine-generated names.
35. As an Owner, I want only located, titled, and tagged Photo Entries published, so that incomplete imports remain private.
36. As an Owner, I want a build step that emits public data from imported and editorial data, so that the Public Site only receives Publishable Photo Entries.
37. As an Owner, I want public image derivatives generated from Source Photos, so that visitors do not load full-resolution originals.
38. As an Owner, I want thumbnail derivatives around 320px wide, so that admin and map thumbnails load quickly.
39. As an Owner, I want large derivatives around 1800px wide, so that the viewer and lightbox look good without excessive file size.
40. As an Owner, I want generated derivatives committed initially, so that GitHub Pages can deploy without image processing in CI.
41. As a visitor, I want a zoomable world map, so that I can explore where the Album photos were taken.
42. As a visitor, I want markers to use photo thumbnails, so that the map feels like a photo journey.
43. As a visitor, I want the Featured Photo Entry marker to have a visible ring, so that I can see which map location matches the current photo.
44. As a visitor, I want overlapping markers spread visually, so that individual nearby photos remain clickable.
45. As a visitor, I want marker coordinates to remain accurate despite visual spread, so that the underlying location data is trustworthy.
46. As a visitor, I want no marker clustering, so that individual Photo Entries stay directly represented on the map.
47. As a visitor, I want clicking a marker to feature that Photo Entry, so that the map can drive browsing.
48. As a visitor, I want the map to softly pan and zoom to the Featured Photo Entry, so that map context follows my browsing without feeling jumpy.
49. As a desktop visitor, I want the map on the left and photo controls on the right, so that I can browse the journey spatially and chronologically.
50. As a desktop visitor, I want a feature panel beside the map, so that the Featured Photo Entry is easy to inspect.
51. As a desktop visitor, I want a title-only chronological Photo List, so that I can jump through the Album without visual clutter.
52. As a desktop visitor, I want the centered list item to become the Featured Photo Entry, so that scrolling naturally drives the viewer.
53. As a desktop visitor, I want the featured item to animate larger in the feature panel, so that the selection change feels clear.
54. As a desktop visitor, I want clicking the feature image to open a lightbox, so that I can inspect the photo larger.
55. As a mobile visitor, I want the map panel above the Photo Viewer, so that the world-map identity remains visible on small screens.
56. As a mobile visitor, I want no title list, so that limited screen space is not consumed by desktop navigation.
57. As a mobile visitor, I want a fast horizontal Photo Rail, so that I can move through many photos quickly.
58. As a mobile visitor, I want Photo Rail momentum, so that rapid swiping can navigate or scroll through photos very fast.
59. As a mobile visitor, I want the centered rail photo to become featured, so that the map and metadata stay synchronized with browsing.
60. As a mobile visitor, I want tapping a marker to bring up that photo in the Photo Viewer, so that map exploration controls the photo panel.
61. As a visitor, I want Tag Filters visible, so that I can narrow the Album by themes.
62. As a visitor, I want multiple selected Tags to require all selected Tags, so that filtering narrows the result set precisely.
63. As a visitor, I want filtered-out markers hidden, so that the map and photo views describe the same set.
64. As a visitor, I want the Featured Photo Entry to move to the first matching photo when filters remove the current one, so that the page never points at an invisible photo.
65. As a desktop visitor, I want the Photo List to scroll to the new Featured Photo Entry after filter changes, so that the list remains oriented.
66. As a visitor, I want an empty filtered state when no photos match, so that I understand why no photos are visible.
67. As a visitor, I want a clear way to remove filters, so that I can recover from an empty filtered state.
68. As a visitor, I want the Album ordered oldest to newest, so that it reads like a journey.
69. As a visitor, I want tied Taken Dates ordered deterministically by Title and Photo ID, so that the order is stable.
70. As a visitor, I want friendly day-level dates shown publicly, so that dates are readable without unnecessary timestamp detail.
71. As a visitor, I want the URL to capture selected Tags and Featured Photo Entry, so that I can reload or share a specific view.
72. As a visitor, I want URL photo selection to respect filters first, so that filtered views remain coherent.
73. As a visitor, I want lightbox next/previous navigation within the current filtered set, so that larger viewing honors my active filter.
74. As a site maintainer, I want GitHub Pages deployment, so that the Public Site can be hosted as static output.
75. As a site maintainer, I want a simple local workflow for import, admin, build, and push, so that updates are repeatable without a backend.

## Implementation Decisions

- Build the app with Vite, React, and TypeScript.
- Use one codebase with separate public and admin entry points.
- Keep the Admin Interface local-only and exclude it from the GitHub Pages deployment.
- Use a local Node server for the Admin Interface so Save can write editorial data.
- Use Node/TypeScript for importer and build scripts.
- Store Source Photos in a git-ignored local folder.
- Generate Photo IDs from content hashes rather than filenames.
- Preserve original filenames as metadata but do not use filenames as identity.
- Support JPEG, PNG, and WebP imports. HEIC/HEIF is out of scope.
- Skip exact duplicate files and report them in the import summary.
- Skip unsupported files and report them without failing the import.
- Extract Taken Date from EXIF `DateTimeOriginal` where present.
- Fall back to file modified time for Taken Date when EXIF date is missing, and allow admin correction.
- Extract GPS coordinates from image metadata where present.
- Import photos without GPS as Unmapped Photo Entries, but do not publish them until coordinates and a Display Location Name are added.
- Use OpenStreetMap Nominatim for local reverse-geocoding during import.
- Cache reverse-geocoding results by coordinates rounded to five decimal places.
- Use throttled, identified Nominatim requests during local import.
- Treat failed reverse-geocoding as an incomplete metadata state, not an import failure.
- Separate generated imported photo data from owner-authored editorial data.
- The importer never edits editorial data; the Admin Interface is the only writer of editorial data.
- Build public data by merging imported and editorial data by Photo ID.
- Emit only Publishable Photo Entries into public data.
- Require coordinates, Display Location Name, Title, and at least one Tag for publishability.
- Keep Description optional.
- Use a fixed Tag List managed only in admin.
- Allow multiple Tags per Photo Entry.
- Implement Tag Filters as all-selected-tags matching.
- Block deletion of Tags that are currently assigned to Photo Entries.
- Use a side-panel editor in admin.
- Use direct latitude/longitude fields for coordinate editing.
- Include a read-only map preview in admin.
- Do not include a public preview mode in admin.
- Generate public Photo Derivatives from Source Photos.
- Generate thumbnails at approximately 320px wide and large images at approximately 1800px wide.
- Preserve aspect ratio in Photo Derivatives.
- Strip unnecessary metadata from public Photo Derivatives while retaining needed metadata in generated data.
- Commit public Photo Derivatives initially rather than generating them in GitHub Actions.
- Deploy the Public Site to GitHub Pages.
- Use Leaflet with OpenStreetMap tiles for the public map.
- Use thumbnail markers at all zoom levels.
- Use Marker Spread for overlapping or very close markers, not clustering.
- Hide filtered-out markers.
- Synchronize Featured Photo Entry across map, desktop Photo List, mobile Photo Rail, feature panel, URL state, and lightbox.
- Desktop layout is map-left, right sidebar with feature panel above a title-only Photo List.
- Mobile layout is map panel above a Photo Viewer/Photo Rail, with no title list.
- Mobile Photo Rail supports fast momentum horizontal browsing.
- Public dates display at friendly day-level granularity while retaining richer internal ordering data.
- Lightbox navigation operates within the current filtered set.
- URL state includes selected Tags and Featured Photo Entry.

## Testing Decisions

- Test through external behavior rather than implementation details: given Source Photos, editorial data, and filters, assert generated outputs and visible interactions.
- Primary test seam: the generated public artifact. Build public data from imported and editorial fixtures and assert that only Publishable Photo Entries appear, sorted oldest to newest, with correct merged fields, derivative paths, tags, and locations.
- Importer tests should use small fixture images with known metadata to assert Photo ID stability, duplicate skipping, EXIF date extraction, missing metadata behavior, unsupported file reporting, derivative generation, and geocode-cache behavior.
- Reverse-geocoding tests should mock the provider and verify throttling/caching behavior without hitting Nominatim.
- Admin tests should exercise the local server API from the outside: reading imported/editorial data, saving editorial changes, rejecting invalid tag deletion, preserving unsaved-change behavior at the UI level, and leaving imported data untouched.
- Public desktop tests should use browser-level tests to verify marker clicks feature photos, list scrolling changes the Featured Photo Entry, filters hide markers and update the feature, URL state restores valid views, invalid URL photo IDs fall back, and lightbox navigation respects filters.
- Public mobile tests should use browser-level tests to verify the stacked map/photo layout, absence of the title list, Photo Rail swiping, marker-to-photo synchronization, and visible Tag Filters.
- Visual smoke tests should cover desktop and mobile layouts to catch overlapping UI, blank maps, missing marker thumbnails, and broken image derivatives.
- There is no existing application test prior art in the repo yet, so the initial implementation should establish the test conventions alongside the first feature slices.

## Out of Scope

- Direct Google Photos API integration.
- Scraping metadata from public Google Photos links.
- Hosting or committing full-size Source Photos.
- HEIC/HEIF import support.
- A deployed Admin Interface.
- Browser-based writes back to GitHub or repository files.
- Login/authentication for admin.
- GitHub Actions image processing in the first version.
- Mapbox or Google Maps provider integration.
- Marker clustering.
- Public display of Incomplete Photo Entries.
- Public preview inside admin.
- Collaborative editing or multiple Owner accounts.

## Further Notes

- GitHub Pages should be treated as public static hosting. Obscure URLs are not access control.
- The update workflow should be simple and repeatable: add Source Photos locally, run import, edit incomplete entries in admin, build public data, commit derivatives and generated public files, then push.
- The local issue tracker for this PRD is markdown-based because this repo currently has no GitHub remote configured.
- The testing seams proposed here are intended to match the settled architecture: one high-level generated-public-data seam, supported by narrower importer, admin API, and browser interaction tests where behavior is user-visible.

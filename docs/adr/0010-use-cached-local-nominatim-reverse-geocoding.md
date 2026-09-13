# Use cached local Nominatim reverse geocoding

The importer uses OpenStreetMap Nominatim during local imports to derive detected location names from GPS coordinates. Lookups are cached by rounded coordinates and throttled so repeated imports do not repeatedly query the public service, and the admin interface can correct unsuitable detected names.

# Build public data from imported and editorial data

The public site reads a generated `public-data.json` rather than merging source data in the browser. A build step combines imported photo data with owner-authored editorial data by Photo ID and emits only publishable photo entries, reducing the chance that incomplete or private admin data is shipped to visitors.

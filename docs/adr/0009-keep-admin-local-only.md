# Keep admin local-only

The admin interface runs through a local server and is excluded from the GitHub Pages deployment. GitHub Pages cannot write repository files directly, and keeping admin local avoids browser token handling, backend infrastructure, and accidental exposure of incomplete photo entries or editing controls.

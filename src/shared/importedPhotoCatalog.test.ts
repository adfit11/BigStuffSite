import test from "node:test";
import assert from "node:assert/strict";
import { mergeImportedPhotoEntries } from "./importedPhotoCatalog";
import type { ImportedPhotoEntry } from "./types";

test("preserves previously imported photo entries when a later import has only new files", () => {
  const previous = photoEntry("previous", "2024-01-01T00:00:00.000Z");
  const incoming = photoEntry("incoming", "2024-01-02T00:00:00.000Z");

  assert.deepEqual(mergeImportedPhotoEntries([previous], [incoming]), [
    previous,
    incoming
  ]);
});

test("updates an existing photo entry when the same photo is imported again", () => {
  const original = photoEntry("same", "2024-01-01T00:00:00.000Z", "old.jpg");
  const updated = photoEntry("same", "2024-01-03T00:00:00.000Z", "new.jpg");

  assert.deepEqual(mergeImportedPhotoEntries([original], [updated]), [updated]);
});

function photoEntry(
  id: string,
  takenAt: string,
  originalFilename = `${id}.jpg`
): ImportedPhotoEntry {
  return {
    id,
    originalFilename,
    contentHash: `${id}-hash`,
    takenAt,
    takenAtSource: "exif",
    latitude: null,
    longitude: null,
    detectedLocationName: null,
    derivatives: {
      thumb: `/photos/thumbs/${id}.webp`,
      large: `/photos/large/${id}.webp`
    }
  };
}

import test from "node:test";
import assert from "node:assert/strict";
import { buildPublicData } from "./photoData";
import type { EditorialData, ImportedPhotoEntry } from "./types";

test("adds a marker derivative path for publishable photos without one", () => {
  const importedPhoto: ImportedPhotoEntry = {
    id: "big-banana",
    originalFilename: "banana.jpg",
    contentHash: "big-banana-hash",
    takenAt: "2024-01-01T00:00:00.000Z",
    takenAtSource: "exif",
    latitude: -28.2,
    longitude: 153.5,
    detectedLocationName: "Coffs Harbour, New South Wales, Australia",
    derivatives: {
      thumb: "/photos/thumbs/big-banana.webp",
      large: "/photos/large/big-banana.webp"
    }
  };
  const editorialData: EditorialData = {
    tags: ["big things"],
    photos: {
      "big-banana": {
        title: "Big Banana",
        tags: ["big things"]
      }
    }
  };

  const publicData = buildPublicData([importedPhoto], editorialData);

  assert.equal(
    publicData.photos[0].derivatives.marker,
    "/photos/markers/big-banana.webp"
  );
});

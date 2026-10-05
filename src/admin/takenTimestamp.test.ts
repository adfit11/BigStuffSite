import test from "node:test";
import assert from "node:assert/strict";
import {
  compareEffectiveTakenAt,
  composeTakenAtOverride,
  getEffectiveTakenAt,
  getTakenTimestampParts,
  replaceTakenDatePart,
  replaceTakenTimePart
} from "./takenTimestamp";
import type { EditorialData, ImportedPhotoEntry } from "../shared/types";

test("reads date and minute-precision time parts from imported timestamps", () => {
  assert.deepEqual(
    getTakenTimestampParts("2026-09-17T02:39:18.000Z"),
    {
      date: "2026-09-17",
      time: "02:39"
    }
  );
});

test("reads date and minute-precision time parts from overridden timestamps", () => {
  const photo = photoEntry("photo", "2026-09-17T02:39:18.000Z");
  const editorial: EditorialData = {
    tags: [],
    photos: {
      photo: {
        title: "Photo",
        tags: [],
        takenAtOverride: "2025-01-25T22:36:46.000Z"
      }
    }
  };

  assert.deepEqual(
    getTakenTimestampParts(getEffectiveTakenAt(photo, editorial.photos.photo)),
    {
      date: "2025-01-25",
      time: "22:36"
    }
  );
});

test("replaces only the date part without browser-local timezone conversion", () => {
  assert.equal(
    replaceTakenDatePart("2026-09-17T02:39:18.000Z", "2026-09-18"),
    "2026-09-18T02:39:00.000Z"
  );
});

test("replaces only the time part without browser-local timezone conversion", () => {
  assert.equal(
    replaceTakenTimePart("2026-09-17T02:39:18.000Z", "23:17"),
    "2026-09-17T23:17:00.000Z"
  );
});

test("composes an override only when both date and time parts are valid", () => {
  assert.equal(
    composeTakenAtOverride({ date: "2026-09-17", time: "02:39" }),
    "2026-09-17T02:39:00.000Z"
  );
  assert.equal(composeTakenAtOverride({ date: "", time: "02:39" }), undefined);
  assert.equal(composeTakenAtOverride({ date: "2026-09-17", time: "" }), undefined);
});

test("rejects invalid existing timestamps and invalid replacement parts", () => {
  assert.deepEqual(getTakenTimestampParts("not-a-date"), { date: "", time: "" });
  assert.deepEqual(
    getTakenTimestampParts("2026-02-30T02:39:18.000Z"),
    { date: "", time: "" }
  );
  assert.equal(
    replaceTakenDatePart("not-a-date", "2026-09-18"),
    undefined
  );
  assert.equal(
    composeTakenAtOverride({ date: "2026-02-30", time: "02:39" }),
    undefined
  );
  assert.equal(
    composeTakenAtOverride({ date: "2026-09-17", time: "24:00" }),
    undefined
  );
  assert.equal(
    composeTakenAtOverride({ date: "2026-09-17", time: "02:60" }),
    undefined
  );
});

test("sorts same-day photos by effective time of day", () => {
  const later = photoEntry("later", "2026-09-17T22:43:38.000Z");
  const earlier = photoEntry("earlier", "2026-09-17T02:39:18.000Z");
  const editorial = editorialData();

  assert.deepEqual(
    [later, earlier].sort((first, second) =>
      compareEffectiveTakenAt(first, second, editorial)
    ).map((photo) => photo.id),
    ["earlier", "later"]
  );
});

test("uses takenAtOverride time changes when sorting without mutating imported timestamps", () => {
  const first = photoEntry("first", "2026-09-17T02:39:18.000Z");
  const second = photoEntry("second", "2026-09-17T03:05:58.000Z");
  const editorial: EditorialData = {
    tags: [],
    photos: {
      first: {
        title: "First",
        tags: [],
        takenAtOverride: "2026-09-17T04:02:00.000Z"
      }
    }
  };

  assert.deepEqual(
    [first, second].sort((left, right) =>
      compareEffectiveTakenAt(left, right, editorial)
    ).map((photo) => photo.id),
    ["second", "first"]
  );
  assert.equal(first.takenAt, "2026-09-17T02:39:18.000Z");
});

function editorialData(): EditorialData {
  return {
    tags: [],
    photos: {}
  };
}

function photoEntry(id: string, takenAt: string): ImportedPhotoEntry {
  return {
    id,
    originalFilename: `${id}.jpg`,
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

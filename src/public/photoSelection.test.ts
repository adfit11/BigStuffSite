import assert from "node:assert/strict";
import test from "node:test";
import { selectFeaturedPhoto } from "./photoSelection";
import type { PublicPhotoEntry } from "../shared/types";

test("selects the newest photo when no requested photo is available", () => {
  const oldest = photoEntry("oldest", "2024-01-01T00:00:00.000Z");
  const newest = photoEntry("newest", "2026-01-01T00:00:00.000Z");
  const middle = photoEntry("middle", "2025-01-01T00:00:00.000Z");

  assert.equal(selectFeaturedPhoto([oldest, newest, middle], null)?.id, "newest");
  assert.equal(selectFeaturedPhoto([oldest, newest, middle], "missing")?.id, "newest");
});

test("preserves a requested photo even when it is not newest", () => {
  const older = photoEntry("older", "2024-01-01T00:00:00.000Z");
  const newer = photoEntry("newer", "2025-01-01T00:00:00.000Z");

  assert.equal(selectFeaturedPhoto([older, newer], "older")?.id, "older");
});

test("uses the latest existing order item when newest dates tie", () => {
  const first = photoEntry("first", "2025-01-01T00:00:00.000Z");
  const second = photoEntry("second", "2025-01-01T00:00:00.000Z");

  assert.equal(selectFeaturedPhoto([first, second], null)?.id, "second");
});

function photoEntry(id: string, takenAt: string): PublicPhotoEntry {
  return {
    id,
    title: id,
    takenAt,
    latitude: 0,
    longitude: 0,
    displayLocationName: "Somewhere",
    tags: ["big things"],
    derivatives: {
      thumb: `/photos/thumbs/${id}.webp`,
      large: `/photos/large/${id}.webp`,
      marker: `/photos/markers/${id}.webp`
    }
  };
}

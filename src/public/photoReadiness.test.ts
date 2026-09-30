import assert from "node:assert/strict";
import test from "node:test";
import {
  getInitialFilteredPhotos,
  getInitialViewState,
  markerImageUrls,
  waitForImageUrls
} from "./photoReadiness";
import type { PublicData, PublicPhotoEntry } from "../shared/types";

test("initial filtered photos match URL tag and title filters", () => {
  const banana = photoEntry("banana", {
    title: "Big Banana",
    tags: ["big things", "fruit"]
  });
  const crab = photoEntry("crab", {
    title: "Big Crab",
    tags: ["big things", "coastal"]
  });
  const data = publicData([banana, crab]);
  const viewState = getInitialViewState(
    data,
    new URLSearchParams("tags=fruit,missing&q=banana")
  );

  assert.deepEqual(viewState.selectedTags, ["fruit"]);
  assert.deepEqual(
    getInitialFilteredPhotos(data.photos, viewState).map((photo) => photo.id),
    ["banana"]
  );
});

test("marker image urls use deduped marker derivatives", () => {
  const first = photoEntry("first");
  const duplicate = {
    ...photoEntry("duplicate"),
    derivatives: {
      thumb: "/photos/thumbs/duplicate.webp",
      large: "/photos/large/duplicate.webp",
      marker: "/photos/markers/first.webp"
    }
  };

  assert.deepEqual(markerImageUrls([first, duplicate], assetUrl), [
    "/base/photos/markers/first.webp"
  ]);
});

test("waitForImageUrls resolves when every image load succeeds", async () => {
  const loaded: string[] = [];

  await waitForImageUrls(["/a.webp", "/b.webp"], 1000, async (url) => {
    loaded.push(url);
  });

  assert.deepEqual(loaded, ["/a.webp", "/b.webp"]);
});

test("waitForImageUrls resolves after failed image loads", async () => {
  const loaded: string[] = [];

  await waitForImageUrls(["/ok.webp", "/broken.webp"], 1000, async (url) => {
    loaded.push(url);
    if (url.includes("broken")) {
      throw new Error("broken image");
    }
  });

  assert.deepEqual(loaded, ["/ok.webp", "/broken.webp"]);
});

test("waitForImageUrls resolves after the bounded timeout", async () => {
  const startedAt = Date.now();
  await waitForImageUrls(
    ["/slow.webp"],
    5,
    () => new Promise(() => undefined)
  );

  assert.ok(Date.now() - startedAt < 1000);
});

function assetUrl(path: string): string {
  return `/base/${path.replace(/^\//, "")}`;
}

function publicData(photos: PublicPhotoEntry[]): PublicData {
  return {
    generatedAt: "2026-09-30T00:00:00.000Z",
    tags: ["big things", "fruit", "coastal"],
    photos
  };
}

function photoEntry(
  id: string,
  overrides: Partial<PublicPhotoEntry> = {}
): PublicPhotoEntry {
  return {
    id,
    title: id,
    takenAt: "2026-01-01T00:00:00.000Z",
    latitude: 0,
    longitude: 0,
    displayLocationName: "Somewhere",
    tags: ["big things"],
    derivatives: {
      thumb: `/photos/thumbs/${id}.webp`,
      large: `/photos/large/${id}.webp`,
      marker: `/photos/markers/${id}.webp`
    },
    ...overrides
  };
}

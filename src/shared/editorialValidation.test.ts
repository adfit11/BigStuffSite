import test from "node:test";
import assert from "node:assert/strict";
import { validateEditorialData } from "./editorialValidation";
import type { EditorialData } from "./types";

test("accepts saved editorial data that preserves entries from earlier imports", () => {
  const editorial: EditorialData = {
    tags: ["big things"],
    photos: {
      current: {
        title: "Big Apple",
        tags: ["big things"]
      },
      previousImport: {
        title: "Big Banana",
        tags: ["big things"]
      }
    }
  };

  assert.deepEqual(validateEditorialData(editorial, new Set(["current"])), {
    ok: true
  });
});

test("rejects unknown tags on entries from the current import set", () => {
  const editorial: EditorialData = {
    tags: ["big things"],
    photos: {
      current: {
        title: "Big Apple",
        tags: ["missing tag"]
      }
    }
  };

  assert.deepEqual(validateEditorialData(editorial, new Set(["current"])), {
    ok: false,
    error: "Unknown tag: missing tag"
  });
});

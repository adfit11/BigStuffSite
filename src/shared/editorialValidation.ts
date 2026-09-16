import type { EditorialData, PhotoId } from "./types";

export type EditorialValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateEditorialData(
  editorial: EditorialData,
  currentPhotoIds: Set<PhotoId>
): EditorialValidationResult {
  const validTags = new Set(editorial.tags);

  for (const [photoId, photo] of Object.entries(editorial.photos)) {
    if (!currentPhotoIds.has(photoId)) {
      continue;
    }

    const unknownTag = photo.tags.find((tag) => !validTags.has(tag));
    if (unknownTag) {
      return { ok: false, error: `Unknown tag: ${unknownTag}` };
    }
  }

  return { ok: true };
}

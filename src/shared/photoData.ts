import type {
  EditorialData,
  ImportedPhotoEntry,
  PublicData,
  PublicPhotoEntry
} from "./types";

export function getPublishablePhotos(
  importedPhotos: ImportedPhotoEntry[],
  editorialData: EditorialData
): PublicPhotoEntry[] {
  const publishablePhotos: PublicPhotoEntry[] = [];

  for (const photo of importedPhotos) {
    const editorial = editorialData.photos[photo.id];
    if (!editorial?.title || editorial.tags.length === 0) {
      continue;
    }

    const latitude = editorial.latitudeOverride ?? photo.latitude;
    const longitude = editorial.longitudeOverride ?? photo.longitude;
    const displayLocationName =
      editorial.displayLocationNameOverride ?? photo.detectedLocationName;
    const takenAt = editorial.takenAtOverride ?? photo.takenAt;

    if (
      latitude == null ||
      longitude == null ||
      !displayLocationName ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      continue;
    }

    publishablePhotos.push({
      id: photo.id,
      title: editorial.title,
      description: editorial.description || undefined,
      takenAt,
      latitude,
      longitude,
      displayLocationName,
      tags: editorial.tags,
      derivatives: photo.derivatives
    });
  }

  return publishablePhotos.sort(comparePublicPhotos);
}

export function buildPublicData(
  importedPhotos: ImportedPhotoEntry[],
  editorialData: EditorialData
): PublicData {
  const photos = getPublishablePhotos(importedPhotos, editorialData);

  return {
    generatedAt: new Date().toISOString(),
    tags: editorialData.tags,
    photos
  };
}

function comparePublicPhotos(a: PublicPhotoEntry, b: PublicPhotoEntry): number {
  const byDate = a.takenAt.localeCompare(b.takenAt);
  if (byDate !== 0) {
    return byDate;
  }

  const byTitle = a.title.localeCompare(b.title);
  if (byTitle !== 0) {
    return byTitle;
  }

  return a.id.localeCompare(b.id);
}

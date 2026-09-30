import type { PhotoId, PublicPhotoEntry } from "../shared/types";

export function selectFeaturedPhoto(
  photos: PublicPhotoEntry[],
  requestedPhotoId: PhotoId | null
): PublicPhotoEntry | null {
  const requestedPhoto = requestedPhotoId
    ? photos.find((photo) => photo.id === requestedPhotoId)
    : null;
  if (requestedPhoto) {
    return requestedPhoto;
  }

  return newestPhoto(photos);
}

function newestPhoto(photos: PublicPhotoEntry[]): PublicPhotoEntry | null {
  return photos.reduce<PublicPhotoEntry | null>((newest, photo) => {
    if (!newest || photo.takenAt >= newest.takenAt) {
      return photo;
    }

    return newest;
  }, null);
}

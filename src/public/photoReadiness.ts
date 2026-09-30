import { selectFeaturedPhoto } from "./photoSelection";
import type { PublicData, PublicPhotoEntry } from "../shared/types";

export type InitialViewState = {
  selectedTags: string[];
  titleQuery: string;
  requestedPhotoId: string | null;
};

export type ImageLoader = (url: string) => Promise<void>;

export function getInitialViewState(
  data: PublicData,
  params: URLSearchParams
): InitialViewState {
  const urlTags = params.get("tags")?.split(",").filter(Boolean) ?? [];

  return {
    selectedTags: urlTags.filter((tag) => data.tags.includes(tag)),
    titleQuery: params.get("q") ?? "",
    requestedPhotoId: params.get("photo")
  };
}

export function getInitialFilteredPhotos(
  photos: PublicPhotoEntry[],
  viewState: InitialViewState
): PublicPhotoEntry[] {
  return filterPhotos(photos, viewState.selectedTags, viewState.titleQuery);
}

export function getInitialFeaturedPhoto(
  photos: PublicPhotoEntry[],
  viewState: InitialViewState
): PublicPhotoEntry | null {
  return selectFeaturedPhoto(
    getInitialFilteredPhotos(photos, viewState),
    viewState.requestedPhotoId
  );
}

export function filterPhotos(
  photos: PublicPhotoEntry[],
  selectedTags: string[],
  titleQuery: string
): PublicPhotoEntry[] {
  const normalizedTitleQuery = titleQuery.trim().toLocaleLowerCase();

  return photos.filter((photo) => {
    const matchesTags = selectedTags.every((tag) => photo.tags.includes(tag));
    const matchesTitle =
      normalizedTitleQuery.length === 0 ||
      photo.title.toLocaleLowerCase().includes(normalizedTitleQuery);

    return matchesTags && matchesTitle;
  }).sort((photoA, photoB) => {
    return Date.parse(photoB.takenAt) - Date.parse(photoA.takenAt);
  });
}

export function markerImageUrls(
  photos: PublicPhotoEntry[],
  assetUrl: (path: string) => string
): string[] {
  return [...new Set(photos.map((photo) => assetUrl(photo.derivatives.marker)))];
}

export function waitForImageUrls(
  urls: string[],
  timeoutMilliseconds: number,
  loadImage: ImageLoader = loadBrowserImage
): Promise<void> {
  const uniqueUrls = [...new Set(urls)];
  if (uniqueUrls.length === 0) {
    return Promise.resolve();
  }

  const loads = Promise.all(
    uniqueUrls.map((url) => loadImage(url).catch(() => undefined))
  ).then(() => undefined);

  return Promise.race([loads, delay(timeoutMilliseconds)]);
}

export function loadBrowserImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    function cleanup() {
      image.onload = null;
      image.onerror = null;
    }

    image.onload = () => {
      cleanup();
      resolve();
    };
    image.onerror = () => {
      cleanup();
      reject(new Error(`Could not load image: ${url}`));
    };
    image.decoding = "async";
    image.loading = "eager";
    image.src = url;
  });
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));
}

export type PhotoId = string;

export type ImportedPhotoDerivatives = {
  thumb: string;
  large: string;
  marker?: string;
};

export type PublicPhotoDerivatives = ImportedPhotoDerivatives & {
  marker: string;
};

export type ImportedPhotoEntry = {
  id: PhotoId;
  originalFilename: string;
  contentHash: string;
  takenAt: string;
  takenAtSource: "exif" | "fileModified";
  latitude: number | null;
  longitude: number | null;
  detectedLocationName: string | null;
  derivatives: ImportedPhotoDerivatives;
};

export type EditorialPhotoEntry = {
  title: string;
  description?: string;
  takenAtOverride?: string;
  latitudeOverride?: number;
  longitudeOverride?: number;
  displayLocationNameOverride?: string;
  tags: string[];
};

export type EditorialData = {
  tags: string[];
  photos: Record<PhotoId, EditorialPhotoEntry>;
};

export type PublicPhotoEntry = {
  id: PhotoId;
  title: string;
  description?: string;
  takenAt: string;
  latitude: number;
  longitude: number;
  displayLocationName: string;
  tags: string[];
  derivatives: PublicPhotoDerivatives;
};

export type PublicData = {
  generatedAt: string;
  tags: string[];
  photos: PublicPhotoEntry[];
};

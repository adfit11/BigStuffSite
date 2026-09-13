export type PhotoId = string;

export type ImportedPhotoEntry = {
  id: PhotoId;
  originalFilename: string;
  contentHash: string;
  takenAt: string;
  takenAtSource: "exif" | "fileModified";
  latitude: number | null;
  longitude: number | null;
  detectedLocationName: string | null;
  derivatives: {
    thumb: string;
    large: string;
  };
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
  derivatives: {
    thumb: string;
    large: string;
  };
};

export type PublicData = {
  generatedAt: string;
  tags: string[];
  photos: PublicPhotoEntry[];
};

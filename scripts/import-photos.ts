import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import exifr from "exifr";
import sharp from "sharp";
import type { ImportedPhotoEntry } from "../src/shared/types";

const SOURCE_DIR = "source-photos";
const DATA_PATH = "data/photos.json";
const GEOCODE_CACHE_PATH = "data/geocode-cache.json";
const THUMB_DIR = "public/photos/thumbs";
const LARGE_DIR = "public/photos/large";
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const GEOCODE_PRECISION = 5;
const GEOCODE_DELAY_MS = 1100;

type GeocodeCache = Record<string, string | null>;

type ImportSummary = {
  imported: number;
  duplicates: string[];
  unsupported: string[];
  unmapped: string[];
  ungeocoded: string[];
};

async function main() {
  await ensureProjectDirectories();

  const files = await listSourceFiles(SOURCE_DIR);
  if (files.length === 0) {
    console.log(`No photos found. Add JPEG, PNG, or WebP files to ${SOURCE_DIR}/.`);
    return;
  }

  const geocodeCache = await readJson<GeocodeCache>(GEOCODE_CACHE_PATH, {});
  const seenHashes = new Set<string>();
  const importedPhotos: ImportedPhotoEntry[] = [];
  const summary: ImportSummary = {
    imported: 0,
    duplicates: [],
    unsupported: [],
    unmapped: [],
    ungeocoded: []
  };

  for (const filePath of files) {
    const extension = extname(filePath).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      summary.unsupported.push(filePath);
      continue;
    }

    const contentHash = await hashFile(filePath);
    if (seenHashes.has(contentHash)) {
      summary.duplicates.push(filePath);
      continue;
    }
    seenHashes.add(contentHash);

    const id = contentHash.slice(0, 20);
    const metadata = await readPhotoMetadata(filePath);
    const detectedLocationName =
      metadata.latitude != null && metadata.longitude != null
        ? await reverseGeocode(metadata.latitude, metadata.longitude, geocodeCache)
        : null;

    if (metadata.latitude == null || metadata.longitude == null) {
      summary.unmapped.push(filePath);
    } else if (!detectedLocationName) {
      summary.ungeocoded.push(filePath);
    }

    const derivatives = await createDerivatives(filePath, id);

    importedPhotos.push({
      id,
      originalFilename: basename(filePath),
      contentHash,
      takenAt: metadata.takenAt,
      takenAtSource: metadata.takenAtSource,
      latitude: metadata.latitude,
      longitude: metadata.longitude,
      detectedLocationName,
      derivatives
    });
    summary.imported += 1;
  }

  importedPhotos.sort((a, b) => {
    const byDate = a.takenAt.localeCompare(b.takenAt);
    return byDate === 0 ? a.id.localeCompare(b.id) : byDate;
  });

  await writeJson(DATA_PATH, importedPhotos);
  await writeJson(GEOCODE_CACHE_PATH, geocodeCache);

  printSummary(summary);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function ensureProjectDirectories() {
  await mkdir(SOURCE_DIR, { recursive: true });
  await mkdir(dirname(DATA_PATH), { recursive: true });
  await mkdir(THUMB_DIR, { recursive: true });
  await mkdir(LARGE_DIR, { recursive: true });
}

async function listSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return listSourceFiles(path);
      }
      return entry.isFile() ? [path] : [];
    })
  );

  return files.flat().sort();
}

async function hashFile(filePath: string): Promise<string> {
  const hash = createHash("sha256");

  await new Promise<void>((resolve, reject) => {
    createReadStream(filePath)
      .on("data", (chunk) => hash.update(chunk))
      .on("error", reject)
      .on("end", resolve);
  });

  return hash.digest("hex");
}

async function readPhotoMetadata(filePath: string): Promise<{
  takenAt: string;
  takenAtSource: "exif" | "fileModified";
  latitude: number | null;
  longitude: number | null;
}> {
  const exif = await exifr.parse(filePath, {
    pick: ["DateTimeOriginal", "CreateDate", "latitude", "longitude"]
  });
  const fileStats = await stat(filePath);
  const exifDate = normalizeDate(exif?.DateTimeOriginal ?? exif?.CreateDate);
  const gps = await readGps(filePath, exif);

  return {
    takenAt: (exifDate ?? fileStats.mtime).toISOString(),
    takenAtSource: exifDate ? "exif" : "fileModified",
    latitude: gps.latitude,
    longitude: gps.longitude
  };
}

async function readGps(
  filePath: string,
  exif: unknown
): Promise<{ latitude: number | null; longitude: number | null }> {
  const parsedExif = exif as { latitude?: number; longitude?: number } | undefined;
  if (
    typeof parsedExif?.latitude === "number" &&
    typeof parsedExif.longitude === "number"
  ) {
    return {
      latitude: parsedExif.latitude,
      longitude: parsedExif.longitude
    };
  }

  try {
    const gps = await exifr.gps(filePath);
    return {
      latitude: gps?.latitude ?? null,
      longitude: gps?.longitude ?? null
    };
  } catch {
    return { latitude: null, longitude: null };
  }
}

function normalizeDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

async function createDerivatives(
  filePath: string,
  id: string
): Promise<ImportedPhotoEntry["derivatives"]> {
  const thumbPath = join(THUMB_DIR, `${id}.webp`);
  const largePath = join(LARGE_DIR, `${id}.webp`);

  await sharp(filePath)
    .rotate()
    .resize({ width: 320, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(thumbPath);

  await sharp(filePath)
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(largePath);

  return {
    thumb: toPublicPath(thumbPath),
    large: toPublicPath(largePath)
  };
}

function toPublicPath(path: string): string {
  return path.startsWith("public/") ? path.slice("public".length) : path;
}

async function reverseGeocode(
  latitude: number,
  longitude: number,
  cache: GeocodeCache
): Promise<string | null> {
  const key = geocodeKey(latitude, longitude);
  if (Object.prototype.hasOwnProperty.call(cache, key)) {
    return cache[key];
  }

  await delay(GEOCODE_DELAY_MS);

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", latitude.toFixed(GEOCODE_PRECISION));
  url.searchParams.set("lon", longitude.toFixed(GEOCODE_PRECISION));
  url.searchParams.set("zoom", "14");
  url.searchParams.set("addressdetails", "1");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "BigStuffSite/0.1 (https://github.com/adfit11/BigStuffSite)"
      }
    });

    if (!response.ok) {
      cache[key] = null;
      return null;
    }

    const result = (await response.json()) as {
      display_name?: string;
      address?: Record<string, string | undefined>;
    };
    const locationName = formatLocationName(result.address, result.display_name);
    cache[key] = locationName;
    return locationName;
  } catch {
    cache[key] = null;
    return null;
  }
}

function geocodeKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(GEOCODE_PRECISION)},${longitude.toFixed(
    GEOCODE_PRECISION
  )}`;
}

function formatLocationName(
  address: Record<string, string | undefined> | undefined,
  fallback: string | undefined
): string | null {
  if (!address) {
    return fallback ?? null;
  }

  const locality =
    address.city ??
    address.town ??
    address.village ??
    address.hamlet ??
    address.suburb ??
    address.municipality ??
    address.county;
  const region = address.state ?? address.region;
  const country = address.country;
  const parts = [locality, region, country].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : fallback ?? null;
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(path: string, data: unknown) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function printSummary(summary: ImportSummary) {
  console.log(`Imported ${summary.imported} photo entries.`);
  console.log(`Skipped ${summary.duplicates.length} exact duplicates.`);
  console.log(`Skipped ${summary.unsupported.length} unsupported files.`);
  console.log(`${summary.unmapped.length} photos need coordinates in admin.`);
  console.log(`${summary.ungeocoded.length} photos need location names in admin.`);

  printList("Duplicate files", summary.duplicates);
  printList("Unsupported files", summary.unsupported);
  printList("Unmapped files", summary.unmapped);
  printList("Ungeocoded files", summary.ungeocoded);
}

function printList(label: string, values: string[]) {
  if (values.length === 0) {
    return;
  }

  console.log(`\n${label}:`);
  for (const value of values) {
    console.log(`- ${value}`);
  }
}

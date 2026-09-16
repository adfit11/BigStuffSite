import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";
import type { PublicData, PublicPhotoEntry } from "../src/shared/types";

const PUBLIC_DATA_PATH = "public/public-data.json";
const PUBLIC_DIR = "public";

async function main() {
  const publicData = JSON.parse(await readFile(PUBLIC_DATA_PATH, "utf8")) as PublicData;
  let generated = 0;

  for (const photo of publicData.photos) {
    const inputPath = publicFilePath(photo.derivatives.thumb);
    const outputPath = publicFilePath(markerPath(photo));
    await mkdir(dirname(outputPath), { recursive: true });
    await sharp(inputPath)
      .resize({ width: 72, height: 72, fit: "cover", withoutEnlargement: true })
      .webp({ quality: 56 })
      .toFile(outputPath);
    generated += 1;
  }

  console.log(`Generated ${generated} marker images.`);
}

function markerPath(photo: PublicPhotoEntry): string {
  return photo.derivatives.marker;
}

function publicFilePath(path: string): string {
  return join(PUBLIC_DIR, path.replace(/^\//, ""));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

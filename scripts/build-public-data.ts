import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { buildPublicData } from "../src/shared/photoData";
import type { EditorialData, ImportedPhotoEntry } from "../src/shared/types";

const IMPORTED_PATH = "data/photos.json";
const EDITORIAL_PATH = "data/editorial.json";
const PUBLIC_DATA_PATH = "public/public-data.json";

async function readJson<T>(path: string): Promise<T> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as T;
}

async function main() {
  const importedPhotos = await readJson<ImportedPhotoEntry[]>(IMPORTED_PATH);
  const editorialData = await readJson<EditorialData>(EDITORIAL_PATH);
  const publicData = buildPublicData(importedPhotos, editorialData);

  await mkdir(dirname(PUBLIC_DATA_PATH), { recursive: true });
  await writeFile(PUBLIC_DATA_PATH, `${JSON.stringify(publicData, null, 2)}\n`);

  console.log(
    `Built ${PUBLIC_DATA_PATH} with ${publicData.photos.length} publishable photos.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { readdir } from "node:fs/promises";

const SOURCE_DIR = "source-photos";
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function main() {
  let entries: string[] = [];
  try {
    entries = await readdir(SOURCE_DIR);
  } catch {
    console.log(`No ${SOURCE_DIR}/ folder found. Create it and add photos to import.`);
    return;
  }

  const supported = entries.filter((entry) =>
    SUPPORTED_EXTENSIONS.has(entry.slice(entry.lastIndexOf(".")).toLowerCase())
  );
  const unsupported = entries.length - supported.length;

  console.log(
    `Import scaffold found ${supported.length} supported files and ${unsupported} unsupported files.`
  );
  console.log("EXIF extraction, hashing, derivatives, and geocoding are next.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

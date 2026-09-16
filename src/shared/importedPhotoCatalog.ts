import type { ImportedPhotoEntry } from "./types";

export function mergeImportedPhotoEntries(
  existingEntries: ImportedPhotoEntry[],
  incomingEntries: ImportedPhotoEntry[]
): ImportedPhotoEntry[] {
  const byId = new Map<string, ImportedPhotoEntry>();

  for (const entry of existingEntries) {
    byId.set(entry.id, entry);
  }

  for (const entry of incomingEntries) {
    byId.set(entry.id, entry);
  }

  return [...byId.values()].sort((a, b) => {
    const byDate = a.takenAt.localeCompare(b.takenAt);
    return byDate === 0 ? a.id.localeCompare(b.id) : byDate;
  });
}

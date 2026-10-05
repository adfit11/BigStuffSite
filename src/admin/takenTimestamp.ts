import type {
  EditorialData,
  EditorialPhotoEntry,
  ImportedPhotoEntry
} from "../shared/types";

export type TakenTimestampParts = {
  date: string;
  time: string;
};

const EMPTY_TIMESTAMP_PARTS: TakenTimestampParts = {
  date: "",
  time: ""
};

const ISO_TIMESTAMP_PARTS_PATTERN = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/;
const DATE_PART_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PART_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function getEffectiveTakenAt(
  photo: ImportedPhotoEntry,
  editorial: EditorialPhotoEntry | undefined
): string {
  return editorial?.takenAtOverride ?? photo.takenAt;
}

export function getTakenTimestampParts(value: string): TakenTimestampParts {
  const match = ISO_TIMESTAMP_PARTS_PATTERN.exec(value);
  if (!match) {
    return EMPTY_TIMESTAMP_PARTS;
  }

  const [, date, time] = match;
  if (!isValidDatePart(date) || !isValidTimePart(time)) {
    return EMPTY_TIMESTAMP_PARTS;
  }

  return { date, time };
}

export function composeTakenAtOverride(
  parts: TakenTimestampParts
): string | undefined {
  if (!isValidDatePart(parts.date) || !isValidTimePart(parts.time)) {
    return undefined;
  }

  return `${parts.date}T${parts.time}:00.000Z`;
}

export function replaceTakenDatePart(
  effectiveTakenAt: string,
  date: string
): string | undefined {
  const parts = getTakenTimestampParts(effectiveTakenAt);
  return composeTakenAtOverride({ ...parts, date });
}

export function replaceTakenTimePart(
  effectiveTakenAt: string,
  time: string
): string | undefined {
  const parts = getTakenTimestampParts(effectiveTakenAt);
  return composeTakenAtOverride({ ...parts, time });
}

export function compareEffectiveTakenAt(
  firstPhoto: ImportedPhotoEntry,
  secondPhoto: ImportedPhotoEntry,
  editorial: EditorialData
): number {
  const firstTime = Date.parse(
    getEffectiveTakenAt(firstPhoto, editorial.photos[firstPhoto.id])
  );
  const secondTime = Date.parse(
    getEffectiveTakenAt(secondPhoto, editorial.photos[secondPhoto.id])
  );

  if (Number.isNaN(firstTime) && Number.isNaN(secondTime)) {
    return firstPhoto.id.localeCompare(secondPhoto.id);
  }
  if (Number.isNaN(firstTime)) {
    return 1;
  }
  if (Number.isNaN(secondTime)) {
    return -1;
  }

  const byDate = firstTime - secondTime;
  return byDate === 0 ? firstPhoto.id.localeCompare(secondPhoto.id) : byDate;
}

function isValidDatePart(value: string): boolean {
  if (!DATE_PART_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidTimePart(value: string): boolean {
  return TIME_PART_PATTERN.test(value);
}

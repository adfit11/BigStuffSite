import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import type {
  EditorialData,
  EditorialPhotoEntry,
  ImportedPhotoEntry,
  PhotoId
} from "../shared/types";

type AdminView = "incomplete" | "omitted" | "all" | "tags";
type PhotoSortMode = "date" | "name";
type SaveState = "idle" | "saving" | "saved" | "error";

const EMPTY_EDITORIAL_PHOTO: EditorialPhotoEntry = {
  title: "",
  description: "",
  tags: []
};

function AdminApp() {
  const [photos, setPhotos] = useState<ImportedPhotoEntry[]>([]);
  const [editorial, setEditorial] = useState<EditorialData>({
    tags: [],
    photos: {}
  });
  const [selectedId, setSelectedId] = useState<PhotoId | null>(null);
  const [view, setView] = useState<AdminView>("incomplete");
  const [sortMode, setSortMode] = useState<PhotoSortMode>("date");
  const [newTag, setNewTag] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [photosResponse, editorialResponse] = await Promise.all([
          fetch("/api/photos"),
          fetch("/api/editorial")
        ]);
        const loadedPhotos = (await photosResponse.json()) as ImportedPhotoEntry[];
        const loadedEditorial = (await editorialResponse.json()) as EditorialData;
        setPhotos(loadedPhotos);
        setEditorial(loadedEditorial);
        const firstIncomplete = loadedPhotos.find((photo) =>
          isIncomplete(photo, loadedEditorial.photos[photo.id])
        );
        setSelectedId(firstIncomplete?.id ?? loadedPhotos[0]?.id ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Load failed");
      }
    }

    void loadData();
  }, []);

  useEffect(() => {
    function warnIfDirty(event: BeforeUnloadEvent) {
      if (!dirty) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnIfDirty);
    return () => window.removeEventListener("beforeunload", warnIfDirty);
  }, [dirty]);

  const selectedPhoto = photos.find((photo) => photo.id === selectedId) ?? null;
  const visiblePhotos = useMemo(() => {
    const filteredPhotos =
      view === "incomplete"
        ? photos.filter((photo) => isIncomplete(photo, editorial.photos[photo.id]))
        : view === "omitted"
          ? photos.filter((photo) => isOmitted(editorial.photos[photo.id]))
          : photos;

    const sortedPhotos = [...filteredPhotos];
    sortedPhotos.sort((firstPhoto, secondPhoto) =>
      comparePhotos(firstPhoto, secondPhoto, editorial, sortMode)
    );

    return sortedPhotos;
  }, [editorial, photos, sortMode, view]);

  const queueLabel = useMemo(() => {
    if (view === "incomplete") {
      return `Incomplete photos (${visiblePhotos.length})`;
    }
    if (view === "omitted") {
      return `Omitted photos (${visiblePhotos.length})`;
    }
    return `All photos (${visiblePhotos.length})`;
  }, [view, visiblePhotos.length]);

  const usageCounts = useMemo(() => getTagUsageCounts(editorial), [editorial]);
  const publishableCount = photos.filter((photo) =>
    isPublishable(photo, editorial.photos[photo.id])
  ).length;
  const omittedCount = photos.filter((photo) =>
    isOmitted(editorial.photos[photo.id])
  ).length;
  const incompleteCount = photos.filter((photo) =>
    isIncomplete(photo, editorial.photos[photo.id])
  ).length;

  function updatePhoto(id: PhotoId, updates: Partial<EditorialPhotoEntry>) {
    setEditorial((current) => ({
      ...current,
      photos: {
        ...current.photos,
        [id]: {
          ...EMPTY_EDITORIAL_PHOTO,
          ...current.photos[id],
          ...updates
        }
      }
    }));
    setDirty(true);
    setSaveState("idle");
  }

  function addTag() {
    const normalized = normalizeTag(newTag);
    if (!normalized || editorial.tags.includes(normalized)) {
      setNewTag("");
      return;
    }

    setEditorial((current) => ({
      ...current,
      tags: [...current.tags, normalized].sort((a, b) => a.localeCompare(b))
    }));
    setNewTag("");
    setDirty(true);
    setSaveState("idle");
  }

  function deleteTag(tag: string) {
    if ((usageCounts.get(tag) ?? 0) > 0) {
      return;
    }

    setEditorial((current) => ({
      ...current,
      tags: current.tags.filter((existingTag) => existingTag !== tag)
    }));
    setDirty(true);
    setSaveState("idle");
  }

  async function save() {
    setSaveState("saving");
    setError(null);

    try {
      const response = await fetch("/api/editorial", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editorial)
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "Save failed");
      }

      setDirty(false);
      setSaveState("saved");
    } catch (saveError) {
      setSaveState("error");
      setError(saveError instanceof Error ? saveError.message : "Save failed");
    }
  }

  function selectPhoto(id: PhotoId) {
    if (dirty && !window.confirm("Discard unsaved changes?")) {
      return;
    }
    setSelectedId(id);
    setDirty(false);
    setSaveState("idle");
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Local Admin</p>
          <h1>Photo metadata editor</h1>
          <p className="summary">
            {photos.length} imported photos, {publishableCount} publishable,{" "}
            {omittedCount} omitted, {incompleteCount} incomplete.
          </p>
        </div>
        <button
          className="save-button"
          type="button"
          onClick={() => void save()}
          disabled={!dirty || saveState === "saving"}
        >
          {saveState === "saving"
            ? "Saving..."
            : saveState === "saved"
              ? "Saved"
              : "Save"}
        </button>
      </header>

      {error ? <p className="error-message">{error}</p> : null}

      <nav aria-label="Admin views" className="admin-tabs">
        <button
          className={view === "incomplete" ? "active" : ""}
          type="button"
          onClick={() => setView("incomplete")}
        >
          Incomplete
        </button>
        <button
          className={view === "omitted" ? "active" : ""}
          type="button"
          onClick={() => setView("omitted")}
        >
          Omitted
        </button>
        <button
          className={view === "all" ? "active" : ""}
          type="button"
          onClick={() => setView("all")}
        >
          All Photos
        </button>
        <button
          className={view === "tags" ? "active" : ""}
          type="button"
          onClick={() => setView("tags")}
        >
          Tags
        </button>
      </nav>

      {view === "tags" ? (
        <TagsView
          tags={editorial.tags}
          usageCounts={usageCounts}
          newTag={newTag}
          onNewTagChange={setNewTag}
          onAddTag={addTag}
          onDeleteTag={deleteTag}
        />
      ) : (
        <section className="admin-grid">
          <PhotoQueue
            photos={visiblePhotos}
            editorial={editorial}
            label={queueLabel}
            selectedId={selectedId}
            sortMode={sortMode}
            onSortModeChange={setSortMode}
            onSelect={selectPhoto}
          />
          <PhotoEditor
            photo={selectedPhoto}
            editorial={selectedPhoto ? editorial.photos[selectedPhoto.id] : undefined}
            tagList={editorial.tags}
            onChange={(updates) => {
              if (selectedPhoto) {
                updatePhoto(selectedPhoto.id, updates);
              }
            }}
          />
        </section>
      )}
    </main>
  );
}

function PhotoQueue({
  photos,
  editorial,
  label,
  selectedId,
  sortMode,
  onSortModeChange,
  onSelect
}: {
  photos: ImportedPhotoEntry[];
  editorial: EditorialData;
  label: string;
  selectedId: PhotoId | null;
  sortMode: PhotoSortMode;
  onSortModeChange: (mode: PhotoSortMode) => void;
  onSelect: (id: PhotoId) => void;
}) {
  return (
    <div className="queue-panel">
      <div className="queue-toolbar">
        <strong>{label}</strong>
        <div className="sort-control" aria-label="Sort photo list">
          <button
            className={sortMode === "date" ? "active" : ""}
            type="button"
            onClick={() => onSortModeChange("date")}
          >
            Date
          </button>
          <button
            className={sortMode === "name" ? "active" : ""}
            type="button"
            onClick={() => onSortModeChange("name")}
          >
            Name
          </button>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="empty-queue">No photos in this view.</div>
      ) : (
        photos.map((photo) => {
          const photoEditorial = editorial.photos[photo.id];
          const title = getPhotoQueueTitle(photo, photoEditorial);
          const publishable = isPublishable(photo, photoEditorial);
          const omitted = isOmitted(photoEditorial);
          return (
            <button
              className={`photo-row ${photo.id === selectedId ? "selected" : ""}`}
              key={photo.id}
              type="button"
              onClick={() => onSelect(photo.id)}
            >
              <img src={photo.derivatives.thumb} alt="" />
              <span>
                <strong>{title}</strong>
                <small>{formatDate(getPhotoTakenAt(photo, photoEditorial))}</small>
              </span>
              <em
                className={
                  omitted ? "status omitted" : publishable ? "status ready" : "status"
                }
              >
                {omitted ? "Omitted" : publishable ? "Ready" : "Incomplete"}
              </em>
            </button>
          );
        })
      )}
    </div>
  );
}

function PhotoEditor({
  photo,
  editorial,
  tagList,
  onChange
}: {
  photo: ImportedPhotoEntry | null;
  editorial: EditorialPhotoEntry | undefined;
  tagList: string[];
  onChange: (updates: Partial<EditorialPhotoEntry>) => void;
}) {
  if (!photo) {
    return <aside className="editor-panel">Select a photo to edit.</aside>;
  }

  const draft = { ...EMPTY_EDITORIAL_PHOTO, ...editorial };
  const latitude = draft.latitudeOverride ?? photo.latitude;
  const longitude = draft.longitudeOverride ?? photo.longitude;
  const locationName =
    draft.displayLocationNameOverride ?? photo.detectedLocationName ?? "";
  const mapUrl =
    latitude != null && longitude != null
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${
          latitude - 0.01
        }%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`
      : null;

  return (
    <aside className="editor-panel">
      <img className="editor-photo" src={photo.derivatives.large} alt="" />
      <dl className="facts">
        <div>
          <dt>Original</dt>
          <dd>{photo.originalFilename}</dd>
        </div>
        <div>
          <dt>Date source</dt>
          <dd>{photo.takenAtSource}</dd>
        </div>
      </dl>

      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={draft.omitted ?? false}
          onChange={(event) => onChange({ omitted: event.target.checked })}
        />
        Omit from public site and unfinished queue
      </label>

      <label>
        Title
        <input
          value={draft.title}
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </label>

      <label>
        Description
        <textarea
          value={draft.description ?? ""}
          rows={5}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </label>

      <label>
        Taken date
        <input
          type="datetime-local"
          value={toDatetimeLocal(draft.takenAtOverride ?? photo.takenAt)}
          onChange={(event) =>
            onChange({ takenAtOverride: fromDatetimeLocal(event.target.value) })
          }
        />
      </label>

      <div className="field-grid">
        <label>
          Latitude
          <input
            type="number"
            step="any"
            value={latitude ?? ""}
            onChange={(event) =>
              onChange({ latitudeOverride: parseOptionalNumber(event.target.value) })
            }
          />
        </label>
        <label>
          Longitude
          <input
            type="number"
            step="any"
            value={longitude ?? ""}
            onChange={(event) =>
              onChange({ longitudeOverride: parseOptionalNumber(event.target.value) })
            }
          />
        </label>
      </div>

      <label>
        Display location name
        <input
          value={locationName}
          onChange={(event) =>
            onChange({ displayLocationNameOverride: event.target.value })
          }
        />
      </label>

      {mapUrl ? (
        <iframe className="map-preview" src={mapUrl} title="Coordinate preview" />
      ) : (
        <div className="map-preview missing">Add coordinates to preview location.</div>
      )}

      <fieldset>
        <legend>Tags</legend>
        {tagList.length === 0 ? (
          <p className="muted">Create tags in the Tags view first.</p>
        ) : (
          <div className="tag-options">
            {tagList.map((tag) => (
              <label className="tag-option" key={tag}>
                <input
                  type="checkbox"
                  checked={draft.tags.includes(tag)}
                  onChange={(event) => {
                    const tags = event.target.checked
                      ? [...draft.tags, tag]
                      : draft.tags.filter((existingTag) => existingTag !== tag);
                    onChange({ tags });
                  }}
                />
                {tag}
              </label>
            ))}
          </div>
        )}
      </fieldset>
    </aside>
  );
}

function TagsView({
  tags,
  usageCounts,
  newTag,
  onNewTagChange,
  onAddTag,
  onDeleteTag
}: {
  tags: string[];
  usageCounts: Map<string, number>;
  newTag: string;
  onNewTagChange: (value: string) => void;
  onAddTag: () => void;
  onDeleteTag: (tag: string) => void;
}) {
  return (
    <section className="tags-panel">
      <form
        className="tag-form"
        onSubmit={(event) => {
          event.preventDefault();
          onAddTag();
        }}
      >
        <label>
          New tag
          <input
            value={newTag}
            onChange={(event) => onNewTagChange(event.target.value)}
          />
        </label>
        <button type="submit">Add Tag</button>
      </form>

      <div className="tag-list">
        {tags.length === 0 ? <p className="muted">No tags yet.</p> : null}
        {tags.map((tag) => {
          const usageCount = usageCounts.get(tag) ?? 0;
          return (
            <div className="tag-row" key={tag}>
              <strong>{tag}</strong>
              <span>{usageCount} photos</span>
              <button
                type="button"
                disabled={usageCount > 0}
                onClick={() => onDeleteTag(tag)}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function isPublishable(
  photo: ImportedPhotoEntry,
  editorial: EditorialPhotoEntry | undefined
): boolean {
  if (isOmitted(editorial)) {
    return false;
  }

  const latitude = editorial?.latitudeOverride ?? photo.latitude;
  const longitude = editorial?.longitudeOverride ?? photo.longitude;
  const locationName =
    editorial?.displayLocationNameOverride ?? photo.detectedLocationName;

  return Boolean(
    editorial?.title &&
      editorial.tags.length > 0 &&
      latitude != null &&
      longitude != null &&
      locationName
  );
}

function isIncomplete(
  photo: ImportedPhotoEntry,
  editorial: EditorialPhotoEntry | undefined
): boolean {
  return !isOmitted(editorial) && !isPublishable(photo, editorial);
}

function isOmitted(editorial: EditorialPhotoEntry | undefined): boolean {
  return editorial?.omitted === true;
}

function comparePhotos(
  firstPhoto: ImportedPhotoEntry,
  secondPhoto: ImportedPhotoEntry,
  editorial: EditorialData,
  sortMode: PhotoSortMode
): number {
  const firstEditorial = editorial.photos[firstPhoto.id];
  const secondEditorial = editorial.photos[secondPhoto.id];

  if (sortMode === "name") {
    const byTitle = getPhotoQueueTitle(firstPhoto, firstEditorial).localeCompare(
      getPhotoQueueTitle(secondPhoto, secondEditorial),
      undefined,
      { sensitivity: "base" }
    );
    return byTitle === 0 ? firstPhoto.id.localeCompare(secondPhoto.id) : byTitle;
  }

  const firstDate = new Date(getPhotoTakenAt(firstPhoto, firstEditorial)).getTime();
  const secondDate = new Date(getPhotoTakenAt(secondPhoto, secondEditorial)).getTime();
  const byDate = firstDate - secondDate;
  return byDate === 0 ? firstPhoto.id.localeCompare(secondPhoto.id) : byDate;
}

function getPhotoQueueTitle(
  photo: ImportedPhotoEntry,
  editorial: EditorialPhotoEntry | undefined
): string {
  return editorial?.title || photo.originalFilename;
}

function getPhotoTakenAt(
  photo: ImportedPhotoEntry,
  editorial: EditorialPhotoEntry | undefined
): string {
  return editorial?.takenAtOverride ?? photo.takenAt;
}

function getTagUsageCounts(editorial: EditorialData): Map<string, number> {
  const counts = new Map<string, number>();
  for (const photo of Object.values(editorial.photos)) {
    for (const tag of photo.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

function normalizeTag(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium"
  }).format(new Date(value));
}

function toDatetimeLocal(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function parseOptionalNumber(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }
  const number = Number(value);
  return Number.isNaN(number) ? undefined : number;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);

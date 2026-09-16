import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import type { PhotoId, PublicData, PublicPhotoEntry } from "../shared/types";

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: PublicData }
  | { status: "error"; message: string };

function PublicApp() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [featuredId, setFeaturedId] = useState<PhotoId | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(assetUrl("public-data.json"));
        if (!response.ok) {
          throw new Error("Could not load public photo data.");
        }

        const data = (await response.json()) as PublicData;
        const params = new URLSearchParams(window.location.search);
        const urlTags = params.get("tags")?.split(",").filter(Boolean) ?? [];

        setLoadState({ status: "loaded", data });
        setSelectedTags(urlTags.filter((tag) => data.tags.includes(tag)));
        setFeaturedId(params.get("photo") ?? data.photos[0]?.id ?? null);
      } catch (error) {
        setLoadState({
          status: "error",
          message: error instanceof Error ? error.message : "Could not load photos."
        });
      }
    }

    void loadData();
  }, []);

  const data = loadState.status === "loaded" ? loadState.data : null;
  const filteredPhotos = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.photos.filter((photo) =>
      selectedTags.every((tag) => photo.tags.includes(tag))
    );
  }, [data, selectedTags]);

  const featuredPhoto =
    filteredPhotos.find((photo) => photo.id === featuredId) ??
    filteredPhotos[0] ??
    null;

  useEffect(() => {
    if (featuredPhoto && featuredPhoto.id !== featuredId) {
      setFeaturedId(featuredPhoto.id);
    }
  }, [featuredId, featuredPhoto]);

  useEffect(() => {
    if (!data) {
      return;
    }

    const params = new URLSearchParams();
    if (featuredPhoto) {
      params.set("photo", featuredPhoto.id);
    }
    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    }

    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [data, featuredPhoto, selectedTags]);

  const featurePhoto = useCallback((photoId: PhotoId) => {
    setFeaturedId(photoId);
  }, []);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((existingTag) => existingTag !== tag)
        : [...current, tag]
    );
  }

  function moveFeature(direction: -1 | 1) {
    if (!featuredPhoto || filteredPhotos.length === 0) {
      return;
    }

    const index = filteredPhotos.findIndex((photo) => photo.id === featuredPhoto.id);
    const nextIndex =
      (index + direction + filteredPhotos.length) % filteredPhotos.length;
    setFeaturedId(filteredPhotos[nextIndex].id);
  }

  if (loadState.status === "loading") {
    return <main className="loading-shell">Loading photos...</main>;
  }

  if (loadState.status === "error") {
    return <main className="loading-shell">{loadState.message}</main>;
  }

  return (
    <main className="public-shell">
      <PhotoMap
        photos={filteredPhotos}
        featuredPhoto={featuredPhoto}
        onFeature={featurePhoto}
      />
      <aside className="photo-panel" aria-label="Photo viewer">
        <TagFilters
          tags={loadState.data.tags}
          selectedTags={selectedTags}
          onToggle={toggleTag}
          onClear={() => setSelectedTags([])}
        />

        {featuredPhoto ? (
          <>
            <FeaturePanel
              photo={featuredPhoto}
              onOpenLightbox={() => setLightboxOpen(true)}
              onPrevious={() => moveFeature(-1)}
              onNext={() => moveFeature(1)}
            />
            <PhotoList
              photos={filteredPhotos}
              featuredId={featuredPhoto.id}
              onFeature={featurePhoto}
            />
            <PhotoRail
              photos={filteredPhotos}
              featuredId={featuredPhoto.id}
              onFeature={featurePhoto}
            />
          </>
        ) : (
          <section className="empty-state">
            <h1>No photos match these tags.</h1>
            <button type="button" onClick={() => setSelectedTags([])}>
              Clear Filters
            </button>
          </section>
        )}
      </aside>

      {lightboxOpen && featuredPhoto ? (
        <Lightbox
          photo={featuredPhoto}
          onClose={() => setLightboxOpen(false)}
          onPrevious={() => moveFeature(-1)}
          onNext={() => moveFeature(1)}
        />
      ) : null}
    </main>
  );
}

function PhotoMap({
  photos,
  featuredPhoto,
  onFeature
}: {
  photos: PublicPhotoEntry[];
  featuredPhoto: PublicPhotoEntry | null;
  onFeature: (photoId: PhotoId) => void;
}) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!elementRef.current || mapRef.current) {
      return;
    }

    const map = L.map(elementRef.current, {
      worldCopyJump: true,
      zoomControl: true
    }).setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    map.createPane("featuredMarkers");
    const featuredPane = map.getPane("featuredMarkers");
    if (featuredPane) {
      featuredPane.style.zIndex = "700";
    }

    mapRef.current = map;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    for (const marker of markersRef.current) {
      marker.remove();
    }

    const spreadPhotos = applyMarkerSpread(photos);
    markersRef.current = spreadPhotos.map(({ photo, latitude, longitude }) => {
      const marker = L.marker([latitude, longitude], {
        pane: photo.id === featuredPhoto?.id ? "featuredMarkers" : "markerPane",
        icon: L.divIcon({
          className: `photo-marker ${photo.id === featuredPhoto?.id ? "featured" : ""}`,
          html: `<img src="${assetUrl(photo.derivatives.thumb)}" alt="">`,
          iconSize: [46, 46],
          iconAnchor: [23, 23]
        })
      });
      marker.on("click", () => onFeature(photo.id));
      marker.addTo(map);
      return marker;
    });
  }, [featuredPhoto, onFeature, photos]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !featuredPhoto) {
      return;
    }

    map.flyTo([featuredPhoto.latitude, featuredPhoto.longitude], Math.max(map.getZoom(), 5), {
      duration: 0.7
    });
  }, [featuredPhoto]);

  return (
    <section className="map-shell" aria-label="Photo map">
      <div ref={elementRef} className="map-panel" />
      <header className="site-title">
        <h1>Big Stuff</h1>
        <p>Australia’s oversized icons, one stop at a time</p>
      </header>
    </section>
  );
}

function FeaturePanel({
  photo,
  onOpenLightbox,
  onPrevious,
  onNext
}: {
  photo: PublicPhotoEntry;
  onOpenLightbox: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <section className="feature-panel">
      <div className="feature-image-frame">
        <button
          className="feature-nav previous"
          type="button"
          aria-label="Previous photo"
          onClick={onPrevious}
        >
          ‹
        </button>
        <button className="feature-image-button" type="button" onClick={onOpenLightbox}>
          <img src={assetUrl(photo.derivatives.large)} alt={photo.title} />
        </button>
        <button
          className="feature-nav next"
          type="button"
          aria-label="Next photo"
          onClick={onNext}
        >
          ›
        </button>
      </div>
      <div className="feature-copy">
        <p className="eyebrow">{formatDate(photo.takenAt)}</p>
        <h1>{photo.title}</h1>
        <p className="location">{photo.displayLocationName}</p>
        {photo.description ? <p>{photo.description}</p> : null}
        <div className="photo-tags">
          {photo.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <a
          className="gps-link"
          href={mapsUrl(photo)}
          target="_blank"
          rel="noreferrer"
        >
          Open GPS coordinates
          <span>
            {formatCoordinate(photo.latitude)}, {formatCoordinate(photo.longitude)}
          </span>
        </a>
      </div>
    </section>
  );
}

function TagFilters({
  tags,
  selectedTags,
  onToggle,
  onClear
}: {
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="tag-filters" aria-label="Tag filters">
      {tags.map((tag) => (
        <button
          className={selectedTags.includes(tag) ? "active" : ""}
          key={tag}
          type="button"
          onClick={() => onToggle(tag)}
        >
          {tag}
        </button>
      ))}
      {selectedTags.length > 0 ? (
        <button className="clear-filter" type="button" onClick={onClear}>
          Clear
        </button>
      ) : null}
    </section>
  );
}

function PhotoList({
  photos,
  featuredId,
  onFeature
}: {
  photos: PublicPhotoEntry[];
  featuredId: PhotoId;
  onFeature: (photoId: PhotoId) => void;
}) {
  const selectedRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [featuredId]);

  return (
    <nav className="title-list" aria-label="Chronological photo list">
      <div className="title-list-header">
        <strong>Photo list</strong>
        <span>{photos.length} stops</span>
      </div>
      {photos.map((photo) => (
        <button
          ref={photo.id === featuredId ? selectedRef : null}
          className={photo.id === featuredId ? "active" : ""}
          key={photo.id}
          type="button"
          onClick={() => onFeature(photo.id)}
        >
          <span>{photo.title}</span>
          <small>{formatDate(photo.takenAt)}</small>
        </button>
      ))}
    </nav>
  );
}

function PhotoRail({
  photos,
  featuredId,
  onFeature
}: {
  photos: PublicPhotoEntry[];
  featuredId: PhotoId;
  onFeature: (photoId: PhotoId) => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const active = railRef.current?.querySelector<HTMLElement>(
      `[data-photo-id="${featuredId}"]`
    );
    active?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [featuredId]);

  return (
    <div
      ref={railRef}
      className="photo-rail"
      onScroll={(event) => {
        const rail = event.currentTarget;
        const center = rail.scrollLeft + rail.clientWidth / 2;
        let closest: PublicPhotoEntry | null = null;
        let closestDistance = Number.POSITIVE_INFINITY;

        for (const child of Array.from(rail.children) as HTMLElement[]) {
          const childCenter = child.offsetLeft + child.offsetWidth / 2;
          const distance = Math.abs(childCenter - center);
          if (distance < closestDistance) {
            closestDistance = distance;
            closest =
              photos.find((candidate) => candidate.id === child.dataset.photoId) ?? null;
          }
        }

        if (closest && closest.id !== featuredId) {
          onFeature(closest.id);
        }
      }}
    >
      {photos.map((photo) => (
        <article
          className={photo.id === featuredId ? "rail-photo active" : "rail-photo"}
          data-photo-id={photo.id}
          key={photo.id}
        >
          <img src={assetUrl(photo.derivatives.large)} alt={photo.title} />
          <h2>{photo.title}</h2>
          <p>{photo.displayLocationName}</p>
          <a href={mapsUrl(photo)} target="_blank" rel="noreferrer">
            Open map
          </a>
        </article>
      ))}
    </div>
  );
}

function Lightbox({
  photo,
  onClose,
  onPrevious,
  onNext
}: {
  photo: PublicPhotoEntry;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={photo.title}>
      <button className="lightbox-close" type="button" onClick={onClose}>
        Close
      </button>
      <button className="lightbox-nav previous" type="button" onClick={onPrevious}>
        Previous
      </button>
      <img src={assetUrl(photo.derivatives.large)} alt={photo.title} />
      <button className="lightbox-nav next" type="button" onClick={onNext}>
        Next
      </button>
      <div className="lightbox-caption">
        <strong>{photo.title}</strong>
        <span>{photo.displayLocationName}</span>
      </div>
    </div>
  );
}

function applyMarkerSpread(photos: PublicPhotoEntry[]) {
  const groups = new Map<string, PublicPhotoEntry[]>();
  for (const photo of photos) {
    const key = `${photo.latitude.toFixed(5)},${photo.longitude.toFixed(5)}`;
    groups.set(key, [...(groups.get(key) ?? []), photo]);
  }

  return photos.map((photo) => {
    const key = `${photo.latitude.toFixed(5)},${photo.longitude.toFixed(5)}`;
    const group = groups.get(key) ?? [photo];
    const index = group.findIndex((candidate) => candidate.id === photo.id);
    if (group.length === 1) {
      return { photo, latitude: photo.latitude, longitude: photo.longitude };
    }

    const angle = (Math.PI * 2 * index) / group.length;
    const distance = 0.00016;
    return {
      photo,
      latitude: photo.latitude + Math.sin(angle) * distance,
      longitude: photo.longitude + Math.cos(angle) * distance
    };
  });
}

function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value)
  );
}

function mapsUrl(photo: PublicPhotoEntry): string {
  const query = `${photo.latitude},${photo.longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

function formatCoordinate(value: number): string {
  return value.toFixed(5);
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PublicApp />
  </React.StrictMode>
);

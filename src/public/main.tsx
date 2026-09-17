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
type PhotoMapItem =
  | {
      type: "photo";
      key: PhotoId;
      photos: [PublicPhotoEntry];
      latitude: number;
      longitude: number;
    }
  | {
      type: "cluster";
      key: string;
      photos: PublicPhotoEntry[];
      latitude: number;
      longitude: number;
    };

const CLUSTER_RADIUS_KM = 5;
const CLUSTER_DISABLE_ZOOM = 13;

function PublicApp() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [titleQuery, setTitleQuery] = useState("");
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
        setTitleQuery(params.get("q") ?? "");
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

    const normalizedTitleQuery = titleQuery.trim().toLocaleLowerCase();

    return data.photos.filter((photo) => {
      const matchesTags = selectedTags.every((tag) => photo.tags.includes(tag));
      const matchesTitle =
        normalizedTitleQuery.length === 0 ||
        photo.title.toLocaleLowerCase().includes(normalizedTitleQuery);

      return matchesTags && matchesTitle;
    });
  }, [data, selectedTags, titleQuery]);

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
    if (titleQuery.trim()) {
      params.set("q", titleQuery.trim());
    }

    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [data, featuredPhoto, selectedTags, titleQuery]);

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
    return <LoadingGuide />;
  }

  if (loadState.status === "error") {
    return <main className="loading-shell">{loadState.message}</main>;
  }

  return (
    <main className="public-shell">
      <PhotoMap
        photos={filteredPhotos}
        totalPhotoCount={loadState.data.photos.length}
        featuredPhoto={featuredPhoto}
        onFeature={featurePhoto}
      />
      <aside className="photo-panel" aria-label="Photo viewer">
        <TagFilters
          tags={loadState.data.tags}
          selectedTags={selectedTags}
          titleQuery={titleQuery}
          onToggle={toggleTag}
          onClear={() => setSelectedTags([])}
          onTitleQueryChange={setTitleQuery}
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
            <h1>No photos match these filters.</h1>
            <button
              type="button"
              onClick={() => {
                setSelectedTags([]);
                setTitleQuery("");
              }}
            >
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

function LoadingGuide() {
  return (
    <main className="loading-shell" aria-live="polite" aria-label="Loading photos">
      <div className="loading-guide">
        <section className="loading-map-guide" aria-hidden="true">
          <div className="loading-title-card">
            <strong>Big Stuff</strong>
            <span>Loading the map...</span>
          </div>
          <div className="guide-callout map-callout">Select from the map</div>
        </section>
        <section className="loading-panel-guide" aria-hidden="true">
          <div className="guide-filter-row" />
          <div className="guide-image-window">
            <div className="guide-callout image-callout">Click for more info</div>
          </div>
          <div className="guide-meta-row">
            <span />
            <span />
            <div className="guide-callout coordinates-callout">Visit the location</div>
          </div>
          <div className="guide-list">
            <div className="guide-callout list-callout">Scroll the list</div>
            <span />
            <span />
            <span />
            <span />
          </div>
        </section>
      </div>
    </main>
  );
}

function PhotoMap({
  photos,
  totalPhotoCount,
  featuredPhoto,
  onFeature
}: {
  photos: PublicPhotoEntry[];
  totalPhotoCount: number;
  featuredPhoto: PublicPhotoEntry | null;
  onFeature: (photoId: PhotoId) => void;
}) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [mapZoom, setMapZoom] = useState(2);

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

    mapRef.current = map;
    setMapZoom(map.getZoom());

    function syncZoom() {
      setMapZoom(map.getZoom());
    }

    map.on("zoomend", syncZoom);

    return () => {
      map.off("zoomend", syncZoom);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const mapItems = buildPhotoMapItems(photos, mapZoom);
    const nextKeys = new Set(mapItems.map((item) => item.key));
    for (const [itemKey, marker] of markersRef.current) {
      if (!nextKeys.has(itemKey)) {
        marker.remove();
        markersRef.current.delete(itemKey);
      }
    }

    for (const item of mapItems) {
      const existingMarker = markersRef.current.get(item.key);
      if (existingMarker) {
        existingMarker.setLatLng([item.latitude, item.longitude]);
        continue;
      }

      const marker = L.marker([item.latitude, item.longitude], {
        icon: createPhotoMapIcon(item),
        keyboard: false
      });
      marker.on("click", () => {
        if (item.type === "photo") {
          onFeature(item.photos[0].id);
          return;
        }

        const bounds = L.latLngBounds(
          item.photos.map((photo) => [photo.latitude, photo.longitude])
        );
        map.fitBounds(bounds.pad(0.35), {
          maxZoom: CLUSTER_DISABLE_ZOOM,
          duration: 0.45
        });
      });
      marker.addTo(map);
      markersRef.current.set(item.key, marker);
    }
  }, [mapZoom, onFeature, photos]);

  useEffect(() => {
    for (const [itemKey, marker] of markersRef.current) {
      const isFeatured = itemKeyContainsPhoto(itemKey, featuredPhoto?.id ?? null);
      marker.setZIndexOffset(isFeatured ? 1000 : 0);
      marker.getElement()?.classList.toggle("featured", isFeatured);
    }
  }, [featuredPhoto]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !featuredPhoto) {
      return;
    }

    map.flyTo(
      [featuredPhoto.latitude, featuredPhoto.longitude],
      Math.max(map.getZoom(), CLUSTER_DISABLE_ZOOM),
      {
        duration: 0.7
      }
    );
  }, [featuredPhoto]);

  return (
    <section className="map-shell" aria-label="Photo map">
      <div ref={elementRef} className="map-panel" />
      <header className="site-title">
        <h1>Big Stuff</h1>
        <p>{totalPhotoCount} Big Things found. Millions to go.</p>
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
        <div className="feature-meta-line">
          <h1>{photo.title}</h1>
          <span className="location">{photo.displayLocationName}</span>
          <time dateTime={photo.takenAt}>{formatDate(photo.takenAt)}</time>
          <a
            className="gps-link"
            href={mapsUrl(photo)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${photo.title} location in maps`}
            title="Open location in maps"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
              <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" />
              <path d="M9 3v15" />
              <path d="M15 6v15" />
            </svg>
          </a>
        </div>
        {photo.description ? <p>{photo.description}</p> : null}
      </div>
    </section>
  );
}

function TagFilters({
  tags,
  selectedTags,
  titleQuery,
  onToggle,
  onClear,
  onTitleQueryChange
}: {
  tags: string[];
  selectedTags: string[];
  titleQuery: string;
  onToggle: (tag: string) => void;
  onClear: () => void;
  onTitleQueryChange: (query: string) => void;
}) {
  const visibleTags = tags.filter((tag) => !HIDDEN_FILTER_TAGS.has(tag));
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  return (
    <section className="tag-filters" aria-label="Tag filters">
      {visibleTags.map((tag) => (
        <button
          className={selectedTags.includes(tag) ? "active" : ""}
          key={tag}
          type="button"
          onClick={() => onToggle(tag)}
        >
          {formatFilterTag(tag)}
        </button>
      ))}
      {selectedTags.length > 0 ? (
        <button className="clear-filter" type="button" onClick={onClear}>
          Clear
        </button>
      ) : null}
      <button
        className={titleQuery ? "title-search-toggle active" : "title-search-toggle"}
        type="button"
        aria-expanded={isSearchOpen}
        aria-label="Filter by title"
        title="Filter by title"
        onClick={() => setIsSearchOpen((current) => !current)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <circle cx="11" cy="11" r="7" />
          <path d="M16.5 16.5 21 21" />
        </svg>
      </button>
      {isSearchOpen ? (
        <div className="title-search-popover">
          <input
            ref={inputRef}
            type="search"
            value={titleQuery}
            placeholder="Filter by title"
            aria-label="Filter by title"
            onChange={(event) => onTitleQueryChange(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsSearchOpen(false);
              }
            }}
          />
          {titleQuery ? (
            <button
              type="button"
              aria-label="Clear title filter"
              onClick={() => onTitleQueryChange("")}
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

const HIDDEN_FILTER_TAGS = new Set(["big things", "biggish things"]);

function formatFilterTag(tag: string): string {
  return tag === "classics" ? "Show Classic Big Things Only" : tag;
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
      {photos.map((photo) => (
        <button
          ref={photo.id === featuredId ? selectedRef : null}
          className={photo.id === featuredId ? "active" : ""}
          key={photo.id}
          type="button"
          onClick={() => onFeature(photo.id)}
        >
          <span>
            <strong>{photo.title}</strong>
            <small>{photo.displayLocationName}</small>
          </span>
          <time dateTime={photo.takenAt}>{formatDate(photo.takenAt)}</time>
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
  const isProgrammaticScrollRef = useRef(false);
  const skipNextFeatureSyncRef = useRef(false);

  useEffect(() => {
    if (skipNextFeatureSyncRef.current) {
      skipNextFeatureSyncRef.current = false;
      return;
    }

    const active = railRef.current?.querySelector<HTMLElement>(
      `[data-photo-id="${featuredId}"]`
    );
    if (!active) {
      return;
    }

    isProgrammaticScrollRef.current = true;
    window.requestAnimationFrame(() => {
      active.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 450);
    });
  }, [featuredId]);

  return (
    <div
      ref={railRef}
      className="photo-rail"
      onScroll={(event) => {
        if (isProgrammaticScrollRef.current) {
          return;
        }

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
          skipNextFeatureSyncRef.current = true;
          onFeature(closest.id);
        }
      }}
    >
      {photos.map((photo) => (
        <article
          className={photo.id === featuredId ? "rail-photo active" : "rail-photo"}
          data-photo-id={photo.id}
          key={photo.id}
          onClick={() => onFeature(photo.id)}
        >
          <img src={assetUrl(photo.derivatives.large)} alt={photo.title} />
          <h2>{photo.title}</h2>
          <p>{photo.displayLocationName}</p>
          <time dateTime={photo.takenAt}>{formatDate(photo.takenAt)}</time>
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

function createPhotoMapIcon(item: PhotoMapItem): L.DivIcon {
  if (item.type === "cluster") {
    return L.divIcon({
      className: "photo-cluster-marker",
      html: `<span>${item.photos.length}</span>`,
      iconSize: [50, 50],
      iconAnchor: [25, 25]
    });
  }

  const photo = item.photos[0];
  return L.divIcon({
    className: "photo-marker",
    html: `<img src="${assetUrl(photo.derivatives.marker)}" alt="" loading="eager" decoding="async">`,
    iconSize: [46, 46],
    iconAnchor: [23, 23]
  });
}

function itemKeyContainsPhoto(itemKey: string, photoId: PhotoId | null): boolean {
  if (!photoId) {
    return false;
  }

  if (itemKey === photoId) {
    return true;
  }

  return (
    itemKey.startsWith("cluster:") &&
    itemKey.slice("cluster:".length).split("|").includes(photoId)
  );
}

function buildPhotoMapItems(photos: PublicPhotoEntry[], zoom: number): PhotoMapItem[] {
  if (zoom >= CLUSTER_DISABLE_ZOOM) {
    return applyMarkerSpread(photos).map(({ photo, latitude, longitude }) => ({
      type: "photo",
      key: photo.id,
      photos: [photo],
      latitude,
      longitude
    }));
  }

  const clusters: Array<{
    photos: PublicPhotoEntry[];
    latitude: number;
    longitude: number;
  }> = [];

  for (const photo of photos) {
    const cluster = clusters.find(
      (candidate) =>
        distanceInKilometers(
          photo.latitude,
          photo.longitude,
          candidate.latitude,
          candidate.longitude
        ) <= CLUSTER_RADIUS_KM
    );

    if (!cluster) {
      clusters.push({
        photos: [photo],
        latitude: photo.latitude,
        longitude: photo.longitude
      });
      continue;
    }

    cluster.photos.push(photo);
    cluster.latitude = average(cluster.photos.map((clusterPhoto) => clusterPhoto.latitude));
    cluster.longitude = average(
      cluster.photos.map((clusterPhoto) => clusterPhoto.longitude)
    );
  }

  const mapItems: PhotoMapItem[] = [];
  for (const cluster of clusters) {
    if (cluster.photos.length === 1) {
      const photo = cluster.photos[0];
      mapItems.push({
        type: "photo",
        key: photo.id,
        photos: [photo],
        latitude: photo.latitude,
        longitude: photo.longitude
      });
      continue;
    }

    const ids = cluster.photos.map((photo) => photo.id).sort();
    mapItems.push({
      type: "cluster",
      key: `cluster:${ids.join("|")}`,
      photos: cluster.photos,
      latitude: cluster.latitude,
      longitude: cluster.longitude
    });
  }

  return mapItems;
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

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function distanceInKilometers(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
): number {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const originLatitude = toRadians(latitudeA);
  const destinationLatitude = toRadians(latitudeB);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
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

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PublicApp />
  </React.StrictMode>
);

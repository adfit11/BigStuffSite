import React from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./styles.css";

function PublicApp() {
  return (
    <main className="public-shell">
      <section className="map-panel" aria-label="Photo map">
        <div className="placeholder">
          <strong>Map</strong>
          <span>Leaflet/OpenStreetMap viewer goes here.</span>
        </div>
      </section>
      <aside className="photo-panel" aria-label="Photo viewer">
        <div className="feature-panel">
          <p className="eyebrow">Big Stuff Site</p>
          <h1>Photo map scaffold</h1>
          <p>
            Public data, thumbnail markers, desktop list, and mobile photo rail
            will build out from the PRD.
          </p>
        </div>
        <nav className="title-list" aria-label="Chronological photo list">
          <button type="button">No publishable photos yet</button>
        </nav>
      </aside>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PublicApp />
  </React.StrictMode>
);

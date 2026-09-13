import React from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./styles.css";

function AdminApp() {
  return (
    <main className="admin-shell">
      <header>
        <p className="eyebrow">Local Admin</p>
        <h1>Photo metadata editor</h1>
      </header>
      <nav aria-label="Admin views">
        <button type="button">Incomplete</button>
        <button type="button">All Photos</button>
        <button type="button">Tags</button>
      </nav>
      <section className="admin-grid">
        <div className="queue-panel">No imported photos yet.</div>
        <aside className="editor-panel">Select a photo to edit.</aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);

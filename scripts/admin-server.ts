import express from "express";
import { readFile, writeFile } from "node:fs/promises";
import { createServer as createViteServer } from "vite";
import type { EditorialData, ImportedPhotoEntry } from "../src/shared/types";

const app = express();
const port = Number(process.env.PORT ?? 5174);
const EDITORIAL_PATH = "data/editorial.json";
const PHOTOS_PATH = "data/photos.json";

app.use(express.json({ limit: "2mb" }));

app.get("/api/photos", async (_request, response) => {
  const raw = await readFile(PHOTOS_PATH, "utf8");
  response.type("json").send(raw);
});

app.get("/api/editorial", async (_request, response) => {
  const raw = await readFile(EDITORIAL_PATH, "utf8");
  response.type("json").send(raw);
});

app.put("/api/editorial", async (request, response) => {
  const editorial = request.body as EditorialData;
  const importedPhotos = JSON.parse(
    await readFile(PHOTOS_PATH, "utf8")
  ) as ImportedPhotoEntry[];
  const validIds = new Set(importedPhotos.map((photo) => photo.id));
  const validTags = new Set(editorial.tags);

  for (const [photoId, photo] of Object.entries(editorial.photos)) {
    if (!validIds.has(photoId)) {
      response.status(400).json({ error: `Unknown photo ID: ${photoId}` });
      return;
    }

    const unknownTag = photo.tags.find((tag) => !validTags.has(tag));
    if (unknownTag) {
      response.status(400).json({ error: `Unknown tag: ${unknownTag}` });
      return;
    }
  }

  await writeFile(EDITORIAL_PATH, `${JSON.stringify(editorial, null, 2)}\n`);
  response.json({ ok: true });
});

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom"
});

app.use(vite.middlewares);

app.use("*", async (request, response, next) => {
  try {
    const template = await readFile("admin.html", "utf8");
    const html = await vite.transformIndexHtml(request.originalUrl, template);
    response.status(200).type("html").send(html);
  } catch (error) {
    vite.ssrFixStacktrace(error as Error);
    next(error);
  }
});

app.listen(port, () => {
  console.log(`Admin listening on http://127.0.0.1:${port}`);
});

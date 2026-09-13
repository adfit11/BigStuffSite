import express from "express";
import { readFile, writeFile } from "node:fs/promises";
import type { EditorialData } from "../src/shared/types";

const app = express();
const port = Number(process.env.PORT ?? 5174);
const EDITORIAL_PATH = "data/editorial.json";

app.use(express.json({ limit: "2mb" }));

app.get("/api/editorial", async (_request, response) => {
  const raw = await readFile(EDITORIAL_PATH, "utf8");
  response.type("json").send(raw);
});

app.put("/api/editorial", async (request, response) => {
  const editorial = request.body as EditorialData;
  await writeFile(EDITORIAL_PATH, `${JSON.stringify(editorial, null, 2)}\n`);
  response.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Admin API listening on http://127.0.0.1:${port}`);
});

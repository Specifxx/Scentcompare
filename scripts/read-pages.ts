// The page jobs of import.yml: each runner takes every Nth "pages" store
// (src/content/stores.ts) and reads its product pages (lib/import/pages.ts)
// for up to MINUTES, then writes each store's state to pages-out/<id>.json.
// The import job lays those over data/state/pages/ and turns the fresh
// readings into listings. A store that fails keeps its old state (its
// readings age out after MAX_AGE_DAYS) and shows as failed in meta.json.
import fs from "node:fs";
import path from "node:path";
import { STORES } from "@/content/stores";
import { PAGES_PER_RUN, readPagesStore, type PagesFile } from "@/lib/import/pages";
import { unpackProducts } from "@/lib/products-file";

const SHARD = Number(process.env.SHARD ?? 0);
const SHARDS = Number(process.env.SHARDS ?? 1);
const MINUTES = Number(process.env.MINUTES ?? 90);
// BUDGET (pages per store) overrides every store's own, for a trial run.
const OUT = path.resolve("pages-out");

async function main() {
  const only = process.env.STORES?.split(",").filter(Boolean);
  const mine = STORES.filter((s) => s.platform === "pages" && (!only || only.includes(s.id))).filter((_, i) => only || i % SHARDS === SHARD);
  fs.mkdirSync(OUT, { recursive: true });
  const end = Date.now() + MINUTES * 60_000;
  const today = new Date().toISOString().slice(0, 10);
  // Barcodes already on the site: their pages are re-read first.
  let wanted = new Set<string>();
  try {
    wanted = new Set(unpackProducts(JSON.parse(fs.readFileSync("data/public/products.json", "utf8"))).map((p) => p.ean));
  } catch {
    // No catalogue yet.
  }
  for (let i = 0; i < mine.length; i++) {
    const s = mine[i];
    const file = path.join("data/state/pages", `${s.id}.json`);
    let state: PagesFile = { pages: {} };
    try {
      state = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      // A new store: start empty.
    }
    // Each store gets an even share of the time left.
    const deadline = Date.now() + (end - Date.now()) / (mine.length - i);
    try {
      const run = await readPagesStore(s, state.pages, today, Number(process.env.BUDGET) || s.pages?.budget || PAGES_PER_RUN, deadline, wanted);
      state.run = { ...run, at: today };
      fs.writeFileSync(path.join(OUT, `${s.id}.json`), JSON.stringify(state));
      console.log(`✓ ${s.id}: ${run.pages} pages listed, ${run.read} read today, ${run.withCode} with a barcode${run.stopped ? ` (stopped: ${run.stopped})` : ""}`);
    } catch (e) {
      console.log(`✗ ${s.id}: ${(e as Error).message}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

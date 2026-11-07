// The product-page reader, for fragrance stores that are not on Shopify and
// have no open product API (Magento, BigCommerce, PrestaShop, custom shops):
// their sitemap lists the product pages, and each page's schema.org Product
// (lib/import/jsonld.ts) gives the name, the GTIN the shop prints, the price,
// its currency and the stock. Only pages robots.txt allows, one request about
// every 1.2 seconds, a page budget per run, and a store that answers with a
// bot wall is stopped for the run (never worked around).
//
// A page costs a request, so pages are not all read every day: each run reads
// the pages never seen first, then the ones read longest ago, and the state
// (data/state/pages/<store>.json) keeps what each page said and when. A
// listing is published only while its reading is at most MAX_AGE_DAYS old; a
// page with no barcode is asked again after 30 days.
import { REGION_BY_CODE } from "@/site";
import type { Store } from "@/content/stores";
import type { Listing, Stock } from "../types";
import { fetchText, sleep } from "./http";
import { isBotWall, readPageProducts } from "./jsonld";
import { parseRobots, robotsAllows, type Robots } from "./robots";

export const PAGE_PACE_MS = 1200;
export const MAX_AGE_DAYS = 5;
const NO_CODE_RETRY_DAYS = 30;
const MAX_SITEMAPS = 40;

export interface PageReading {
  /** day read (YYYY-MM-DD) */
  at: string;
  /** what the page offered; empty: no product with a barcode */
  p: { e: string; c: number; cur: string; st: Stock; t: string; b: string; i: string | null; u?: string }[];
}
export type PageState = Record<string, PageReading>;
/** data/state/pages/<store>.json */
export interface PagesFile {
  /** the last run's tally */
  run?: PagesRun & { at: string };
  pages: PageState;
}
export const PAGES_PER_RUN = 1500;

const locs = (xml: string) =>
  [...xml.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)\s*(?:\]\]>)?\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));

export async function readRobots(base: string): Promise<Robots> {
  const r = await fetchText(`${base}/robots.txt`, "text/plain,*/*");
  if (r.status >= 500) throw new Error(`robots.txt answered ${r.status}`);
  if (r.status !== 200) return { disallow: [], allow: [], sitemaps: [] };
  return parseRobots(r.text);
}

/** Every page URL in the store's sitemaps (an index is followed; child sitemaps that look like products first). */
export async function sitemapPages(store: Store, robots: Robots): Promise<string[]> {
  const start = store.pages?.sitemaps?.map((s) => new URL(s, store.base).toString()) ?? (robots.sitemaps.length ? robots.sitemaps : [`${store.base}/sitemap.xml`]);
  const childMatch = store.pages?.sitemapMatch ? new RegExp(store.pages.sitemapMatch, "i") : null;
  const queue = [...start];
  const seen = new Set<string>();
  const pages = new Set<string>();
  while (queue.length && seen.size < MAX_SITEMAPS) {
    const u = queue.shift()!;
    if (seen.has(u)) continue;
    seen.add(u);
    if (/\.gz(\?|$)/.test(u)) continue;
    const r = await fetchText(u, "application/xml,text/xml,*/*");
    if (r.status !== 200) continue;
    const ls = locs(r.text);
    if (/<sitemapindex/i.test(r.text)) {
      const kids = childMatch ? ls.filter((k) => childMatch.test(k)) : ls.filter((k) => /product|prod|item|catalog/i.test(k)).concat(ls.some((k) => /product|prod|item|catalog/i.test(k)) ? [] : ls);
      queue.unshift(...kids);
    } else for (const l of ls) pages.add(l);
    await sleep(PAGE_PACE_MS);
  }
  const keep = store.pages?.urlMatch ? new RegExp(store.pages.urlMatch, "i") : null;
  return [...pages].filter((u) => {
    try {
      const url = new URL(u);
      if (bare(url.host) !== bare(new URL(store.base).host)) return false;
      if (keep && !keep.test(url.pathname)) return false;
      return robotsAllows(robots, url.pathname + url.search);
    } catch {
      return false;
    }
  });
}

const bare = (h: string) => h.toLowerCase().replace(/^www\./, "");
const daysBetween = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 86_400_000;

/**
 * The order pages are read in. Pages whose barcode is already a product on the
 * site (`wanted`: they feed a comparison today) come first, oldest reading
 * first, for up to 60% of the budget; then pages never read; then the other
 * readings with a barcode, oldest first; then no-barcode pages a month old.
 */
export function pageQueue(urls: string[], state: PageState, today: string, wanted: Set<string> = new Set(), budget = Infinity): string[] {
  const fresh: string[] = [];
  const hot: [string, string][] = [];
  const known: [string, string][] = [];
  const retry: [string, string][] = [];
  for (const u of urls) {
    const s = state[u];
    if (!s) fresh.push(u);
    else if (s.p.length) (s.p.some((p) => wanted.has(p.e)) ? hot : known).push([u, s.at]);
    else if (daysBetween(s.at, today) >= NO_CODE_RETRY_DAYS) retry.push([u, s.at]);
  }
  const byAge = (a: [string, string], b: [string, string]) => a[1].localeCompare(b[1]);
  const hotUrls = hot.sort(byAge).map(([u]) => u);
  const first = Number.isFinite(budget) ? Math.floor(budget * 0.6) : hotUrls.length;
  return [...hotUrls.slice(0, first), ...fresh, ...hotUrls.slice(first), ...known.sort(byAge).map(([u]) => u), ...retry.sort(byAge).map(([u]) => u)];
}

/** Listings from the state: readings at most MAX_AGE_DAYS old, priced in the region's own currency. */
export function listingsFromState(store: Store, state: PageState, today: string): Listing[] {
  const want = REGION_BY_CODE[store.region].currency;
  // A barcode the shop prints on two pages that name different products is the shop's own mistake (one
  // GTIN pasted across a range): no page of it is trusted. The same product on two pages counts once.
  const names = new Map<string, Set<string>>();
  for (const s of Object.values(state)) for (const p of s.p) names.set(p.e, (names.get(p.e) ?? new Set()).add(p.t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()));
  const out: Listing[] = [];
  const seen = new Set<string>();
  for (const [url, s] of Object.entries(state)) {
    if (daysBetween(s.at, today) > MAX_AGE_DAYS) continue;
    for (const p of s.p) {
      if (p.cur && p.cur !== want) continue;
      if ((names.get(p.e)?.size ?? 0) > 1 || seen.has(p.e)) continue;
      seen.add(p.e);
      out.push({ store: store.id, region: store.region, title: p.t, vendor: p.b, kind: "", ean: p.e, cents: p.c, st: p.st, url: p.u ?? url, img: p.i });
    }
  }
  return out;
}

export interface PagesRun {
  pages: number;
  read: number;
  withCode: number;
  stopped?: string;
}

/**
 * Read up to `budget` pages of one store (or until `deadline`), updating its
 * state in place. Throws when the store is walled or unreadable before a
 * single page is read, so the run records it as failed.
 */
export async function readPagesStore(store: Store, state: PageState, today: string, budget: number, deadline: number, wanted: Set<string> = new Set()): Promise<PagesRun> {
  const robots = await readRobots(store.base);
  const urls = await sitemapPages(store, robots);
  if (!urls.length) throw new Error("no product pages in the sitemap");
  const live = new Set(urls);
  for (const u of Object.keys(state)) if (!live.has(u)) delete state[u];
  const want = REGION_BY_CODE[store.region].currency;
  const run: PagesRun = { pages: urls.length, read: 0, withCode: 0 };
  let walls = 0;
  for (const u of pageQueue(urls, state, today, wanted, budget)) {
    if (run.read >= budget || Date.now() > deadline) break;
    let r;
    try {
      r = await fetchText(u);
    } catch {
      await sleep(PAGE_PACE_MS);
      continue;
    }
    await sleep(PAGE_PACE_MS);
    if (isBotWall(r.status, r.text)) {
      if (++walls >= 3) {
        run.stopped = `bot wall (HTTP ${r.status})`;
        if (!run.read) throw new Error(`${run.stopped} before any page was read`);
        break;
      }
      continue;
    }
    walls = 0;
    if (r.status === 404 || r.status === 410) {
      delete state[u];
      continue;
    }
    if (r.status !== 200) continue;
    run.read++;
    const ps = readPageProducts(r.text).filter((p) => !p.currency || p.currency === want);
    if (ps.length) run.withCode++;
    state[u] = { at: today, p: ps.map((p) => ({ e: p.ean, c: p.cents, cur: p.currency, st: p.st, t: p.name, b: p.brand, i: p.img, ...(p.url && p.url !== u ? { u: p.url } : {}) })) };
  }
  return run;
}

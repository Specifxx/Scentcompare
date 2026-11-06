// Reads a WooCommerce store through its public Store API
// (/wp-json/wc/store/v1/products, the one its own cart and blocks use): 100
// products a page with name, price, currency, stock, SKU, photo and link. A
// variable product's sizes are read as variations (type=variation), each its
// own listing. The barcode is the SKU when the shop files the EAN there;
// otherwise the product page's schema.org GTIN (lib/import/jsonld.ts), looked
// up once per product and cached like Shopify's barcodes. Only when robots.txt
// allows /wp-json/; about a request a second.
import { REGION_BY_CODE } from "@/site";
import type { Store } from "@/content/stores";
import { eanOf } from "../ean";
import { readTitle } from "../title";
import type { Listing } from "../types";
import { fetchJson, fetchText, sleep } from "./http";
import { isBotWall, readPageProducts } from "./jsonld";
import { readRobots } from "./pages";
import { robotsAllows } from "./robots";
import { cachedCodes, FRAGRANCE_WORDS, PACE_MS, type BarcodeCache, type ReadResult } from "./shopify";

export interface WooProduct {
  id: number;
  name: string;
  parent?: number;
  type: string;
  /** a variation's attributes as text ("Size: 100ml"), when the API gives it */
  variation?: string;
  permalink: string;
  sku?: string;
  is_in_stock: boolean;
  is_purchasable?: boolean;
  prices: { price: string; currency_code: string; currency_minor_unit: number };
  images?: { src: string }[];
  categories?: { name: string }[];
  brands?: { name: string }[];
  attributes?: { name: string; terms?: { name: string }[] }[];
  variations?: { id: number; attributes: { name: string; value: string }[] }[];
}

const MAX_PAGES = 60;

function decode(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&#0?39;|&#8217;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&#8211;|&#8212;/g, "-").replace(/<[^>]+>/g, "").trim();
}

export function wooBrand(p: WooProduct): string {
  const b = p.brands?.[0]?.name;
  if (b) return decode(b);
  const a = p.attributes?.find((x) => /^(brand|marke|marque|marca|merk|house|designer)$/i.test(x.name.trim()));
  return a?.terms?.[0]?.name ? decode(a.terms[0].name) : "";
}

export function wooTitle(p: WooProduct, parentName?: string): string {
  // A variation's own name is often "Parent - 100ml" already; else the parent's name plus its attributes.
  const own = decode(p.name);
  const name = parentName && !own.toLowerCase().startsWith(decode(parentName).toLowerCase()) ? decode(parentName) : own;
  const v = (p.variation ?? "").replace(/^[^:]+:\s*/g, "").trim();
  return v && !name.toLowerCase().includes(v.toLowerCase()) ? `${name} (${decode(v)})` : name;
}

/** One Store API product → a listing (or why not). */
export function wooListing(store: Store, p: WooProduct, ean: string | null, parentName?: string): { listing?: Listing; refused?: string; noEan?: true } {
  const minor = p.prices.currency_minor_unit ?? 2;
  const cents = Math.round((Number(p.prices.price) / 10 ** minor) * 100);
  if (!(cents > 0)) return { refused: "no-price" };
  const title = wooTitle(p, parentName);
  const kind = (p.categories ?? []).map((c) => decode(c.name)).join(" ");
  const info = readTitle(title, kind);
  if ("refused" in info) return { refused: info.refused };
  if (!ean) return { noEan: true };
  return {
    listing: {
      store: store.id,
      region: store.region,
      title,
      vendor: wooBrand(p),
      kind,
      ean,
      cents,
      st: p.is_in_stock ? "in" : "out",
      url: p.permalink,
      img: p.images?.[0]?.src ?? null,
    },
  };
}

async function pageCode(url: string): Promise<string | null | undefined> {
  const r = await fetchText(url);
  if (isBotWall(r.status, r.text)) throw new Error(`bot wall (HTTP ${r.status})`);
  if (r.status !== 200) return undefined;
  const codes = [...new Set(readPageProducts(r.text).map((p) => p.ean))];
  return codes.length === 1 ? codes[0] : null;
}

export async function readWoo(store: Store, cache: BarcodeCache, budget: { lookups: number }): Promise<ReadResult> {
  const robots = await readRobots(store.base);
  if (!robotsAllows(robots, "/wp-json/wc/store/v1/products")) throw new Error("robots.txt disallows the Store API");
  const want = REGION_BY_CODE[store.region].currency;
  const res: ReadResult = { listings: [], seen: 0, refused: {}, noEan: 0 };
  const parents = new Map<number, WooProduct>();
  const all: WooProduct[] = [];
  const pages = async (type: string) => {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const list = await fetchJson<WooProduct[]>(`${store.base}/wp-json/wc/store/v1/products?per_page=100&page=${page}${type ? `&type=${type}` : ""}`);
      for (const p of list) {
        if (p.prices?.currency_code && p.prices.currency_code !== want) throw new Error(`prices in ${p.prices.currency_code}, region needs ${want}`);
        if (p.type === "variable") parents.set(p.id, p);
        else all.push(p);
      }
      await sleep(PACE_MS);
      if (list.length < 100) break;
    }
  };
  await pages("");
  // Sizes of variable products. An older Store API without the variation filter just leaves them out.
  if (parents.size) await pages("variation").catch(() => undefined);
  const seen = new Set<number>();
  for (const p of all) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    // A variation whose parent is not a listed variable product (a draft, hidden) is skipped.
    const parent = p.type === "variation" ? parents.get(p.parent ?? -1) : undefined;
    if (p.type === "variation" && !parent) continue;
    res.seen++;
    let ean = eanOf({ sku: p.sku ?? null });
    const name = decode(parent?.name ?? p.name);
    if (!ean && p.type !== "variation") {
      const key = `${store.id}:w${p.id}`;
      let codes = cachedCodes(cache[key]);
      if (codes === undefined && budget.lookups > 0 && !("refused" in readTitle(name)) && (!store.mixed || FRAGRANCE_WORDS.test(name))) {
        budget.lookups--;
        const found = await pageCode(p.permalink).catch((e: Error) => {
          if (/bot wall/.test(e.message)) budget.lookups = 0;
          return undefined;
        });
        if (found !== undefined) {
          codes = { [String(p.id)]: found };
          cache[key] = { at: new Date().toISOString().slice(0, 10), v: codes };
        }
        await sleep(PACE_MS);
      }
      ean = codes?.[String(p.id)] ?? null;
    }
    const r = wooListing(store, p, ean, parent ? parent.name : undefined);
    if (r.listing) res.listings.push(r.listing);
    else if (r.noEan) res.noEan++;
    else if (r.refused) res.refused[r.refused] = (res.refused[r.refused] ?? 0) + 1;
  }
  return res;
}

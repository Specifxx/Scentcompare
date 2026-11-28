// The home page's ranking input and how a product reads into it (lib/home-rank.ts; DECISIONS.md "Home pages rank items by
// demand", 2026-11-18). data/demand.json is written into the daily data commit by import.yml (scripts/pull-demand.sh, from
// RiftCompare's /api/demand/<site>: product page views, last 28 and 7 days) and read at build: imported, no request-time read.
import raw from "../../data/demand.json";
import type { RegionCode } from "@/site";
import { bestIn } from "./data";
import { MIN_SIGNAL, homeRankOn, rankItems, type DemandFile } from "./home-rank";
import type { Product } from "./types";

export const HOME_DEMAND = raw as unknown as DemandFile; // via unknown: JSON arrays read as number[], never the [28d, 7d] tuple

/** Products, most likely to earn first in a region: their page's views, stores in stock there, price, how new. */
export function rankProducts(list: readonly Product[], region: RegionCode): Product[] {
  return rankItems(
    list,
    (f) => {
      const best = bestIn(f, region);
      const open = (f.offers[region] ?? []).filter((o) => o.st !== "out");
      return {
        paths: [`/product/${f.slug}`],
        clickKey: f.slug,
        priceCents: best?.offer.p ?? null,
        inStock: new Set(open.map((o) => o.s)).size,
        releaseDate: f.first ? f.first.slice(0, 10) : null,
      };
    },
    HOME_DEMAND,
  );
}

/**
 * The people sections (women's, men's, unisex) on the home page's "Shop by section" row, most opened first by their own
 * page's views in the last 7 days (then 28), so the section people are shopping this week leads (merch, 2026-11-20: /men
 * 54 of 88 views in 7 days against /women 18 of 39). All three still lead the row (owner, 2026-11-05: every gender), a
 * tie keeps the given order, and under MIN_SIGNAL views in all, or with the ranking off, the given order stands.
 */
export function peopleSectionsByDemand<K extends string>(keys: readonly K[], demand: DemandFile | null | undefined = HOME_DEMAND, enabled = homeRankOn()): K[] {
  const views = demand?.views ?? {};
  const seen = (k: K): [number, number] => views[`/${k}`] ?? [0, 0];
  const total = keys.reduce((n, k) => n + seen(k)[0], 0);
  if (!enabled || total < MIN_SIGNAL) return [...keys];
  return keys
    .map((k, i) => ({ k, i, v: seen(k) }))
    .sort((a, b) => b.v[1] - a.v[1] || b.v[0] - a.v[0] || a.i - b.i)
    .map((x) => x.k);
}

/** A brand page needs this many views in the last 7 days to lead the home page's "Popular brands" chips. */
export const BRAND_RISER_MIN = 10;
/** At most this many risers lead; the rest of the row keeps its product-count order. */
export const BRAND_RISERS_MAX = 4;

/**
 * The home page's "Popular brands" chips (merch, 2026-11-28): brands whose own page took BRAND_RISER_MIN+ views this week
 * lead, most viewed first (at most BRAND_RISERS_MAX), then the rest in the given order (product count), `limit` in all.
 * On a phone the row scrolls sideways, so a riser must lead to be seen (YSL, 17th by product count, had 37 of 37 views in
 * 7 days; Tom Ford, 22nd, 12 of 12). Under the floor, or with the ranking off, the given order stands.
 */
export function brandsByDemand<B extends { slug: string }>(brands: readonly B[], limit: number, demand: DemandFile | null | undefined = HOME_DEMAND, enabled = homeRankOn()): B[] {
  if (!enabled) return brands.slice(0, limit);
  const views = demand?.views ?? {};
  const week = (b: B) => (views[`/brands/${b.slug}`] ?? [0, 0])[1];
  const risers = brands
    .map((b, i) => ({ b, i, v: week(b) }))
    .filter((x) => x.v >= BRAND_RISER_MIN)
    .sort((a, b) => b.v - a.v || a.i - b.i)
    .slice(0, BRAND_RISERS_MAX)
    .map((x) => x.b);
  const lead = new Set(risers);
  return [...risers, ...brands.filter((b) => !lead.has(b))].slice(0, limit);
}

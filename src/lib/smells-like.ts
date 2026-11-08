// "Smells like X, costs less" (competitor scan, owner 2026-11-08): for a well-known bottle, the OTHER real
// fragrances from real houses whose store-listed notes overlap most with it and that cost less per ml in a region.
// Never dupes, clones or "inspired by" bottles: the title filter (lib/title.ts) refuses those before anything gets a
// page, so every alternative here is a house's own fragrance with its own barcode. We say the notes overlap, never
// that it smells the same. PURE (tests/smells-like.test.ts). DECISIONS.md 2026-11-08.
import type { Pyramid } from "./notes";
import { allNotes } from "./notes";

/** ml in a size string ("100ml", "3.4 oz", "1.7 fl oz"); null when it gives none. */
export function sizeMl(size: string | null | undefined): number | null {
  if (!size) return null;
  const s = size.toLowerCase().replace(",", ".");
  const ml = /(\d+(?:\.\d+)?)\s?ml\b/.exec(s);
  if (ml) return Number(ml[1]) || null;
  const oz = /(\d+(?:\.\d+)?)\s?(?:fl\.?\s?)?oz\b/.exec(s);
  if (oz) return Math.round(Number(oz[1]) * 29.5735) || null;
  return null;
}

/** Each note's weight: rarer notes say more about a scent than musk or amber do (inverse document frequency). */
export function noteWeights(pyramids: Pyramid[]): Map<string, number> {
  const df = new Map<string, number>();
  for (const p of pyramids) for (const k of allNotes(p)) df.set(k, (df.get(k) ?? 0) + 1);
  const n = Math.max(1, pyramids.length);
  return new Map([...df].map(([k, d]) => [k, Math.log(1 + n / d)]));
}

/** Weighted overlap of two note lists, 0..1 (weighted Jaccard). */
export function noteOverlap(a: Pyramid, b: Pyramid, w: Map<string, number>): number {
  const A = new Set(allNotes(a));
  const B = new Set(allNotes(b));
  let inter = 0;
  let union = 0;
  for (const k of new Set([...A, ...B])) {
    const x = w.get(k) ?? 1;
    union += x;
    if (A.has(k) && B.has(k)) inter += x;
  }
  return union ? inter / union : 0;
}

/** The notes two lists share, in the first list's order. */
export const sharedNotes = (a: Pyramid, b: Pyramid) => {
  const B = new Set(allNotes(b));
  return allNotes(a).filter((k) => B.has(k));
};

/** An alternative must share at least this weighted overlap and this many notes with the reference. */
export const MIN_OVERLAP = 0.3;
export const MIN_SHARED = 3;
/** …and be at least this much cheaper per ml in a region where both are sold. */
export const MIN_SAVING = 0.15;
/** A reference gets a page (indexed, in the sitemap) only with this many alternatives (owner 2026-11-08: 3+). */
export const SMELLS_LIKE_MIN = 3;
/** Alternatives shown on one page. */
export const SMELLS_LIKE_MAX = 12;

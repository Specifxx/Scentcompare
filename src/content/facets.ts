// The niche's own filters on the browse bar (components/Browse.tsx), beside brand and rating: the dimensions a buyer in this space
// narrows by (Bill, 2026-11-09). Each reads only the product's NAME, which the browser already holds in /search-index.json, so a
// filter never reaches a function and nothing here is guessed: a name that does not say, has no value. Client-safe, pure.
export interface Facet {
  key: string;
  /** the select's accessible name */
  label: string;
  /** its first option: "Any size" */
  any: string;
  /** shown before the index has loaded, so the control is never empty */
  values?: string[];
  /** options in this order (else most products first) */
  order?: string[];
  /** at most this many options (default 40) */
  max?: number;
  of(name: string, cat: string): string[];
}

/** "100ml", "3.4 oz", "3.4 fl oz": millilitres, or null when the name has no size. */
export function millilitres(name: string): number | null {
  const ml = name.match(/(\d+(?:[.,]\d+)?)\s?ml\b/i);
  if (ml) return parseFloat(ml[1].replace(",", "."));
  const oz = name.match(/(\d+(?:\.\d+)?)\s?(?:fl\.?\s?)?oz\b/i);
  return oz ? Math.round(parseFloat(oz[1]) * 29.5735) : null;
}

const SIZES = ["Up to 30 ml", "31 to 60 ml", "61 to 100 ml", "Over 100 ml"];
export function sizeBucket(ml: number): string {
  return ml <= 30 ? SIZES[0] : ml <= 60 ? SIZES[1] : ml <= 100 ? SIZES[2] : SIZES[3];
}

const TYPES = ["Eau de parfum", "Eau de toilette", "Parfum", "Eau de cologne", "Aftershave"];
/** The concentration the name states (EDP, EDT, parfum...); one value, the strongest word it uses. */
export function concentration(name: string): string | null {
  if (/\beau de parfum\b|\bedp\b/i.test(name)) return TYPES[0];
  if (/\beau de toilette\b|\bedt\b/i.test(name)) return TYPES[1];
  if (/\bparfum\b|\bextrait\b|\bpure perfume\b/i.test(name)) return TYPES[2];
  if (/\beau de cologne\b|\bedc\b|\bcologne\b/i.test(name)) return TYPES[3];
  if (/\bafter ?shave\b/i.test(name)) return TYPES[4];
  return null;
}

export const FACETS: Facet[] = [
  { key: "type", label: "Concentration", any: "Any type (EDP, EDT…)", values: TYPES, order: TYPES, of: (n) => [concentration(n)].filter((x): x is string => !!x) },
  { key: "size", label: "Bottle size", any: "Any size", values: SIZES, order: SIZES, of: (n) => { const ml = millilitres(n); return ml ? [sizeBucket(ml)] : []; } },
];

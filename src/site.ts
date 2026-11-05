// ScentCompare's one config file: name, host, regions and product sections.
// Store lists live in src/content/stores.ts.

export const SITE = {
  key: "sc",
  name: "ScentCompare",
  domain: "scentcompare.app",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://scentcompare.app").replace(/\/$/, ""),
  slogan: "Smell expensive. Pay less.",
  tagline: "Compare perfume and cologne prices across real fragrance stores",
  description:
    "Compare perfume, cologne and unisex fragrance prices across real fragrance stores in the US, UK, Canada, Australia, New Zealand and Europe. Matched by the barcode on the box, updated daily.",
  /** Every contact address on the site (owner, 2026-10-30: the family inbox). */
  email: "compareempire@gmail.com",
  /** A product gets a page only when this many stores in one region sell it
   *  (comparing one shop is pointless, and it keeps data/ small). */
  minStoresPerRegion: 2,
} as const;

export type RegionCode = "US" | "UK" | "CA" | "AU" | "NZ" | "EU";

export interface Region {
  code: RegionCode;
  name: string;
  /** "in Australia" */
  phrase: string;
  currency: string;
  /** Shopify Markets country asked for on every request (prices follow the
   *  visitor's country, and GitHub's runners are in the US). */
  shopifyCountry: string;
  flag: string;
  ebayHost: string | null;
  amazonHost: string | null;
  /** IANA time zone prefixes that pick this region for a first-time visitor. */
  zones: string[];
}

export const REGIONS: Region[] = [
  { code: "US", name: "United States", phrase: "in the US", currency: "USD", shopifyCountry: "US", flag: "🇺🇸", ebayHost: "www.ebay.com", amazonHost: "www.amazon.com", zones: ["America/"] },
  { code: "UK", name: "United Kingdom", phrase: "in the UK", currency: "GBP", shopifyCountry: "GB", flag: "🇬🇧", ebayHost: "www.ebay.co.uk", amazonHost: "www.amazon.co.uk", zones: ["Europe/London", "Europe/Belfast", "Europe/Dublin"] },
  { code: "CA", name: "Canada", phrase: "in Canada", currency: "CAD", shopifyCountry: "CA", flag: "🇨🇦", ebayHost: "www.ebay.ca", amazonHost: "www.amazon.ca", zones: ["America/Toronto", "America/Vancouver", "America/Edmonton", "America/Winnipeg", "America/Halifax", "America/St_Johns", "America/Regina", "America/Montreal"] },
  { code: "AU", name: "Australia", phrase: "in Australia", currency: "AUD", shopifyCountry: "AU", flag: "🇦🇺", ebayHost: "www.ebay.com.au", amazonHost: "www.amazon.com.au", zones: ["Australia/"] },
  { code: "NZ", name: "New Zealand", phrase: "in New Zealand", currency: "NZD", shopifyCountry: "NZ", flag: "🇳🇿", ebayHost: null, amazonHost: null, zones: ["Pacific/Auckland", "Pacific/Chatham"] },
  { code: "EU", name: "Europe", phrase: "in Europe", currency: "EUR", shopifyCountry: "DE", flag: "🇪🇺", ebayHost: "www.ebay.de", amazonHost: "www.amazon.de", zones: ["Europe/"] },
];

export const REGION_BY_CODE = Object.fromEntries(REGIONS.map((r) => [r.code, r])) as Record<RegionCode, Region>;

/** Pick a region from the browser's time zone; the more specific match wins
 *  (America/Toronto is Canada, not the US). */
export function regionForZone(zone: string | undefined | null): RegionCode {
  if (!zone) return "US";
  let best: { code: RegionCode; len: number } = { code: "US", len: 0 };
  for (const r of REGIONS) {
    for (const z of r.zones) {
      if (zone.startsWith(z) && z.length > best.len) best = { code: r.code, len: z.length };
    }
  }
  return best.code;
}

/**
 * The sections (owner, 2026-11-05: "a male cologne and unisex section so it's
 * not mainly targeting women but all genders"). Who a fragrance is sold for is
 * the first thing a shopper filters by, so it is the section; the
 * concentration (EDP, EDT, parfum, cologne) stays in the product name.
 */
export type CatKey = "women" | "men" | "unisex" | "sets" | "minis" | "body" | "other";

export interface Category {
  key: CatKey;
  name: string;
  /** "women's perfume" — what people search for */
  plural: string;
  /** One sentence for hub pages; facts only. */
  about: string;
}

/** "other" is last and has no hub of its own in the nav. */
export const CATEGORIES: Category[] = [
  { key: "women", name: "Women's perfume", plural: "women's perfumes", about: "Eau de parfum, eau de toilette and parfum sold for women, from designer houses to niche labels." },
  { key: "men", name: "Men's cologne", plural: "men's colognes and aftershaves", about: "Eau de toilette, eau de parfum, parfum and aftershave sold for men." },
  { key: "unisex", name: "Unisex fragrance", plural: "unisex fragrances", about: "Fragrances sold for anyone: most niche and oud houses, and the designer lines labelled unisex." },
  { key: "sets", name: "Gift sets", plural: "fragrance gift sets", about: "The brands' own boxed sets: a bottle with a travel spray, a lotion or a shower gel, under one barcode." },
  { key: "minis", name: "Travel & minis", plural: "travel sprays and miniatures", about: "The brands' own travel sprays, purse sprays and miniature bottles, each with its own barcode. Never a decant." },
  { key: "body", name: "Body mists & more", plural: "body mists, lotions and scented care", about: "Body mists, scented body lotions, shower gels, deodorants and hair mists from fragrance houses." },
  { key: "other", name: "More fragrance", plural: "more fragrance", about: "Everything else fragrance stores sell under one barcode: home scents, candles and discovery sets from the brands." },
];

/** Menu order: the three sections for people first, then the extras. */
export const STEP_MENU_ORDER: CatKey[] = ["women", "men", "unisex", "sets", "minis", "body", "other"];

export const CAT_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as Record<CatKey, Category>;

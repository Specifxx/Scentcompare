// What a store title is. The barcode decides WHICH product a listing is; the
// title only decides whether it belongs on the site at all (new, boxed, a
// single product the house makes, not a store bundle, tester, decant or dupe)
// and gives a readable name, a section and a size. Every rule changed here
// gets a real store title in tests/title.test.ts.
import { CATEGORIES, type CatKey } from "@/site";

export type Refusal = "not-fragrance" | "tester" | "decant" | "pre-owned" | "damaged" | "bundle" | "mystery" | "dupe";

const NOT_FRAGRANCE = /\b(gift\s*card|e-?gift|gift\s*voucher|shipping|insurance|protection\s*plan|route\s*package|tote\s*bag|donation|tip\b|membership|pre-?order\s*deposit)\b/i;
// A tester or an unboxed bottle is the same juice sold without its box and often without a cap: not the
// product the barcode names, and stores price it apart. "No cellophane" is just an unsealed box and stays.
const TESTER = /\b(tester|testers|unboxed|unbox|without\s*box|no\s*box|brown\s*box|white\s*box|plain\s*box|demo\b)\b/i;
// Decants, samples, vials and refillable atomisers are a shop's own repackaging: never the brand's product.
const DECANT = /\b(decants?|decanted|samples?|sample\s*size|vials?|atomi[sz]ers?|travel\s*atomi[sz]er|discovery\s*(?:kit|pack)|\d+(?:\.\d+)?\s*ml\s*(?:spray\s*)?(?:decant|sample)|sachet|trial\s*size)\b/i;
const PRE_OWNED = /\b(pre[-\s]?owned|second\s*-?\s*hand|used|partial|part\s*full|\d+%\s*full|open\s*box|opened)\b/i;
const DAMAGED = /\b(damaged?|dented|box\s*damage|imperfect|defect(ive)?|as[\s-]is|scratched|leak(?:ing|ed|y)?|ugly\s*(box|packag))/i;
// Store-made sets: the house's own gift set has its own barcode and stays (it is the "sets" section); a shop's
// "Sauvage + Bleu bundle" carries one product's barcode and does not.
const BUNDLE = /\b(bundle|combo|buy\s*\d+\s*get|bogo|gift\s*with\s*purchase|gwp|free\s*gift|pack\s*of\s*[2-9]|lot\s*of\s*\d|\d+\s*x\s*\d+\s*ml\s*(?:x|\+)|wholesale)\b|\b[2-9]\s*x\s+\D|\sx\s?[2-9]\b|\(\s*x?\s*[2-9]\s*x?\s*\)/i;
const MYSTERY = /\b(mystery|lucky\s*(bag|box|dip)|blind\s*box|random|surprise\s*box|grab\s*bag)\b/i;
// Dupes, clones and "inspired by" oils sold under a famous name: never matched to the original.
const DUPE = /\b(dupe|dupes|inspired\s*by|impression\s*of|impressions?|clone|our\s*version|our\s*take|similar\s*to|smells\s*like|alternative\s*to|type\s*(?:oil|fragrance|perfume)|concentrated\s*oil|fragrance\s*oil)\b|\btype\b\s*$|\(type\)/i;

export interface TitleInfo {
  cat: CatKey;
  size: string | null;
}

/** Read a store title. Returns a refusal reason or the section and size. */
export function readTitle(title: string, kind = ""): TitleInfo | { refused: Refusal } {
  if (NOT_FRAGRANCE.test(title)) return { refused: "not-fragrance" };
  if (TESTER.test(title)) return { refused: "tester" };
  if (DECANT.test(title)) return { refused: "decant" };
  if (PRE_OWNED.test(title)) return { refused: "pre-owned" };
  if (DAMAGED.test(title)) return { refused: "damaged" };
  if (MYSTERY.test(title)) return { refused: "mystery" };
  if (DUPE.test(title) || DUPE.test(kind)) return { refused: "dupe" };
  if (BUNDLE.test(title)) return { refused: "bundle" };
  return { cat: categoryOf(title, kind), size: sizeOf(title) };
}

const WOMEN = /\b(women|for\s*women|for\s*her|women'?s|woman|ladies|lady|femme|pour\s*femme|donna|mujer|for\s*ladies|female|her\b|elle\b|girl)\b/i;
const MEN = /\b(men|for\s*men|for\s*him|men'?s|man\b|homme|pour\s*homme|uomo|hombre|male|him\b|gentlemen|gents|aftershave|after\s*shave|barbe)\b/i;
const UNISEX = /\b(unisex|for\s*(?:all|everyone|men\s*(?:and|&)\s*women|women\s*(?:and|&)\s*men)|gender\s*(?:neutral|free)|genderless|shared)\b/i;
const SETS = /\b(gift\s*sets?|sets?\b|coffret|gift\s*box|\d+\s*-?\s*(?:piece|pc|pcs)\b|collection\s*set|duo\b|trio\b|edition\s*box|holiday\s*set|value\s*set)\b/i;
const MINIS = /\b(mini(?:ature|s)?|travel\s*(?:spray|size|edition|bottle)|purse\s*spray|pen\s*spray|pocket\s*spray|refillable\s*travel|deluxe\s*mini|minis)\b/i;
const BODY = /\b(after\s*-?\s*shave\s*(?:lotion|balm|splash|gel)|aftershave\s*(?:lotion|balm|splash|gel)|body\s*(?:mist|spray|splash|lotion|cream|creme|crème|wash|oil|milk|butter|powder|gel|scrub|veil)|shower\s*(?:gel|cream|oil)|bath\s*(?:gel|oil|foam)|deodorant|deo\s*(?:stick|spray)|antiperspirant|hair\s*(?:mist|perfume|fragrance)|hand\s*cream|soap|shaving|shave\s*(?:cream|gel|balm)|beard\s*oil|talc|fragrance\s*mist|brume)\b/i;
const HOME = /\b(candle|diffuser|room\s*spray|home\s*(?:spray|fragrance|scent)|reed|incense|car\s*(?:fragrance|freshener|diffuser)|pillow\s*mist|linen\s*spray|wax\s*melt|scented\s*(?:candle|stone)|discovery\s*set|sample\s*set|scent\s*library)\b/i;

/**
 * Houses that sell almost everything for anyone: a listing from one of these
 * that names no gender is unisex, not "other". Designer houses stay out (Dior
 * sells Sauvage for men and J'adore for women under one vendor).
 */
const UNISEX_HOUSES =
  /\b(creed|tom\s*ford\s*private\s*blend|maison\s*francis\s*kurkdjian|mfk|le\s*labo|byredo|diptyque|jo\s*malone|xerjoff|initio|amouage|kilian|mancera|montale|nishane|memo\s*paris|parfums?\s*de\s*marly|roja|clive\s*christian|frederic\s*malle|serge\s*lutens|acqua\s*di\s*parma|escentric|juliette\s*has\s*a\s*gun|etat\s*libre|comme\s*des\s*garcons|maison\s*margiela|replica|penhaligon|floris|ormonde\s*jayne|matiere\s*premiere|bdk|lattafa|armaf|rasasi|ajmal|afnan|al\s*haramain|swiss\s*arabian|louis\s*vuitton|chanel\s*les\s*exclusifs|hermessence|dior\s*(?:la\s*collection|privee)|armani\s*prive|guerlain\s*l'art|tiziana\s*terenzi|orto\s*parisi|nasomatto|zoologist|dsh|imaginary\s*authors|d\.?s\.?\s*&\s*durga|heretic|boy\s*smells|ellis\s*brooklyn|phlur|dossier|glossier|kayali|lush)\b/i;

/** The section a title (or, failing that, the store's product type and tags) says. */
export function categoryOf(title: string, kind = ""): CatKey {
  const t = title;
  const k = kind;
  // What it is comes before who it is for: a men's shower gel is body care.
  if (HOME.test(t)) return "other";
  if (BODY.test(t)) return "body";
  if (SETS.test(t) && !/\bset\s*of\s*\d/i.test(t)) return "sets";
  const amount = listingAmounts(t)[0];
  if (MINIS.test(t) || (amount && amount.n > 0 && amount.n <= 15)) return "minis";
  const w = WOMEN.test(t), m = MEN.test(t);
  if (UNISEX.test(t) || (w && m)) return "unisex";
  if (w) return "women";
  if (m) return "men";
  if (UNISEX_HOUSES.test(t)) return "unisex";
  const kw = WOMEN.test(k), km = MEN.test(k);
  if (UNISEX.test(k) || (kw && km)) return "unisex";
  if (kw) return "women";
  if (km) return "men";
  if (SETS.test(k)) return "sets";
  if (BODY.test(k)) return "body";
  if (HOME.test(k)) return "other";
  return "other";
}

const SIZE = /(\d+(?:[.,]\d+)?)\s?(ml|mL|g|gr|fl\.?\s?oz|oz)\b/gi;

function sizeLabel(m: RegExpMatchArray): string | null {
  const n = m[1].replace(",", ".");
  const u = m[2].toLowerCase().replace(/\s/g, "").replace("gr", "g").replace("fl.oz", "fl oz").replace("floz", "fl oz");
  if (Number(n) <= 0) return null;
  if (u === "ml" || u === "g" || u === "oz" || u === "fl oz") return `${n}${u === "fl oz" ? " fl oz" : u === "oz" ? " oz" : u}`;
  return null;
}

/** The bottle size a title states ("100ml", "3.4 oz"): the one in the
 *  variant's own trailing brackets when there is one ("EDP 50ml/100ml
 *  (100ml)" is the 100 ml), else the first. */
export function sizeOf(title: string): string | null {
  const tail = title.match(/\(([^()]*)\)\s*$/);
  if (tail) for (const m of tail[1].matchAll(SIZE)) { const s = sizeLabel(m); if (s) return s; }
  for (const m of title.matchAll(SIZE)) { const s = sizeLabel(m); if (s) return s; }
  return null;
}

/** A size as a number: ml, g and oz are treated as one amount (1 ml ≈ 1 g). */
export interface Amount {
  dim: "amount";
  n: number;
}

export function amountOf(size: string | null): Amount | null {
  if (!size) return null;
  const m = size.match(/^([\d.]+)\s?(.*)$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!(n > 0)) return null;
  const u = m[2];
  if (u === "ml" || u === "g") return { dim: "amount", n };
  if (u === "oz" || u === "fl oz") return { dim: "amount", n: n * 29.57 };
  return null;
}

/** Two sizes that cannot be the same bottle (a 50 ml against a 100 ml).
 *  Within 10% is the same bottle written two ways ("3.4 oz" and "100ml"). */
export function sizesConflict(a: Amount | null, b: Amount | null): boolean {
  if (!a || !b || a.dim !== b.dim) return false;
  return Math.abs(a.n - b.n) / Math.max(a.n, b.n) > 0.1;
}

/**
 * The size a listing can be trusted to be, at most one. The variant's own
 * trailing brackets decide; otherwise a title naming two different bottles
 * ("EDP 50ml / 100ml") says nothing about which this is.
 */
export function listingAmounts(title: string): Amount[] {
  const read = (t: string) => [...t.matchAll(SIZE)].map((m) => amountOf(sizeLabel(m))).filter((a): a is Amount => !!a);
  const tail = title.match(/\(([^()]*)\)\s*$/);
  const fromTail = tail ? read(tail[1]) : [];
  if (fromTail.length) return [fromTail[0]];
  const all = read(title);
  // "100ml + 10ml" names the gift set's two bottles: the big one is the product's size.
  if (/\d\s*ml\s*\+\s*\d/i.test(title) || SETS.test(title)) return all.length ? [all.slice().sort((a, b) => b.n - a.n)[0]] : [];
  if (all.length && !all.some((a) => sizesConflict(a, all[0]))) return [all[0]];
  return [];
}

// Store noise stripped before a title becomes a product name.
const NOISE = [
  /\[[^\]]*\]/g,
  /【[^】]*】/g,
  /\((?:new|renewal|renewed|restock|in\s*stock|sale|hot|best\s*seller|bestseller|new\s*packaging|old\s*packaging|new\s*look|upgrade[d]?|limited[^)]*|sealed|boxed|brand\s*new|authentic|genuine|original|retail\s*box)\)/gi,
  /\b(?:new\s*arrival|best\s*seller|bestseller|hot\s*item|on\s*sale|sale|restock(?:ed)?|in\s*stock|authentic|official|100%\s*genuine|genuine|original|brand\s*new|sealed|boxed|new\s*in\s*box|nib|retail\s*box|new\s*packaging)\b\s*[:\-–!]?/gi,
  /\s[-–|]\s*(?:perfume|fragrance|cologne|parfum|perfumes?\s*(?:shop|store|online)|fragrances?\s*(?:shop|store|online))\s*$/i,
  // Shop flags written as a starred word: "NEW*", "CLEARANCE*", "HOT*".
  /\b(?:new|clearance|sale|hot|best|restock|limited|special|deal|outlet)\*/gi,
  // Promotions written into the title: "$1 Deal", "*renew*".
  /\$\d+(?:\.\d+)?\s*deal\b|\*\s*[a-z][a-z ]{1,15}\s*\*/gi,
  // How many sizes the listing has, not which one this is: "(3 sizes)".
  /\(\s*\d+\s*(?:sizes?|options?|scents?|types?)\s*\)|\b\d+\s*(?:sizes|options|scents|types)\b/gi,
  // A single unit says nothing: "1 pcs", "(1 pc)", "1ea".
  /\(\s*1\s*(?:pcs?|ea)\s*\)|\b1\s*(?:pcs?|ea)\b/gi,
  /\s{2,}/g,
];

/** A clean display name from a store title. */
export function cleanName(title: string): string {
  let t = title;
  for (const re of NOISE) t = t.replace(re, " ");
  t = t
    .replace(/\(\s*\)/g, " ")
    .replace(/\s+([,:;)])/g, "$1")
    .replace(/([(])\s+/g, "$1")
    .replace(/^[\s\-–:|,*.]+|[\s\-–:|,*]+$/g, "")
    .replace(/(\b(?:ml|g|oz))\.$/i, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
  // Shouting stores: "DIOR SAUVAGE EAU DE PARFUM 100ML" → title case, with the concentration spelled the usual way.
  if (t.length > 12 && t === t.toUpperCase() && /[A-Z]{4}/.test(t)) {
    t = t.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase());
    t = t.replace(/\bEau De (Parfum|Toilette|Cologne)\b/g, "Eau de $1").replace(/(\d)Ml\b/g, "$1ml");
  }
  t = t.replace(/\b(\d+(?:\.\d+)?)\s?ML\b/g, "$1ml");
  return t;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * One name shape for every store: the house first, then the product, with the
 * store's own brand prefix removed ("Dior - Sauvage Eau de Parfum 100ml" and
 * "Sauvage Eau de Parfum 100ml by Dior" both become "Dior Sauvage Eau de Parfum 100ml").
 */
export function tidyName(title: string, brand: string): string {
  let t = cleanName(title);
  if (brand) {
    const b = brand.replace(/[^a-z0-9]+/gi, "[^a-z0-9]*");
    t = t.replace(new RegExp(`^\\s*${b}\\s*[-–:|]?\\s*`, "i"), "").replace(new RegExp(`\\s*(?:[-–|]|\\bby)\\s*${b}\\s*$`, "i"), "");
    t = t.replace(new RegExp(`^\\[?${esc(brand)}\\]?\\s*`, "i"), "");
  }
  t = t.replace(/^[\s\-–:|,]+|[\s\-–:|,]+$/g, "").trim();
  return brand ? `${brand} ${t}`.trim() : t;
}

/** Pick the product's display name from every store's tidied title: the most
 *  common one wins, then the one nearest a readable length. */
export function pickName(names: string[]): string {
  const ok = names.filter((n) => n.length >= 6);
  if (!ok.length) return names[0] ?? "";
  const count = new Map<string, number>();
  for (const n of ok) count.set(n.toLowerCase(), (count.get(n.toLowerCase()) ?? 0) + 1);
  const score = (n: string) => (count.get(n.toLowerCase()) ?? 0) * 1000 - Math.abs(n.length - 55) - (n === n.toUpperCase() ? 200 : 0);
  return ok.slice().sort((a, b) => score(b) - score(a) || a.localeCompare(b))[0];
}

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);

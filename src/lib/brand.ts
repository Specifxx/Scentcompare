// Brands (fragrance houses). A store's Shopify `vendor` field is the house,
// written each store's own way ("Yves Saint Laurent", "YSL", "Saint Laurent");
// they are folded into one key and shown with the spelling below, else the
// spelling most stores use. A vendor that is just the store's own name, or
// empty, falls back to a known house at the start of the title.
import { slugify } from "./slug";

/** Display spellings for houses stores write many ways (key → name). */
const KNOWN: string[] = [
  "Dior", "Chanel", "Yves Saint Laurent", "Giorgio Armani", "Versace", "Rabanne", "Jean Paul Gaultier", "Creed", "Tom Ford",
  "Gucci", "Prada", "Valentino", "Carolina Herrera", "Lancôme", "Mugler", "Givenchy", "Hermès", "Burberry", "Dolce & Gabbana",
  "Calvin Klein", "Montblanc", "Viktor & Rolf", "Azzaro", "Narciso Rodriguez", "Marc Jacobs", "Hugo Boss", "Lattafa", "Armaf",
  "Maison Margiela", "Jo Malone London", "Kayali", "Ariana Grande", "Billie Eilish", "Maison Francis Kurkdjian", "Le Labo",
  "Byredo", "Diptyque", "Xerjoff", "Initio", "Amouage", "Kilian Paris", "Mancera", "Montale", "Nishane", "Memo Paris",
  "Parfums de Marly", "Roja Parfums", "Clive Christian", "Frédéric Malle", "Serge Lutens", "Acqua di Parma", "Penhaligon's",
  "Floris", "Guerlain", "Bvlgari", "Cartier", "Chloé", "Lanvin", "Kenzo", "Issey Miyake", "Davidoff", "Boss", "Diesel",
  "Thierry Mugler", "Elie Saab", "Coach", "Michael Kors", "Juicy Couture", "Britney Spears", "Jimmy Choo", "Moschino",
  "Paco Rabanne", "Ralph Lauren", "Tommy Hilfiger", "Abercrombie & Fitch", "Hollister", "Bath & Body Works", "Victoria's Secret",
  "Sol de Janeiro", "Escada", "Estée Lauder", "Clinique", "Elizabeth Arden", "Elizabeth Taylor", "Mont Blanc", "Nautica",
  "Bentley", "Jaguar", "Ferrari", "Lamborghini", "Rasasi", "Ajmal", "Afnan", "Al Haramain", "Swiss Arabian", "Ard Al Zaafaran",
  "Louis Vuitton", "Tiziana Terenzi", "Orto Parisi", "Nasomatto", "Zoologist", "Juliette Has a Gun", "Etat Libre d'Orange",
  "Comme des Garçons", "Ormonde Jayne", "Matière Première", "BDK Parfums", "Vilhelm Parfumerie", "Parfums de Nicolaï",
  "Goldfield & Banks", "Glasshouse Fragrances", "Who Is Elijah", "Maison Crivelli", "Boadicea the Victorious", "Dolce&Gabbana",
  "Bond No. 9", "Atelier Cologne", "Miller Harris", "Aerin", "Nest New York", "Phlur", "Glossier", "Skylar", "Ellis Brooklyn",
  "D.S. & Durga", "Boy Smells", "Heretic", "Dossier", "Lush", "Molton Brown", "The Body Shop", "Zara", "Lacoste", "Mercedes-Benz",
  "Bulgari", "Van Cleef & Arpels", "Chopard", "Boucheron", "Salvatore Ferragamo", "Ferragamo", "Roberto Cavalli", "Cavalli",
  "Trussardi", "Emporio Armani", "Armani", "Yves Rocher", "Nina Ricci", "Rochas", "Cacharel", "Loewe", "Carven", "Jean Patou",
  "Caron", "Annick Goutal", "Goutal", "L'Artisan Parfumeur", "Maison Martin Margiela", "Replica", "Chopard", "Bottega Veneta",
  "Balenciaga", "Balmain", "Celine", "Fendi", "Missoni", "Etro", "Salvatore", "Lalique", "Nicolai", "Amouroud", "Afnan",
];

/** "Jo Malone London" / "jo malone" → "jomalone". */
export function brandKey(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\b(co\.?,?\s*ltd|inc|ltd|official|parfums?|perfumes?|fragrances?|beauty|cosmetics|paris|london|new york|milano)\b\.?$/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

const KNOWN_BY_KEY = new Map<string, string>();
for (const name of KNOWN) if (!KNOWN_BY_KEY.has(brandKey(name))) KNOWN_BY_KEY.set(brandKey(name), name);
// One house under two names.
const ALIAS: Record<string, string> = {
  ysl: "yvessaintlaurent",
  saintlaurent: "yvessaintlaurent",
  armani: "giorgioarmani",
  emporioarmani: "giorgioarmani",
  pacorabanne: "rabanne",
  thierrymugler: "mugler",
  dolcegabbana: "dolcegabbana",
  dg: "dolcegabbana",
  bvlgari: "bulgari",
  montblanc: "montblanc",
  boss: "hugoboss",
  hugo: "hugoboss",
  maisonmartinmargiela: "maisonmargiela",
  replica: "maisonmargiela",
  jomalonelondon: "jomalone",
  mfk: "maisonfranciskurkdjian",
  franciskurkdjian: "maisonfranciskurkdjian",
  kilian: "kilianparis",
  bykilian: "kilianparis",
  roja: "rojaparfums",
  rojadove: "rojaparfums",
  fredericmalle: "fredericmalle",
  editionsdeparfumsfredericmalle: "fredericmalle",
  penhaligons: "penhaligons",
  goutal: "annickgoutal",
  salvatoreferragamo: "ferragamo",
  robertocavalli: "cavalli",
  ck: "calvinklein",
  dsdurga: "dsdurga",
  carolinaherreranewyork: "carolinaherrera",
  tomfordprivateblend: "tomford",
  chanellesexclusifs: "chanel",
  lacollectionprivee: "dior",
  christiandior: "dior",
  lancome: "lancome",
  hermes: "hermes",
  bondno9: "bondno9",
  bondno9newyork: "bondno9",
  nest: "nestnewyork",
  bathbodyworks: "bathbodyworks",
  victoriassecret: "victoriassecret",
  abercrombie: "abercrombiefitch",
  viktorrolf: "viktorrolf",
  etatlibredorange: "etatlibredorange",
  commedesgarcons: "commedesgarcons",
  cdg: "commedesgarcons",
};

export function canonicalKey(raw: string): string {
  const k = brandKey(raw);
  return ALIAS[k] ?? k;
}

/** The display name for a brand key, given the spellings stores used. */
export function brandName(key: string, spellings: string[]): string {
  const known = KNOWN_BY_KEY.get(key);
  if (known) return known;
  const c = new Map<string, number>();
  for (const s of spellings) c.set(s.trim(), (c.get(s.trim()) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1] || (a[0] === a[0].toUpperCase() ? 1 : -1))[0]?.[0] ?? key;
}

const KNOWN_SORTED = [...KNOWN_BY_KEY.values()].sort((a, b) => b.length - a.length);

/** A known house named at the start of a title ("Dior Sauvage…"). */
export function brandFromTitle(title: string): string | null {
  const t = title.replace(/^\s*\[[^\]]*\]\s*/, "");
  for (const name of KNOWN_SORTED) {
    const re = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*")}(?![a-z0-9])`, "i");
    if (re.test(t)) return name;
  }
  return null;
}

/**
 * The house of one listing: the vendor, unless it is empty or the store's own
 * name (some shops put themselves there), then a known house at the start of
 * the title.
 */
export function listingBrand(vendor: string, title: string, storeName: string): string | null {
  const v = vendor.trim();
  const store = brandKey(storeName);
  if (v && brandKey(v) && brandKey(v) !== store && !/^(default|vendor|unknown|perfume|fragrance|designer|niche|various|misc)/i.test(v)) return v;
  return brandFromTitle(title);
}

export const brandSlug = (key: string, name: string) => slugify(name) || key;

// Every store ScentCompare reads. Real shops only, never marketplaces (fakes are
// common in fragrance). Each one is read through its public Shopify
// products.json, two at a time at most, about a request a second, and a store
// that keeps answering 403/429 is skipped for the run (never worked around).
// From the 2026-11-05 store probe (probe/summary.md, 367 hosts, 149 readable):
// the readable Shopify fragrance shops with 50+ fragrances whose barcodes we
// can read, one per stock (myperfumeshop.com and .co.nz are myperfumeshop.com.au,
// thebrandoutlet.co.nz is brands.co.nz). Left out: shops with no readable
// barcode (Fragrances Line, Bloom Perfumery, Perfume NZ, Aedes, Luxury Perfume,
// The Essence Vault…), DKK shops, and shops with under 50 fragrances. Decant
// shops (MicroPerfumes, Scent Rush, Rabica) stay: decants are refused by title
// and their full bottles carry barcodes.
import type { RegionCode } from "@/site";

export interface Store {
  id: string;
  name: string;
  region: RegionCode;
  /** https://host, no trailing slash */
  base: string;
  platform: "shopify";
  /** Sells more than fragrance (a pharmacy, a beauty store): only products
   *  with a fragrance word in the title or type get a barcode lookup. */
  mixed?: boolean;
  /** The brand's own store (official prices): compared like any store, and
   *  counted apart in the "brand stores vs fragrance shops" post. */
  official?: boolean;
  /** Pays us a commission (shown as "Paid link"): the query parameter and the
   *  env var holding our code, set once the store's program accepts us. */
  affiliate?: { param: string; envVar: string };
}

export const STORES: Store[] = [
  { id: "scentrabbit", name: "ScentRabbit", region: "US", base: "https://scentrabbit.com", platform: "shopify" },
  { id: "scentsplit", name: "Scent Split", region: "US", base: "https://scentsplit.com", platform: "shopify" },
  { id: "fragrancevault", name: "Fragrance Vault", region: "US", base: "https://fragrancevault.net", platform: "shopify" },
  { id: "olfactoryfactoryllc", name: "Olfactory Factory", region: "US", base: "https://olfactoryfactoryllc.com", platform: "shopify" },
  { id: "rafaelos", name: "Rafaelos", region: "US", base: "https://rafaelos.com", platform: "shopify" },
  { id: "perfumeoutlet", name: "Perfume Outlet", region: "US", base: "https://perfumeoutlet.com", platform: "shopify" },
  { id: "fragranceoutlet", name: "Fragrance Outlet", region: "US", base: "https://fragranceoutlet.com", platform: "shopify" },
  { id: "fragrancemarket", name: "Fragrance Market", region: "US", base: "https://fragrancemarket.com", platform: "shopify" },
  { id: "perfumeplusoutlet", name: "Perfume Plus Outlet", region: "US", base: "https://perfumeplusoutlet.com", platform: "shopify" },
  { id: "zgoperfumery", name: "ZGO Perfumery", region: "US", base: "https://zgoperfumery.com", platform: "shopify" },
  { id: "beautyencounter", name: "Beauty Encounter", region: "US", base: "https://beautyencounter.com", platform: "shopify", mixed: true },
  { id: "perfumedefrance", name: "Parfums de France", region: "US", base: "https://perfumedefrance.com", platform: "shopify" },
  { id: "perfumesamerica", name: "Perfumes America", region: "US", base: "https://perfumesamerica.com", platform: "shopify" },
  { id: "ministryofscent", name: "Ministry of Scent", region: "US", base: "https://ministryofscent.com", platform: "shopify" },
  { id: "inscentivesperfume", name: "Inscentives Perfume", region: "US", base: "https://inscentivesperfume.com", platform: "shopify" },
  { id: "twistedlily", name: "Twisted Lily", region: "US", base: "https://twistedlily.com", platform: "shopify" },
  { id: "osmeperfumery", name: "Osme Perfumery", region: "US", base: "https://osmeperfumery.com", platform: "shopify" },
  { id: "mysticperfume", name: "Mystic Perfume", region: "US", base: "https://mysticperfume.com", platform: "shopify" },
  { id: "eclecticlady", name: "Eclectic Lady", region: "US", base: "https://eclecticlady.com", platform: "shopify", mixed: true },
  { id: "perfumology", name: "Perfumology", region: "US", base: "https://perfumology.com", platform: "shopify" },
  { id: "sprayonyx", name: "Onyx Fragrance", region: "US", base: "https://sprayonyx.com", platform: "shopify" },
  { id: "fumerie", name: "Fumerie", region: "US", base: "https://fumerie.com", platform: "shopify" },
  { id: "fragranceoriginal", name: "Fragrance Original", region: "US", base: "https://fragranceoriginal.com", platform: "shopify" },
  { id: "microperfumes", name: "MicroPerfumes", region: "US", base: "https://microperfumes.com", platform: "shopify" },
  { id: "arielleshoshana", name: "Arielle Shoshana", region: "US", base: "https://arielleshoshana.com", platform: "shopify" },
  { id: "fragranceusa", name: "FragranceUSA", region: "US", base: "https://fragranceusa.com", platform: "shopify" },
  { id: "oakcha", name: "Oakcha", region: "US", base: "https://oakcha.com", platform: "shopify" },
  { id: "scentrushfragrances", name: "Scent Rush", region: "US", base: "https://scentrushfragrances.com", platform: "shopify" },
  { id: "perfumeboutique", name: "Perfume Boutique", region: "US", base: "https://perfume-boutique.net", platform: "shopify" },
  { id: "fragflex", name: "FragFlex", region: "US", base: "https://fragflex.com", platform: "shopify" },
  { id: "perfumarie", name: "Perfumarie", region: "US", base: "https://perfumarie.com", platform: "shopify" },
  { id: "scentsyndicate", name: "Scent Syndicate", region: "US", base: "https://scentsyndicate.com", platform: "shopify" },
  { id: "perfumecentre", name: "Perfume Centre", region: "UK", base: "https://perfumecentre.co.uk", platform: "shopify" },
  { id: "beautybase", name: "Beauty Base", region: "UK", base: "https://beautybase.com", platform: "shopify", mixed: true },
  { id: "thebeautystore", name: "The Beauty Store", region: "UK", base: "https://thebeautystore.com", platform: "shopify", mixed: true },
  { id: "justmylook", name: "Justmylook", region: "UK", base: "https://justmylook.com", platform: "shopify", mixed: true },
  { id: "slickboys", name: "Slickboys", region: "UK", base: "https://slickboys.co.uk", platform: "shopify" },
  { id: "gordonsdirect", name: "Gordons Direct", region: "UK", base: "https://gordonsdirect.com", platform: "shopify", mixed: true },
  { id: "roullierwhite", name: "Roullier White", region: "UK", base: "https://roullierwhite.com", platform: "shopify" },
  { id: "lessenteurs", name: "Les Senteurs", region: "UK", base: "https://lessenteurs.com", platform: "shopify" },
  { id: "jubileescents", name: "Jubilee Scents", region: "UK", base: "https://jubileescents.co.uk", platform: "shopify" },
  { id: "escentual", name: "Escentual", region: "UK", base: "https://escentual.com", platform: "shopify", mixed: true },
  { id: "alexandriauk", name: "Alexandria Fragrances UK", region: "UK", base: "https://alexandriauk.com", platform: "shopify" },
  { id: "allbeauty", name: "allbeauty", region: "UK", base: "https://allbeauty.com", platform: "shopify", mixed: true },
  { id: "sunnamusk", name: "Sunnamusk", region: "UK", base: "https://sunnamusk.com", platform: "shopify" },
  { id: "fragrancecanada", name: "Fragrance Canada", region: "CA", base: "https://fragrancecanada.ca", platform: "shopify" },
  { id: "fragrance365", name: "Fragrance365", region: "CA", base: "https://fragrance365.ca", platform: "shopify" },
  { id: "fragrancebuy", name: "FragranceBuy", region: "CA", base: "https://fragrancebuy.com", platform: "shopify" },
  { id: "perfumeonline", name: "PerfumeOnline.ca", region: "CA", base: "https://perfumeonline.ca", platform: "shopify" },
  { id: "leparfumier", name: "Le Parfumier", region: "CA", base: "https://leparfumier.com", platform: "shopify" },
  { id: "parfumexquis", name: "Parfum Exquis", region: "CA", base: "https://parfumexquis.com", platform: "shopify" },
  { id: "perfumeelegance", name: "Perfume Elegance", region: "CA", base: "https://perfumeelegance.ca", platform: "shopify" },
  { id: "ephyr", name: "Maison Ephyr", region: "CA", base: "https://ephyr.ca", platform: "shopify" },
  { id: "discountfragrances", name: "Discount Fragrances", region: "CA", base: "https://discountfragrances.ca", platform: "shopify" },
  { id: "rabica", name: "Rabica", region: "CA", base: "https://rabica.ca", platform: "shopify", mixed: true },
  { id: "westernperfumes", name: "Western Perfumes", region: "CA", base: "https://westernperfumes.ca", platform: "shopify" },
  { id: "fragrancesource", name: "Fragrance Source", region: "CA", base: "https://fragrancesource.ca", platform: "shopify" },
  { id: "privateblends", name: "Private Blends", region: "AU", base: "https://privateblends.com.au", platform: "shopify" },
  { id: "priceritemart", name: "PriceRiteMart", region: "AU", base: "https://priceritemart.com.au", platform: "shopify", mixed: true },
  { id: "sugapash", name: "Suga Pash", region: "AU", base: "https://sugapash.com.au", platform: "shopify", mixed: true },
  { id: "myperfumeshop", name: "My Perfume Shop", region: "AU", base: "https://myperfumeshop.com.au", platform: "shopify" },
  { id: "perfumeclearancecentre", name: "Perfume Clearance Centre", region: "AU", base: "https://perfumeclearancecentre.com.au", platform: "shopify" },
  { id: "libertineparfumerie", name: "Libertine Parfumerie", region: "AU", base: "https://libertineparfumerie.com.au", platform: "shopify" },
  { id: "witr", name: "WITR", region: "AU", base: "https://witr.com.au", platform: "shopify", mixed: true },
  { id: "lamilas", name: "Lamilas Perfume", region: "AU", base: "https://lamilas.com.au", platform: "shopify" },
  { id: "noah", name: "NOAH", region: "AU", base: "https://noah.com.au", platform: "shopify", mixed: true },
  { id: "connectionparfumerie", name: "Connection Parfumerie", region: "AU", base: "https://connectionparfumerie.com.au", platform: "shopify" },
  { id: "asedos", name: "Asēdos", region: "AU", base: "https://asedos.com.au", platform: "shopify", mixed: true },
  { id: "cosmeticcapital", name: "Cosmetic Capital", region: "AU", base: "https://cosmeticcapital.com.au", platform: "shopify", mixed: true },
  { id: "aerre", name: "Àerre", region: "AU", base: "https://aerre.co", platform: "shopify" },
  { id: "perfumeaustralia", name: "Perfume Australia", region: "AU", base: "https://perfumeaustralia.com.au", platform: "shopify" },
  { id: "ry", name: "RY", region: "AU", base: "https://ry.com.au", platform: "shopify", mixed: true },
  { id: "brandshd", name: "Brands HD", region: "NZ", base: "https://brandshd.co.nz", platform: "shopify", mixed: true },
  { id: "freshbeautyco", name: "Fresh Beauty Co", region: "NZ", base: "https://freshbeautyco.co.nz", platform: "shopify", mixed: true },
  { id: "brands", name: "Brands NZ", region: "NZ", base: "https://brands.co.nz", platform: "shopify", mixed: true },
  { id: "thescentvault", name: "The Scent Vault", region: "EU", base: "https://thescentvault.ie", platform: "shopify" },
  { id: "parfumgroup", name: "ParfumGroup", region: "EU", base: "https://parfumgroup.de", platform: "shopify" },
  { id: "parfumslubner", name: "Parfums Lubner", region: "EU", base: "https://parfumslubner.com", platform: "shopify" },
  { id: "jada", name: "Jada (Dubai Oud)", region: "EU", base: "https://dubaioud.ie", platform: "shopify" },
  { id: "snud", name: "SNUD", region: "EU", base: "https://snud.at", platform: "shopify" },
  { id: "mccabespharmacy", name: "McCabes Pharmacy", region: "EU", base: "https://mccabespharmacy.com", platform: "shopify", mixed: true },
  { id: "meaghers", name: "Meaghers Pharmacy", region: "EU", base: "https://www.meagherspharmacy.ie", platform: "shopify", mixed: true },
  { id: "cloud10beauty", name: "Cloud 10 Beauty", region: "EU", base: "https://cloud10beauty.com", platform: "shopify", mixed: true },
  { id: "ausliebezumduft", name: "Aus Liebe zum Duft", region: "EU", base: "https://ausliebezumduft.de", platform: "shopify" },
];

export const STORE_BY_ID: Record<string, Store> = Object.fromEntries(STORES.map((s) => [s.id, s]));

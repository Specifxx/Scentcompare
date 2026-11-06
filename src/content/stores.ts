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

/** A page path that names a fragrance: what a department store's or pharmacy's pages are narrowed to. */
const FRAG_URL = "parfum|perfume|cologne|toilette|fragrance|profumo|duft|edp|edt|aftershave|tuoksu|hajuvesi";

export interface Store {
  id: string;
  name: string;
  region: RegionCode;
  /** https://host, no trailing slash */
  base: string;
  /** shopify: products.json; woocommerce: the Store API (lib/import/woocommerce.ts);
   *  pages: sitemap + each product page's schema.org GTIN (lib/import/pages.ts),
   *  read by the import workflow's page jobs (scripts/read-pages.ts). */
  platform: "shopify" | "woocommerce" | "pages";
  /** pages stores: where the product pages are listed and which ones to read. */
  pages?: {
    /** sitemap URLs (relative to base) when robots.txt names none or the wrong ones */
    sitemaps?: string[];
    /** in a sitemap index, only the child sitemaps whose URL matches */
    sitemapMatch?: string;
    /** only page paths matching this (a department store's fragrance pages) */
    urlMatch?: string;
    /** pages read per run (default PAGES_PER_RUN) */
    budget?: number;
  };
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
  // Round 2 of the probe (probe/summary.md, 2026-11-05: 1,542 hosts, 373 readable): the same rule, 30+
  // fragrances with readable barcodes, one host per stock (the .com/.co.nz/.ca/.us mirrors of a store above are
  // left out), mostly-decant shops left out, pharmacies and department stores marked mixed.
  { id: "theperfumewarehouse", name: "The Perfume Warehouse", region: "AU", base: "https://theperfumewarehouse.com.au", platform: "shopify" },
  { id: "europacosmetica", name: "Europa Cosmetica", region: "AU", base: "https://europacosmetica.com.au", platform: "shopify" },
  { id: "ascentluxurycosmetics", name: "Ascent Luxury Cosmetics", region: "AU", base: "https://ascentluxurycosmetics.com.au", platform: "shopify" },
  { id: "perfumeforever", name: "Perfume Forever", region: "AU", base: "https://perfumeforever.com.au", platform: "shopify" },
  { id: "cosmeticsonline", name: "Cosmetics Online", region: "AU", base: "https://cosmeticsonline.net.au", platform: "shopify", mixed: true },
  { id: "mensbiz", name: "Mensbiz", region: "AU", base: "https://mensbiz.com.au", platform: "shopify", mixed: true },
  { id: "perfumebazaar", name: "Perfume Bazaar", region: "AU", base: "https://perfumebazaar.com.au", platform: "shopify", mixed: true },
  { id: "beautyaffairs", name: "Beauty Affairs", region: "AU", base: "https://beautyaffairs.com.au", platform: "shopify", mixed: true },
  { id: "lottedutyfree", name: "Lotte Duty Free", region: "AU", base: "https://lottedutyfree.com.au", platform: "shopify", mixed: true },
  { id: "giantchemistharbourtown", name: "Giant Chemist", region: "AU", base: "https://giantchemistharbourtown.com.au", platform: "shopify", mixed: true },
  { id: "cateschemist", name: "Cate's Chemist", region: "AU", base: "https://cateschemist.com", platform: "shopify", mixed: true },
  { id: "directchemistoutlet", name: "Direct Chemist Outlet", region: "AU", base: "https://directchemistoutlet.com.au", platform: "shopify", mixed: true },
  { id: "justperfume", name: "Just Perfume", region: "AU", base: "https://justperfume.co.uk", platform: "shopify" },
  { id: "ontrendbeauty", name: "On Trend Beauty", region: "AU", base: "https://ontrendbeauty.com.au", platform: "shopify", mixed: true },
  { id: "sensoriam", name: "Sensoriam", region: "AU", base: "https://sensoriam.com", platform: "shopify" },
  { id: "beardandblade", name: "Beard & Blade", region: "AU", base: "https://beardandblade.com.au", platform: "shopify", mixed: true },
  { id: "nourishedlife", name: "Nourished Life", region: "AU", base: "https://nourishedlife.com.au", platform: "shopify", mixed: true },
  { id: "lookfantastic", name: "LOOKFANTASTIC AU", region: "AU", base: "https://lookfantastic.com.au", platform: "shopify", mixed: true },
  { id: "cosmeticssquad", name: "Cosmetics Squad", region: "AU", base: "https://cosmeticssquad.com.au", platform: "shopify", mixed: true },
  { id: "oudcollection", name: "OUD Collection", region: "AU", base: "https://oudcollection.co.uk", platform: "shopify", mixed: true },
  { id: "dubaiperfumes", name: "Dubai Perfumes", region: "CA", base: "https://dubaiperfumes.ca", platform: "shopify" },
  { id: "parfumgallerie", name: "Parfum Gallerie", region: "CA", base: "https://parfumgallerie.ca", platform: "shopify" },
  { id: "myroyalmusk", name: "My Royal Musk", region: "CA", base: "https://myroyalmusk.com", platform: "shopify" },
  { id: "maximumfragrance", name: "Maximum Fragrance", region: "CA", base: "https://maximumfragrance.ca", platform: "shopify" },
  { id: "thedetoxmarket", name: "The Detox Market CA", region: "CA", base: "https://thedetoxmarket.ca", platform: "shopify", mixed: true },
  { id: "beautebox", name: "Beautebox", region: "CA", base: "https://beautebox.ca", platform: "shopify", mixed: true },
  { id: "scentrique", name: "Scentrique", region: "CA", base: "https://scentrique.com", platform: "shopify", mixed: true },
  { id: "bellaviacanada", name: "Bellavia", region: "CA", base: "https://bellaviacanada.ca", platform: "shopify", mixed: true },
  { id: "leparfum", name: "LeParfum", region: "CA", base: "https://leparfum.ca", platform: "shopify", mixed: true },
  { id: "canadianglow", name: "Canadian Glow", region: "CA", base: "https://canadianglow.ca", platform: "shopify", mixed: true },
  { id: "signelocal", name: "Signé Local", region: "CA", base: "https://signelocal.com", platform: "shopify", mixed: true },
  { id: "oakandtonic", name: "Oak + Tonic", region: "CA", base: "https://oakandtonic.ca", platform: "shopify", mixed: true },
  { id: "bplatz", name: "Beauty Platz", region: "EU", base: "https://bplatz.de", platform: "shopify" },
  { id: "houseofniche", name: "House of Niche", region: "EU", base: "https://houseofniche.nl", platform: "shopify" },
  { id: "orientalstyle", name: "Oriental-Style", region: "EU", base: "https://oriental-style.de", platform: "shopify" },
  { id: "premiereavenue", name: "Première Avenue", region: "EU", base: "https://premiereavenue.fr", platform: "shopify" },
  { id: "lamaisonduparfum", name: "La Maison du Parfum", region: "EU", base: "https://lamaisonduparfum.com", platform: "shopify" },
  { id: "mazzolari", name: "Mazzolari", region: "EU", base: "https://mazzolari.com", platform: "shopify", mixed: true },
  { id: "mcgorisks", name: "McGorisks", region: "EU", base: "https://mcgorisks.ie", platform: "shopify", mixed: true },
  { id: "averyperfumegallery", name: "Avery Perfume Gallery", region: "EU", base: "https://averyperfumegallery.com", platform: "shopify", mixed: true },
  { id: "inishpharmacy", name: "Inish Pharmacy", region: "EU", base: "https://inishpharmacy.com", platform: "shopify", mixed: true },
  { id: "encapturestore", name: "Encapture", region: "EU", base: "https://encapturestore.com", platform: "shopify", mixed: true },
  { id: "vanitystock", name: "VanityStock", region: "EU", base: "https://shop.vanitystock.com", platform: "shopify", mixed: true },
  { id: "campomarzio70", name: "Campomarzio70", region: "EU", base: "https://campomarzio70.it", platform: "shopify", mixed: true },
  { id: "hagelshop", name: "Hagel", region: "EU", base: "https://hagel-shop.de", platform: "shopify", mixed: true },
  { id: "parfumswinkel", name: "Parfumswinkel", region: "EU", base: "https://parfumswinkel.nl", platform: "shopify", mixed: true },
  { id: "whelehans", name: "Whelehans", region: "EU", base: "https://whelehans.ie", platform: "shopify", mixed: true },
  { id: "essentialparfums", name: "Essential Parfums", region: "EU", base: "https://essentialparfums.com", platform: "shopify", mixed: true, official: true },
  { id: "lifepharmacy", name: "Life Pharmacy", region: "NZ", base: "https://lifepharmacy.co.nz", platform: "shopify" },
  { id: "worldbrand", name: "World Brand", region: "NZ", base: "https://worldbrand.co.nz", platform: "shopify", mixed: true },
  { id: "unichem", name: "Unichem", region: "NZ", base: "https://unichem.co.nz", platform: "shopify", mixed: true },
  { id: "bargainchemist", name: "Bargain Chemist", region: "NZ", base: "https://bargainchemist.co.nz", platform: "shopify", mixed: true },
  { id: "floandfrankie", name: "Flo & Frankie", region: "NZ", base: "https://floandfrankie.com", platform: "shopify", mixed: true },
  { id: "soghaat", name: "Soghaat", region: "UK", base: "https://soghaat.co.uk", platform: "shopify" },
  { id: "emiratesoud", name: "Emirates Oud", region: "UK", base: "https://emiratesoud.co.uk", platform: "shopify" },
  { id: "perfumeoasis", name: "Perfume Oasis", region: "UK", base: "https://perfumeoasis.co.uk", platform: "shopify" },
  { id: "fragrancelondon", name: "Fragrance London", region: "UK", base: "https://fragrancelondon.com", platform: "shopify" },
  { id: "perfumeheaven", name: "Perfume Heaven", region: "UK", base: "https://perfumeheaven.co.uk", platform: "shopify" },
  { id: "redlabeloutlet", name: "Red Label Outlet", region: "UK", base: "https://redlabeloutlet.co.uk", platform: "shopify" },
  { id: "glowempire", name: "Glow Empire", region: "UK", base: "https://glowempire.co.uk", platform: "shopify" },
  { id: "perfumedirect", name: "Perfume Direct", region: "UK", base: "https://perfumedirect.com", platform: "shopify" },
  { id: "fragranza", name: "Fragranza", region: "UK", base: "https://fragranza.uk", platform: "shopify" },
  { id: "ambientbeauty", name: "Ambient Beauty", region: "UK", base: "https://ambientbeauty.uk", platform: "shopify" },
  { id: "beautyscent", name: "Beauty Scent", region: "UK", base: "https://beauty-scent.co.uk", platform: "shopify" },
  { id: "peleven", name: "P-Eleven", region: "UK", base: "https://p-eleven.com", platform: "shopify", mixed: true },
  { id: "almanaar", name: "Al Manaar", region: "UK", base: "https://almanaar.co.uk", platform: "shopify", mixed: true },
  { id: "perfumescents", name: "Perfume Scents", region: "UK", base: "https://perfumescents.co.uk", platform: "shopify", mixed: true },
  { id: "opulensi", name: "Opulensi", region: "UK", base: "https://opulensi.com", platform: "shopify" },
  { id: "fragrancehub", name: "Fragrance Hub", region: "UK", base: "https://fragrancehub.co.uk", platform: "shopify" },
  { id: "pulseofperfumery", name: "Pulse of Perfumery", region: "UK", base: "https://pulseofperfumery.com", platform: "shopify", mixed: true },
  { id: "fragranceofarabia", name: "Fragrance of Arabia", region: "UK", base: "https://fragranceofarabia.com", platform: "shopify" },
  { id: "thegroomingclinic", name: "The Grooming Clinic", region: "UK", base: "https://thegroomingclinic.com", platform: "shopify", mixed: true },
  { id: "amsons", name: "Amsons", region: "UK", base: "https://amsons.co.uk", platform: "shopify", mixed: true },
  { id: "fenwick", name: "Fenwick", region: "UK", base: "https://fenwick.co.uk", platform: "shopify", mixed: true },
  { id: "belvera", name: "Belvera", region: "UK", base: "https://belvera.co.uk", platform: "shopify", mixed: true },
  { id: "elyswimbledon", name: "Elys Wimbledon", region: "UK", base: "https://elyswimbledon.co.uk", platform: "shopify", mixed: true },
  { id: "contentbeautywellbeing", name: "Content Beauty", region: "UK", base: "https://contentbeautywellbeing.com", platform: "shopify", mixed: true },
  { id: "tjhughes", name: "TJ Hughes", region: "UK", base: "https://tjhughes.co.uk", platform: "shopify", mixed: true },
  { id: "fragrancedealz", name: "Fragrance Dealz", region: "US", base: "https://fragrancedealz.com", platform: "shopify" },
  { id: "scentsangel", name: "Scents Angel", region: "US", base: "https://scentsangel.com", platform: "shopify" },
  { id: "intenseoud", name: "Intense Oud", region: "US", base: "https://intenseoud.com", platform: "shopify" },
  { id: "perfumebox", name: "PerfumeBox", region: "US", base: "https://perfumebox.com", platform: "shopify" },
  { id: "nearstore", name: "Near Store", region: "US", base: "https://nearstore.com", platform: "shopify" },
  { id: "labelleperfumes", name: "LaBelle Perfumes", region: "US", base: "https://labelleperfumes.com", platform: "shopify" },
  { id: "perfumeparadise", name: "Perfume Paradise", region: "US", base: "https://perfumeparadise.com", platform: "shopify" },
  { id: "tripletraders", name: "Triple Traders", region: "US", base: "https://tripletraders.com", platform: "shopify" },
  { id: "perfumeempire", name: "Perfume Empire", region: "US", base: "https://perfume-empire.com", platform: "shopify" },
  { id: "perfumem", name: "Perfume M", region: "US", base: "https://perfumem.com", platform: "shopify" },
  { id: "sensabeauty", name: "Sensa Beauty", region: "US", base: "https://sensabeauty.com", platform: "shopify" },
  { id: "perfumes", name: "Perfumes.la", region: "US", base: "https://perfumes.la", platform: "shopify" },
  { id: "perfumania", name: "Perfumania", region: "US", base: "https://perfumania.com", platform: "shopify" },
  { id: "perfumora", name: "Perfumora", region: "US", base: "https://perfumora.com", platform: "shopify" },
  { id: "oasisperfumesusa", name: "Oasis Perfumes", region: "US", base: "https://oasisperfumesusa.com", platform: "shopify" },
  { id: "99perfume", name: "99Perfume", region: "US", base: "https://99perfume.com", platform: "shopify" },
  { id: "soavantgarde", name: "So Avant Garde", region: "US", base: "https://so-avant-garde.com", platform: "shopify" },
  { id: "perfumecity", name: "Perfume City", region: "US", base: "https://perfumecity.com", platform: "shopify" },
  { id: "credobeauty", name: "Credo Beauty", region: "US", base: "https://credobeauty.com", platform: "shopify" },
  { id: "lrlux", name: "LRLUX", region: "US", base: "https://lrlux.com", platform: "shopify" },
  { id: "thedetoxmarketus", name: "The Detox Market", region: "US", base: "https://thedetoxmarket.com", platform: "shopify", mixed: true },
  { id: "bezali", name: "Bezali", region: "US", base: "https://bezali.com", platform: "shopify", mixed: true },
  { id: "alrashad", name: "Al-Rashad", region: "US", base: "https://alrashad.com", platform: "shopify" },
  { id: "monc13", name: "MONC XIII", region: "US", base: "https://monc13.com", platform: "shopify", mixed: true },
  { id: "alhusseinperfumes", name: "Al Hussein Perfumes", region: "US", base: "https://alhusseinperfumes.com", platform: "shopify" },
  { id: "shoprescuespa", name: "Rescue Spa", region: "US", base: "https://shoprescuespa.com", platform: "shopify", mixed: true },
  { id: "buymoreperfumes", name: "BuyMorePerfumes", region: "US", base: "https://buymoreperfumes.com", platform: "shopify" },
  { id: "mutamayezperfume", name: "Mutamayez", region: "US", base: "https://mutamayez-perfume.com", platform: "shopify", mixed: true },
  { id: "cosbar", name: "Cos Bar", region: "US", base: "https://cosbar.com", platform: "shopify", mixed: true },
  { id: "thedsshop", name: "The DS Shop", region: "US", base: "https://thedsshop.com", platform: "shopify", mixed: true },
  { id: "violetgrey", name: "Violet Grey", region: "US", base: "https://violetgrey.com", platform: "shopify", mixed: true },
  { id: "dunyaaloud", name: "Dunya Al Oud", region: "US", base: "https://dunyaaloud.com", platform: "shopify" },
  { id: "bluemercury", name: "Bluemercury", region: "US", base: "https://bluemercury.com", platform: "shopify", mixed: true },
  { id: "kbeautyx", name: "KBX", region: "US", base: "https://kbeautyx.com", platform: "shopify", mixed: true },
  { id: "beautyhabit", name: "Beautyhabit", region: "US", base: "https://beautyhabit.com", platform: "shopify", mixed: true },
  { id: "theperfumeshopusa", name: "The Perfume Shop USA", region: "US", base: "https://theperfumeshopusa.com", platform: "shopify", mixed: true },
  { id: "bazaralhaya", name: "Bazar Al Haya", region: "US", base: "https://bazaralhaya.com", platform: "shopify", mixed: true },
  { id: "scentbeauty", name: "SCENT Beauty", region: "US", base: "https://scentbeauty.com", platform: "shopify", official: true },
  { id: "spadezstore", name: "Spadez Store", region: "US", base: "https://spadezstore.com", platform: "shopify", mixed: true },
  { id: "belensperfume", name: "Belen's Perfume", region: "US", base: "https://belensperfume.com", platform: "shopify", mixed: true },
  // Round 3 (NZ and CA discovery, 2026-11-05: 128 more hosts, 27 NZD and 26 CAD readable, most pharmacies and
  // concept stores with under ten fragrances). The few that pass the same rule:
  { id: "gadgetsonline", name: "Gadgets Online", region: "NZ", base: "https://gadgetsonline.co.nz", platform: "shopify", mixed: true },
  { id: "guardianpharmacy", name: "Guardian Pharmacy", region: "NZ", base: "https://guardianpharmacy.co.nz", platform: "shopify", mixed: true },
  { id: "perfumefactory", name: "Perfume Factory", region: "CA", base: "https://perfumefactory.ca", platform: "shopify" },
  { id: "dansunjardin", name: "Dans un Jardin", region: "CA", base: "https://dansunjardin.com", platform: "shopify", official: true },
  { id: "herabeauty", name: "Hera Beauté", region: "CA", base: "https://herabeauty.ca", platform: "shopify", mixed: true },
  // Round 4 (2026-11-06, Google's top results for popular bottles in every region; probe/pages-summary.md). Shops
  // whose products.json is closed or that are not on Shopify, read from their product pages' schema.org GTIN
  // (platform "pages"), and four more Shopify shops. Walled (403, captcha or challenge, never worked around):
  // Sephora, Ulta, Macy's, Nordstrom, Douglas, Boots, Superdrug, The Perfume Shop, Fragrance Direct, Notino,
  // Chemist Warehouse, Myer, David Jones, Mecca, Priceline and Jomashop. Big shops whose pages print no barcode
  // (FragranceNet, Perfumania, LOOKFANTASTIC, Cult Beauty) stay partner rows.
  { id: "druni", name: "Druni", region: "EU", base: "https://www.druni.es", platform: "pages", mixed: true, pages: { urlMatch: FRAG_URL, budget: 2000 } },
  { id: "arenal", name: "Arenal", region: "EU", base: "https://www.arenal.com", platform: "pages", mixed: true, pages: { urlMatch: FRAG_URL, budget: 2000 } },
  { id: "kicksfi", name: "KICKS", region: "EU", base: "https://www.kicks.fi", platform: "pages", mixed: true, pages: { urlMatch: FRAG_URL, budget: 2500 } },
  { id: "perfumesclub", name: "Perfumes Club", region: "EU", base: "https://www.perfumesclub.com", platform: "pages", mixed: true, pages: { budget: 2500 } },
  { id: "perfumesclubuk", name: "Perfumes Club", region: "UK", base: "https://www.perfumesclub.co.uk", platform: "pages", mixed: true, pages: { budget: 2500 } },
  { id: "parfimo", name: "Parfimo", region: "EU", base: "https://www.parfimo.de", platform: "pages", pages: { budget: 2000 } },
  { id: "parfumzentrum", name: "Parfum-Zentrum", region: "EU", base: "https://www.parfum-zentrum.de", platform: "pages", pages: { budget: 2000 } },
  { id: "tendanceparfums", name: "Tendance Parfums", region: "EU", base: "https://www.tendance-parfums.com", platform: "pages", mixed: true },
  { id: "parfumwebshop", name: "Parfumwebshop", region: "EU", base: "https://parfumwebshop.nl", platform: "pages", mixed: true },
  { id: "seuren", name: "Parfümerie Seuren", region: "EU", base: "https://www.seurenhealth.de", platform: "pages", mixed: true },
  { id: "maisondesfragrances", name: "Maison des Fragrances", region: "EU", base: "https://maisondesfragrances.fr", platform: "pages", pages: { urlMatch: "^/products/", budget: 3000 } },
  { id: "pacoperfumerias", name: "Paco Perfumerías", region: "UK", base: "https://www.pacoperfumerias.co.uk", platform: "pages", pages: { budget: 2500 } },
  { id: "perfumeuk", name: "Perfume UK", region: "UK", base: "https://www.perfumeuk.co.uk", platform: "pages" },
  { id: "fragrancecounter", name: "The Fragrance Counter", region: "UK", base: "https://www.thefragrancecounter.co.uk", platform: "pages", pages: { budget: 2000 } },
  { id: "luckyscent", name: "Luckyscent", region: "US", base: "https://www.luckyscent.com", platform: "pages" },
  { id: "feelingsexy", name: "Feeling Sexy", region: "AU", base: "https://www.feelingsexy.com.au", platform: "pages", mixed: true, pages: { urlMatch: FRAG_URL, budget: 2500 } },
  { id: "terrywhite", name: "TerryWhite Chemmart", region: "AU", base: "https://terrywhitechemmart.com.au", platform: "pages", mixed: true, pages: { urlMatch: FRAG_URL } },
  { id: "freshbeautycoau", name: "Fresh Beauty Co", region: "AU", base: "https://freshbeautyco.com.au", platform: "shopify", mixed: true },
  { id: "fragrancecomeu", name: "Fragrance.com", region: "EU", base: "https://eu.fragrance.com", platform: "shopify", mixed: true },
  { id: "haarspullen", name: "Haarspullen", region: "EU", base: "https://haarspullen.nl", platform: "shopify", mixed: true },
  { id: "profumidinicchia", name: "Profumi di Nicchia", region: "EU", base: "https://profumidinicchia.com", platform: "shopify" },
];

/** The stores on Shopify: the cart-based checks (shipping quotes, multi-buys) and the checkout link read only these. */
export const SHOPIFY_STORES: Store[] = STORES.filter((s) => s.platform === "shopify");

export const STORE_BY_ID: Record<string, Store> = Object.fromEntries(STORES.map((s) => [s.id, s]));

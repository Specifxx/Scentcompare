// Reads a store's product page the way search engines do: its schema.org
// Product in JSON-LD (name, brand, GTIN, price, currency, stock, photo). Used
// for the stores that are not on Shopify (Magento, BigCommerce, WooCommerce,
// PrestaShop and custom shops): the GTIN printed by the shop itself is the
// barcode we match on, exactly as Shopify's variant barcode is. A page without
// a valid GTIN gives nothing; a page with two different GTINs in one product
// (a bundle) gives one listing per offer that names its own GTIN, else none.
import { eanOf, isProductEan, normaliseBarcode } from "../ean";
import type { Stock } from "../types";

export interface PageProduct {
  name: string;
  brand: string;
  ean: string;
  cents: number;
  currency: string;
  st: Stock;
  img: string | null;
  /** the offer's own URL when the page names one (a variant), else the page's */
  url: string | null;
}

type Json = Record<string, unknown>;

function asArray(x: unknown): unknown[] {
  return Array.isArray(x) ? x : x == null ? [] : [x];
}
function str(x: unknown): string {
  if (typeof x === "string") return x;
  if (typeof x === "number") return String(x);
  if (x && typeof x === "object" && "name" in x) return str((x as Json).name);
  return "";
}
function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

/** Every schema.org Product (and ProductGroup variant) in a page's JSON-LD blocks. */
export function jsonLdProducts(html: string): Json[] {
  const out: Json[] = [];
  for (const m of html.matchAll(/<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)) {
    let j: unknown;
    try {
      // Some shops leave raw newlines or a trailing comma in a string; try as is first.
      j = JSON.parse(m[1].trim());
    } catch {
      try {
        j = JSON.parse(m[1].trim().replace(/[\u0000-\u001f]+/g, " "));
      } catch {
        continue;
      }
    }
    const walk = (x: unknown, parent?: Json) => {
      if (!x || typeof x !== "object") return;
      if (Array.isArray(x)) return x.forEach((y) => walk(y, parent));
      const o = x as Json;
      const t = asArray(o["@type"]).map(String).join(" ");
      if (/\bProduct\b/.test(t)) out.push(parent ? { ...parent, hasVariant: undefined, ...o, brand: o.brand ?? parent.brand, image: o.image ?? parent.image } : o);
      if (/\bProductGroup\b/.test(t)) walk(o.hasVariant, o);
      if (o["@graph"]) walk(o["@graph"]);
      if (o.mainEntity) walk(o.mainEntity);
    };
    walk(j);
  }
  return out;
}

function codeOf(o: Json): string | null {
  for (const k of ["gtin13", "gtin", "gtin12", "gtin14", "ean", "isbn"]) {
    let raw = str(o[k]).replace(/\D/g, "");
    if (raw.length === 14 && raw.startsWith("0")) raw = raw.slice(1);
    const c = normaliseBarcode(raw);
    if (c && isProductEan(c)) return c;
  }
  return eanOf({ sku: str(o.sku) || null }) ?? eanOf({ sku: str(o.mpn) || null });
}

function stockOf(availability: unknown): Stock {
  const a = str(availability).toLowerCase();
  return /instock|in_stock|limitedavailability|onlineonly|preorder|presale/.test(a.replace(/[\s/:.-]|schema|http|org/g, "")) ? "in" : "out";
}

function imageOf(x: unknown): string | null {
  const first = asArray(x)[0];
  const u = typeof first === "string" ? first : first && typeof first === "object" ? str((first as Json).url ?? (first as Json).contentUrl) : "";
  return /^https?:\/\//.test(u) ? u : null;
}

/**
 * The page's products, one per offer with a price and a barcode. The product's
 * own GTIN applies to its offers unless an offer names its own; an offer with
 * neither is skipped.
 */
export function readPageProducts(html: string): PageProduct[] {
  const out: PageProduct[] = [];
  const seen = new Set<string>();
  for (const p of jsonLdProducts(html)) {
    const name = decode(str(p.name));
    if (!name) continue;
    const own = codeOf(p);
    const offers = asArray(p.offers).flatMap((o) => {
      const oo = o as Json;
      return oo && typeof oo === "object" && oo.offers ? asArray(oo.offers) : [o];
    }) as Json[];
    const priced = offers.filter((o) => o && typeof o === "object" && (o.price ?? o.lowPrice) != null);
    // Two or more different GTINs on one product with no per-offer codes: a bundle or a shade card. Skip.
    for (const o of priced) {
      const ean = codeOf(o) ?? (priced.length === 1 || priced.every((x) => !codeOf(x)) ? own : null);
      if (!ean) continue;
      const price = Number(String(o.price ?? o.lowPrice).replace(/[^\d.]/g, ""));
      if (!(price > 0)) continue;
      const currency = str(o.priceCurrency).toUpperCase();
      const key = `${ean}:${currency}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        name,
        brand: decode(str(p.brand)),
        ean,
        cents: Math.round(price * 100),
        currency,
        st: stockOf(o.availability),
        img: imageOf(p.image),
        url: typeof o.url === "string" && /^https?:\/\//.test(o.url) ? o.url : null,
      });
    }
  }
  return out;
}

/** True when a page is a bot wall (a challenge, a captcha, "access denied"), not a product page. */
export function isBotWall(status: number, html: string): boolean {
  if (status === 403 || status === 429) return true;
  // A challenge page, not any page that loads reCAPTCHA for its newsletter form.
  return /<title>[^<]*(just a moment|attention required|access denied|pardon our interruption|security check|are you a (?:robot|human)|request unsuccessful)[^<]*<\/title>|cf-chl-|challenge-platform\/h\/|px-captcha|captcha-delivery\.com|_Incapsula_Resource/i.test(html.slice(0, 30000));
}

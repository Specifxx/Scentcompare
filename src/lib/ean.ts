// EAN-13 barcodes: the only thing a store listing is matched on. A fragrance
// is bottled in France, Spain, Italy, the US, the UAE…, so any valid EAN-13
// (or a 12-digit UPC-A, padded) counts, except the ranges that are not product
// codes: restricted/in-store (02, 2), ISBN/ISSN (977–979) and coupons (98–99).
// A listing without one is skipped, never guessed from its title (the
// FigureCompare rule: sizes, testers, old and new bottles, refills and fakes
// all look alike in a title; the barcode tells them apart).

/** True for a 13-digit EAN with a correct check digit. */
export function validEan13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(code[i]) * (i % 2 ? 3 : 1);
  return (10 - (sum % 10)) % 10 === Number(code[12]);
}

/** A valid retail product barcode: a real EAN-13 outside the internal, book and coupon ranges. */
export function isProductEan(code: string): boolean {
  if (!validEan13(code)) return false;
  if (/^(02|2)/.test(code)) return false;
  if (/^(977|978|979|98|99)/.test(code)) return false;
  if (/^0{13}$/.test(code)) return false;
  return true;
}

/** Normalise a barcode field: digits only, a 12-digit UPC-A padded to EAN-13. */
export function normaliseBarcode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const d = String(raw).replace(/[\s-]/g, "");
  if (!/^\d+$/.test(d)) return null;
  if (d.length === 13) return d;
  if (d.length === 12) return `0${d}`;
  return null;
}

const EAN_IN_TEXT = /(?:EAN|barcode|UPC|GTIN)\s*(?:code)?\s*(?:[:：#]|no\.?)?\s*(\d{12,13})(?!\d)/gi;

/**
 * The barcode of a listing, from (in order) the variant's barcode field, its
 * SKU, and a labelled "EAN: …" in the description. Returns null unless exactly
 * one distinct valid barcode is found: a description naming two barcodes
 * (a set, a bundle) is skipped.
 */
export function eanOf(input: { barcode?: string | null; sku?: string | null; text?: string | null }): string | null {
  const bc = normaliseBarcode(input.barcode);
  if (bc && isProductEan(bc)) return bc;
  const sku = normaliseBarcode(input.sku);
  if (sku && isProductEan(sku)) return sku;
  if (input.text) {
    const found = new Set<string>();
    for (const m of input.text.matchAll(EAN_IN_TEXT)) {
      const c = normaliseBarcode(m[1]);
      if (c && isProductEan(c)) found.add(c);
    }
    if (found.size === 1) return [...found][0];
  }
  return null;
}

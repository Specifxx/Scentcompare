import { test } from "node:test";
import assert from "node:assert/strict";
import { readPageProducts, isBotWall } from "@/lib/import/jsonld";
import { parseRobots, robotsAllows } from "@/lib/import/robots";
import { listingsFromState, pageQueue, type PageState } from "@/lib/import/pages";
import { wooListing, wooTitle, wooBrand, type WooProduct } from "@/lib/import/woocommerce";
import type { Store } from "@/content/stores";
import { ean } from "./helpers";

const A = ean("334890115081");
const B = ean("334890115082");
const ld = (x: unknown) => `<html><head><script type="application/ld+json">${JSON.stringify(x)}</script></head></html>`;

test("a Magento-style product page: GTIN, price, currency, stock, brand, photo", () => {
  const html = ld({
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Byredo Black Saffron Eau de Parfum 100ml",
    brand: { "@type": "Brand", name: "Byredo" },
    gtin13: A,
    image: ["https://img.example/b.jpg"],
    offers: { "@type": "Offer", price: "189.00", priceCurrency: "GBP", availability: "https://schema.org/InStock" },
  });
  assert.deepEqual(readPageProducts(html), [
    { name: "Byredo Black Saffron Eau de Parfum 100ml", brand: "Byredo", ean: A, cents: 18900, currency: "GBP", st: "in", img: "https://img.example/b.jpg", url: null },
  ]);
});

test("a ProductGroup's sizes each give their own listing, by their own GTIN", () => {
  const html = ld({
    "@type": "ProductGroup",
    name: "Sauvage EDP",
    brand: "Dior",
    hasVariant: [
      { "@type": "Product", name: "Sauvage EDP 60ml", gtin: A, offers: { price: 120, priceCurrency: "AUD", availability: "OutOfStock" } },
      { "@type": "Product", name: "Sauvage EDP 100ml", gtin: B, offers: { price: 180, priceCurrency: "AUD", availability: "InStock" } },
    ],
  });
  const ps = readPageProducts(html);
  assert.equal(ps.length, 2);
  assert.deepEqual(ps.map((p) => [p.ean, p.cents, p.st, p.brand]), [[A, 12000, "out", "Dior"], [B, 18000, "in", "Dior"]]);
});

test("an EAN in the SKU counts; a non-barcode SKU, a 14-digit GTIN with a leading 0 and @graph pages are read", () => {
  assert.equal(readPageProducts(ld({ "@type": "Product", name: "X", sku: A, offers: { price: 10, priceCurrency: "USD" } }))[0].ean, A);
  assert.equal(readPageProducts(ld({ "@type": "Product", name: "X", sku: "BYR-100", offers: { price: 10, priceCurrency: "USD" } })).length, 0);
  assert.equal(readPageProducts(ld({ "@type": "Product", name: "X", gtin14: `0${A}`, offers: { price: 10 } }))[0].ean, A);
  assert.equal(readPageProducts(ld({ "@graph": [{ "@type": "WebPage" }, { "@type": "Product", name: "X", gtin13: A, offers: [{ price: "9.5", priceCurrency: "EUR" }] }] }))[0].cents, 950);
});

test("one product GTIN with two priced offers and no per-offer codes is ambiguous only when offers name codes", () => {
  // Two offers, neither with its own code: the product's code covers both (same item, two sellers) → one listing.
  const two = readPageProducts(ld({ "@type": "Product", name: "X", gtin13: A, offers: [{ price: 10, priceCurrency: "USD" }, { price: 12, priceCurrency: "USD" }] }));
  assert.equal(two.length, 1);
  // One offer names B: the other, without a code, is not guessed to be A.
  const mixed = readPageProducts(ld({ "@type": "Product", name: "X", gtin13: A, offers: [{ price: 10, priceCurrency: "USD", gtin13: B }, { price: 12, priceCurrency: "USD" }] }));
  assert.deepEqual(mixed.map((p) => p.ean), [B]);
});

test("bot walls are recognised, so the store is stopped rather than worked around", () => {
  assert.ok(isBotWall(403, ""));
  assert.ok(isBotWall(200, "<title>Just a moment...</title>"));
  assert.ok(!isBotWall(200, ld({ "@type": "Product" })));
});

test("robots.txt: the * group's rules, longest match wins, sitemaps collected", () => {
  const r = parseRobots("User-agent: Googlebot\nDisallow: /\n\nUser-agent: *\nDisallow: /checkout\nDisallow: /*?q=\nAllow: /checkout/help\nSitemap: https://s.example/sitemap.xml\n");
  assert.deepEqual(r.sitemaps, ["https://s.example/sitemap.xml"]);
  assert.ok(robotsAllows(r, "/byredo-black-saffron.html"));
  assert.ok(!robotsAllows(r, "/checkout/cart"));
  assert.ok(robotsAllows(r, "/checkout/help"));
  assert.ok(!robotsAllows(r, "/search?q=dior"));
  assert.ok(!robotsAllows(parseRobots("User-agent: *\nDisallow: /\n"), "/x"));
});

const pagesStore: Store = { id: "p", name: "Page Shop", region: "UK", base: "https://p.example", platform: "pages" };

test("pages are read never-seen first, then oldest; no-barcode pages wait 30 days", () => {
  const state: PageState = {
    "https://p.example/a": { at: "2026-11-01", p: [{ e: A, c: 100, cur: "GBP", st: "in", t: "A", b: "", i: null }] },
    "https://p.example/b": { at: "2026-10-30", p: [{ e: B, c: 100, cur: "GBP", st: "in", t: "B", b: "", i: null }] },
    "https://p.example/c": { at: "2026-11-01", p: [] },
    "https://p.example/d": { at: "2026-09-01", p: [] },
  };
  const q = pageQueue(["https://p.example/a", "https://p.example/b", "https://p.example/c", "https://p.example/d", "https://p.example/new"], state, "2026-11-06");
  assert.deepEqual(q, ["https://p.example/new", "https://p.example/b", "https://p.example/a", "https://p.example/d"]);
  // A page whose barcode is on the site goes first, within 60% of the budget.
  assert.deepEqual(pageQueue(["https://p.example/a", "https://p.example/b", "https://p.example/new"], state, "2026-11-06", new Set([A]), 2)[0], "https://p.example/a");
});

test("only fresh readings in the region's own currency become listings", () => {
  const state: PageState = {
    "https://p.example/a": { at: "2026-11-05", p: [{ e: A, c: 18900, cur: "GBP", st: "in", t: "Byredo Black Saffron 100ml", b: "Byredo", i: null }] },
    "https://p.example/b": { at: "2026-10-20", p: [{ e: B, c: 100, cur: "GBP", st: "in", t: "Old", b: "", i: null }] },
    "https://p.example/c": { at: "2026-11-05", p: [{ e: B, c: 100, cur: "EUR", st: "in", t: "Euro", b: "", i: null }] },
  };
  const ls = listingsFromState(pagesStore, state, "2026-11-06");
  assert.deepEqual(ls.map((l) => [l.ean, l.cents, l.region, l.url, l.vendor]), [[A, 18900, "UK", "https://p.example/a", "Byredo"]]);
});

const woo: Store = { id: "w", name: "Woo Shop", region: "AU", base: "https://w.example", platform: "woocommerce" };
const wp = (over: Partial<WooProduct> = {}): WooProduct => ({
  id: 7,
  name: "Dior Sauvage Eau de Parfum 100ml",
  type: "simple",
  permalink: "https://w.example/product/sauvage/",
  sku: A,
  is_in_stock: true,
  prices: { price: "18999", currency_code: "AUD", currency_minor_unit: 2 },
  images: [{ src: "https://w.example/s.jpg" }],
  categories: [{ name: "Men's Fragrance" }],
  attributes: [{ name: "Brand", terms: [{ name: "Dior" }] }],
  ...over,
});

test("a WooCommerce product: minor units, stock, the brand attribute, SKU barcode", () => {
  const r = wooListing(woo, wp(), A);
  assert.equal(r.listing?.cents, 18999);
  assert.equal(r.listing?.st, "in");
  assert.equal(r.listing?.vendor, "Dior");
  assert.equal(r.listing?.url, "https://w.example/product/sauvage/");
  assert.equal(wooListing(woo, wp({ prices: { price: "0", currency_code: "AUD", currency_minor_unit: 2 } }), A).refused, "no-price");
  assert.equal(wooListing(woo, wp({ name: "Dior Sauvage EDP 100ml Tester" }), A).refused, "tester");
  assert.equal(wooListing(woo, wp(), null).noEan, true);
  assert.equal(wooBrand(wp({ attributes: [], brands: [{ name: "Chanel" }] })), "Chanel");
});

test("a WooCommerce variation is named by its parent and its size", () => {
  assert.equal(wooTitle(wp({ name: "Sauvage EDP", variation: "Size: 100ml" }), "Sauvage EDP"), "Sauvage EDP (100ml)");
  assert.equal(wooTitle(wp({ name: "Sauvage EDP - 60ml", variation: "" }), "Sauvage EDP"), "Sauvage EDP - 60ml");
});

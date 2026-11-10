import { test } from "node:test";
import assert from "node:assert/strict";
import { partnerProductUrl, partnersFor, PARTNERS } from "@/lib/affiliate";
import { feedHeader, keepRow, byBrandName, nameIndex, nameKey, partnerPriceIn, productLink, rowBarcode, splitCells, type PartnerPricesFile } from "@/lib/partner-feed";
import { judgePartnerFeeds } from "../scripts/ops-monitor";

const sv = PARTNERS.find((p) => p.key === "stylevana")!;
const EAN = "3348901250146";

test("Stylevana is feed-only: never a search row, a product link through Awin 90791 with our clickref", () => {
  assert.ok(!partnersFor("US", "Dior Sauvage", "sc-us-t", {}).some((x) => x.p.key === "stylevana"));
  const u = new URL(partnerProductUrl(sv, "https://www.stylevana.com/en_US/x.html", "sc-us-table_pinned-1", {})!);
  assert.equal(u.host, "www.awin1.com");
  assert.equal(u.searchParams.get("awinmid"), "90791");
  assert.equal(u.searchParams.get("awinaffid"), "3144410");
  assert.equal(u.searchParams.get("clickref"), "sc-us-table_pinned-1");
  assert.equal(u.searchParams.get("ued"), "https://www.stylevana.com/en_US/x.html");
});

test("Awin CSV header and quoted cells", () => {
  const h = feedHeader(splitCells("aw_deep_link,product_name,search_price,currency,ean,in_stock,merchant_deep_link", ",").cells);
  assert.deepEqual([...h.values()], ["awLink", "name", "price", "currency", "ean", "stock", "link"]);
  const full = feedHeader(splitCells("aw_deep_link,product_name,search_price,currency,ean,product_GTIN,upc,mpn,in_stock,stock_status,brand_name", ",").cells);
  assert.deepEqual([...full.values()], ["awLink", "name", "price", "currency", "ean", "gtin", "upc", "mpn", "stock", "stockStatus", "brand"]);
  assert.deepEqual(splitCells('"a, b","c ""d""",e', ",").cells, ["a, b", 'c "d"', "e"]);
  assert.equal(productLink({ awLink: "https://www.awin1.com/pclick.php?p=1&ued=https%3A%2F%2Fwww.stylevana.com%2Fen_US%2Fx.html" }), "https://www.stylevana.com/en_US/x.html");
});

test("keepRow: barcode only, own currency's region, in stock, 60–160% of the store median", () => {
  const stores = (r: string, e: string) => (r === "US" && e === EAN ? [9000, 10000, 11000] : []);
  const row = { ean: EAN, price: "95.00", currency: "USD", stock: "1", link: "https://www.stylevana.com/en_US/x.html" };
  assert.deepEqual(keepRow(row, stores), { region: "US", ean: EAN, p: 9500, u: "https://www.stylevana.com/en_US/x.html", by: "barcode" });
  assert.equal(keepRow({ ...row, stock: "0" }, stores), null);
  assert.equal(keepRow({ ...row, currency: "GBP" }, stores), null);
  assert.equal(keepRow({ ...row, price: "30.00" }, stores), null, "a mini, not the bottle");
  assert.equal(keepRow({ ...row, price: "200.00" }, stores), null, "a gift set");
  assert.equal(keepRow({ ...row, ean: "3348901250147" }, stores), null, "bad check digit");
});

test("a feed price shows for three days after its last good read", () => {
  const file: PartnerPricesFile = { v: 1, feeds: { stylevana: { at: "2026-11-06T15:00:00Z", rows: 10, kept: 1 } }, prices: { stylevana: { US: { [EAN]: [9500, "https://www.stylevana.com/en_US/x.html"] } } } };
  assert.equal(partnerPriceIn(file, "stylevana", "US", EAN, Date.parse("2026-11-07T00:00:00Z"))?.p, 9500);
  assert.equal(partnerPriceIn(file, "stylevana", "US", EAN, Date.parse("2026-11-10T16:00:00Z")), null);
});

test("ops monitor: quiet until a feed exists, amber on an error or a stale read", () => {
  const now = Date.parse("2026-11-06T18:00:00Z");
  assert.equal(judgePartnerFeeds(null, now).status, "ok");
  assert.equal(judgePartnerFeeds({ v: 1, feeds: { stylevana: { at: "2026-11-06T15:00:00Z", error: "feed answered HTTP 401" } }, prices: {} }, now).status, "warn");
});

test("the barcode can sit in ean, product_GTIN (14 digits) or upc", () => {
  assert.equal(rowBarcode({ ean: "", gtin: `0${EAN}` }), EAN);
  assert.equal(rowBarcode({ ean: "n/a", upc: "085715169037" }), "0085715169037");
  assert.equal(rowBarcode({ ean: "3348901250147", gtin: EAN }), EAN, "a bad ean falls through to a good GTIN");
});

test("both stock columns must say in stock", () => {
  const stores = () => [9000, 10000, 11000];
  const row = { ean: EAN, price: "95.00", currency: "USD", link: "https://www.stylevana.com/en_US/x.html" };
  assert.ok(keepRow({ ...row, stock: "1", stockStatus: "in stock" }, stores));
  assert.equal(keepRow({ ...row, stock: "1", stockStatus: "out of stock" }, stores), null);
  assert.equal(keepRow({ ...row, stock: "1", stockStatus: "preorder" }, stores), null);
  assert.equal(keepRow({ ...row, stock: "0", stockStatus: "in stock" }, stores), null);
});

test("brand + name fallback: only without a barcode, exact and unique", () => {
  const products = [
    { ean: EAN, brand: "Dior", name: "Dior Sauvage Eau de Parfum 100ml" },
    { ean: "3348901250153", brand: "Dior", name: "Dior Sauvage Eau de Toilette 100ml" },
    { ean: "3348901368247", brand: "Dior", name: "Dior Sauvage Elixir 60ml" },
    { ean: "3614272049529", brand: "Ralph Lauren", name: "Ralph Lauren Polo Blue EDT 125ml" },
    { ean: "3614272049536", brand: "Ralph Lauren", name: "Ralph Lauren Polo Blue Eau de Toilette 125 ml" },
  ];
  const idx = nameIndex(products);
  assert.equal(byBrandName(idx, "Dior", "SAUVAGE EDP 3.4 oz"), EAN);
  assert.equal(byBrandName(idx, "Dior", "Sauvage EDT 100ml"), "3348901250153");
  assert.equal(byBrandName(idx, "Dior", "Sauvage EDP 50ml"), null, "another size");
  assert.equal(nameKey("Dior", "Sauvage Eau de Parfum"), null, "no size, no key");
  const stores = (r: string, e: string) => (r === "US" && e === EAN ? [9000, 10000, 11000] : [9000]);
  const row = { brand: "Dior", name: "Sauvage Eau de Parfum 100ml", price: "95.00", currency: "USD", stock: "1", link: "https://www.stylevana.com/en_US/x.html" };
  assert.deepEqual(keepRow(row, stores, undefined, idx), { region: "US", ean: EAN, p: 9500, u: row.link, by: "name" });
  assert.equal(keepRow(row, stores, undefined, undefined), null, "no index, no fallback");
  assert.equal(keepRow({ ...row, name: "Sauvage Eau de Parfum 100ml Tester" }, stores, undefined, idx), null, "a tester never");
  assert.equal(keepRow({ ...row, name: "Sauvage Eau de Parfum Intense 100ml" }, stores, undefined, idx), null, "an extra word is another product");
  assert.equal(keepRow({ ...row, brand: "Ralph Lauren", name: "Polo Blue EDT 125ml" }, stores, undefined, idx), null, "two products share the key: no match");
  assert.equal(keepRow({ ...row, ean: "3348901250153" }, () => [9000, 10000, 11000], undefined, idx)?.ean, "3348901250153", "a barcode beats the name");
});

test("The Beauty Store UK: feed-only, Awin 116255, and a Google-format row (price '15.55 GBP', no currency column) lands in UK", () => {
  const bs = PARTNERS.find((p) => p.key === "beautystore")!;
  assert.equal(bs.awinMid, 116255);
  assert.ok(!partnersFor("UK", "Dior Sauvage", "sc-uk-t", {}).some((x) => x.p.key === "beautystore"));
  const h = feedHeader(splitCells("id,title,link,aw_deep_link,gtin,brand,availability,price,sale_price", ",").cells);
  assert.deepEqual([...h.values()], ["name", "link", "awLink", "gtin", "brand", "stockStatus", "price", "salePrice"]);
  const row = { gtin: EAN, price: "100.00 GBP", salePrice: "90.00 GBP", stockStatus: "in_stock", link: "https://thebeautystore.com/products/x" };
  const stores = () => [9000, 9500, 10000];
  assert.deepEqual(keepRow(row, stores), { region: "UK", ean: EAN, p: 9000, u: "https://thebeautystore.com/products/x", by: "barcode" });
  assert.equal(keepRow({ ...row, stockStatus: "out_of_stock" }, stores), null);
});

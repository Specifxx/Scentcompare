import { test } from "node:test";
import assert from "node:assert/strict";
import { partnerProductUrl, partnersFor, PARTNERS } from "@/lib/affiliate";
import { feedHeader, keepRow, partnerPriceIn, productLink, splitCells, type PartnerPricesFile } from "@/lib/partner-feed";
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
  assert.deepEqual([...h.values()], ["awLink", "price", "currency", "ean", "stock", "link"]);
  assert.deepEqual(splitCells('"a, b","c ""d""",e', ",").cells, ["a, b", 'c "d"', "e"]);
  assert.equal(productLink({ awLink: "https://www.awin1.com/pclick.php?p=1&ued=https%3A%2F%2Fwww.stylevana.com%2Fen_US%2Fx.html" }), "https://www.stylevana.com/en_US/x.html");
});

test("keepRow: barcode only, own currency's region, in stock, 60–160% of the store median", () => {
  const stores = (r: string, e: string) => (r === "US" && e === EAN ? [9000, 10000, 11000] : []);
  const row = { ean: EAN, price: "95.00", currency: "USD", stock: "1", link: "https://www.stylevana.com/en_US/x.html" };
  assert.deepEqual(keepRow(row, stores), { region: "US", ean: EAN, p: 9500, u: "https://www.stylevana.com/en_US/x.html" });
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

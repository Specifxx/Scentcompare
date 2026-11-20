// Featured products are about US$20 or more (owner, 2026-11-06): the homepage rows, the hero and the eBay plan.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { featureMin, featuredIn, isFeatured, isHomeFeatured, homeMin } from "../src/lib/featured";
import { planEbay } from "../src/lib/ebay";
import type { Product } from "../src/lib/types";

const prod = (ean: string, region: "US" | "AU", prices: number[], st: ("in" | "out")[] = []): Product => ({
  ean, slug: ean, name: ean, brand: "b", b: "b", cat: "women", size: "50ml", img: null, first: "2026-10-30",
  offers: { [region]: prices.map((p, i) => ({ s: `s${i}`, p, st: st[i] ?? "in", u: "https://x" })) },
} as Product);

test("about US$20 in every currency, judged on the cheapest in-stock price", () => {
  assert.equal(featureMin("US"), 2000);
  assert.ok(featureMin("AU") > 2000);
  assert.ok(isFeatured(prod("a", "US", [2000, 2500]), "US"));
  assert.ok(!isFeatured(prod("b", "US", [1999, 2500]), "US"));
  assert.ok(isFeatured(prod("c", "US", [900, 2500], ["out", "in"]), "US"), "a sold-out cheap store does not count");
  assert.ok(!isFeatured(prod("d", "AU", [2500, 2600]), "AU"), "A$25 is under US$20");
  assert.ok(!isFeatured(prod("e", "US", [2500]), "AU"));
  assert.deepEqual(featuredIn("US", [prod("x", "US", [1000]), prod("y", "US", [5000])]).map((f) => f.ean), ["y"]);
});

test("eBay calls go only to featured products", () => {
  const list = [prod("cheap", "US", [1000, 1100]), prod("dear", "US", [5000, 5200])];
  const plan = planEbay(list, {}, ["US"], 10, undefined, "2026-11-06", undefined, isFeatured);
  assert.deepEqual(plan.map((p) => p.f.ean), ["dear"]);
  const src = fs.readFileSync("scripts/ebay-import.ts", "utf8");
  assert.match(src, /isFeatured\(f, r\)/);
});

test("the homepage rows read the featured list", () => {
  const src = fs.readFileSync("src/lib/home-shelves.ts", "utf8");
  assert.match(src, /homeFeaturedIn\(region/);
  assert.match(src, /rankProducts\(popularNow\(region, 24, feat\), region\)\.slice\(0, 8\)/);
  // The page, the eBay plan and the Amazon search and fetch all read the same shelves (owner, 2026-11-19).
  assert.match(fs.readFileSync("src/app/page.tsx", "utf8"), /homeShelves\(r\.code, all\)/);
  for (const f of ["scripts/ebay-import.ts", "scripts/amazon-asins.ts", "scripts/fetch-amazon-prices.ts"]) assert.match(fs.readFileSync(f, "utf8"), /priorityEans\(/, f);
});

test("the homepage floor is higher than the featured floor in every region", () => {
  for (const r of ["US", "UK", "CA", "AU", "NZ", "EU"] as const) if (homeMin(r) > 0) assert.ok(homeMin(r) >= featureMin(r), r);
  assert.ok(isHomeFeatured(prod("h", "US", [7500, 8000]), "US"));
  assert.ok(!isHomeFeatured(prod("l", "US", [7499, 8000]), "US"));
});

test("the gift test: the 20 most popular gift sets join the eBay and Amazon priority until 14 Dec, then nothing", async () => {
  const { giftTestEans, priorityEans, GIFT_TEST_UNTIL, GIFT_TEST_SIZE } = await import("../src/lib/home-shelves");
  assert.equal(GIFT_TEST_UNTIL, "2026-12-14");
  assert.equal(GIFT_TEST_SIZE, 20);
  const sets = Array.from({ length: 25 }, (_, i) => ({ ...prod(`set${i}`, "US", [9000 + i, 9500]), cat: "sets" }) as Product);
  const other = prod("w", "US", [9000, 9500]);
  const during = giftTestEans("US", [...sets, other], "2026-12-14");
  assert.equal(during.size, 20);
  assert.ok(!during.has("w"));
  assert.equal(giftTestEans("US", sets, "2026-12-15").size, 0);
  for (const e of during) assert.ok(priorityEans("US", [...sets, other], "2026-12-01").has(e));
});

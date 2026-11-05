import { test } from "node:test";
import assert from "node:assert/strict";
import { dropMirrors, mergeListings, saneOffers, type MergeState } from "@/lib/merge";
import type { Listing } from "@/lib/types";
import { ean } from "./helpers";

const SAUVAGE = ean("334890115081");
const L = (store: string, region: Listing["region"], cents: number, extra: Partial<Listing> = {}): Listing => ({
  store,
  region,
  title: "Dior Sauvage Eau de Parfum 100ml for Men",
  vendor: "Dior",
  kind: "Eau de Parfum",
  ean: SAUVAGE,
  cents,
  st: "in",
  url: `https://${store}.example/p`,
  img: null,
  ...extra,
});
const fresh = (): MergeState => ({ slugs: {}, first: {} });

test("one product per barcode, kept when 2+ stores in one region sell it", () => {
  const out = mergeListings([L("a", "US", 2199), L("b", "US", 2499), L("c", "AU", 3295)], fresh(), "2026-10-30");
  assert.equal(out.length, 1);
  assert.equal(out[0].offers.US!.length, 2);
  assert.equal(out[0].offers.AU!.length, 1, "a single offer elsewhere is still shown");
  assert.equal(out[0].brand, "Dior");
  assert.equal(out[0].cat, "men");
  assert.equal(out[0].size, "100ml");
  assert.equal(out[0].name, "Dior Sauvage Eau de Parfum 100ml for Men");
  assert.equal(out[0].slug, "dior-sauvage-eau-de-parfum-100ml-for-men");
});

test("one store in each region is not a comparison", () => {
  assert.equal(mergeListings([L("a", "US", 2199), L("c", "AU", 3295)], fresh(), "2026-10-30").length, 0);
});

test("a store listing a barcode twice counts once, its orderable cheapest copy", () => {
  const out = mergeListings([L("a", "US", 1999, { st: "out" }), L("a", "US", 2599), L("b", "US", 2499)], fresh(), "2026-10-30");
  assert.deepEqual(out[0].offers.US!.map((o) => [o.s, o.p]), [["b", 2499], ["a", 2599]]);
});

test("orderable first, then cheapest", () => {
  const out = mergeListings([L("a", "US", 1999, { st: "out" }), L("b", "US", 2499), L("c", "US", 2299)], fresh(), "2026-10-30");
  assert.deepEqual(out[0].offers.US!.map((o) => o.s), ["c", "b", "a"]);
});

test("refused titles never count toward the two stores", () => {
  const out = mergeListings([L("a", "US", 2199), L("b", "US", 900, { title: "Dior Sauvage EDP 100ml Tester" })], fresh(), "2026-10-30");
  assert.equal(out.length, 0);
});

test("a price far from the others is dropped (a mini filed under the big bottle's barcode)", () => {
  const kept = saneOffers([2000, 2100, 2200, 300].map((p, i) => ({ s: `s${i}`, p, st: "in" as const, u: "" })));
  assert.deepEqual(kept.map((o) => o.p), [2000, 2100, 2200]);
});

test("slugs are kept forever", () => {
  const state = fresh();
  mergeListings([L("a", "US", 2199), L("b", "US", 2499)], state, "2026-10-30");
  const again = mergeListings([L("a", "US", 2199, { title: "Dior Sauvage EDP 100ml Men" }), L("b", "US", 2499, { title: "Dior Sauvage EDP 100ml Men" })], state, "2026-11-01");
  assert.equal(again[0].slug, "dior-sauvage-eau-de-parfum-100ml-for-men");
  assert.equal(again[0].first, "2026-10-30");
});

test("mirrors (one stock under two names) count once", () => {
  const many = (store: string) => Array.from({ length: 6 }, (_, i) => L(store, "AU", 2000 + i, { ean: ean(`33489011508${i}`) }));
  const { mirrors, listings } = dropMirrors([...many("a"), ...many("b"), L("c", "AU", 2000)], ["a", "b", "c"]);
  assert.deepEqual(mirrors, { b: "a" });
  assert.ok(!listings.some((l) => l.store === "b"));
});

test("two prices more than 3x apart in a region: neither is shown there", () => {
  const two = (a: number, b: number) => saneOffers([a, b].map((p, i) => ({ s: `s${i}`, p, st: "in" as const, u: "" })));
  assert.equal(two(1999, 12999).length, 0, "a 10 ml mini at 19.99 against the 100 ml at 129.99");
  assert.equal(two(1999, 2999).length, 2);
});

test("listings naming a different pack under one barcode: the size most stores name wins", () => {
  const out = mergeListings(
    [L("a", "US", 2199), L("b", "US", 2299), L("c", "US", 1200, { title: "Dior Sauvage Eau de Parfum 50ml for Men" })],
    fresh(),
    "2026-10-30",
  );
  assert.deepEqual(out[0].offers.US!.map((o) => o.s), ["a", "b"]);
});

test("one store says 50 ml, the other 100 ml: the barcode is left out", () => {
  const bottle = (store: string, cents: number, title: string) => L(store, "CA", cents, { title, kind: "Eau de Parfum" });
  const out = mergeListings([bottle("a", 9900, "Dior Sauvage Eau de Parfum 50ml"), bottle("b", 15900, "Dior Sauvage Eau de Parfum 100ml")], fresh(), "2026-10-30");
  assert.equal(out.length, 0);
});

test("one brand spelling across the catalogue", () => {
  const nine = ean("628000000001");
  const out = mergeListings(
    [
      L("a", "US", 2199, { vendor: "LATTAFA" }),
      L("b", "US", 2299, { vendor: "LATTAFA" }),
      L("a", "US", 1500, { vendor: "lattafa", ean: nine, title: "lattafa Khamrah EDP 100ml" }),
      L("b", "US", 1600, { vendor: "lattafa", ean: nine, title: "lattafa Khamrah EDP 100ml" }),
      L("c", "US", 1600, { vendor: "LATTAFA", ean: nine, title: "lattafa Khamrah EDP 100ml" }),
    ],
    fresh(),
    "2026-10-30",
  );
  assert.deepEqual([...new Set(out.map((p) => p.brand))], ["Lattafa"], "the house list's spelling");
});

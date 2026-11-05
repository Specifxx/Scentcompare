import { test } from "node:test";
import assert from "node:assert/strict";
import { brandFromTitle, brandName, canonicalKey, listingBrand } from "@/lib/brand";

test("one house, however a store spells it", () => {
  assert.equal(canonicalKey("DIOR"), canonicalKey("Christian Dior"));
  assert.equal(canonicalKey("YSL"), canonicalKey("Yves Saint Laurent"));
  assert.equal(canonicalKey("Paco Rabanne"), canonicalKey("Rabanne"));
  assert.equal(canonicalKey("Jo Malone London"), canonicalKey("Jo Malone"));
  assert.equal(canonicalKey("Dolce & Gabbana"), canonicalKey("Dolce&Gabbana"));
  assert.equal(canonicalKey("Lattafa Perfumes"), canonicalKey("Lattafa"));
  assert.equal(brandName(canonicalKey("lancome"), ["Lancome", "LANCOME"]), "Lancôme");
  assert.equal(brandName("newhouse", ["NewHouse", "NewHouse", "NEWHOUSE"]), "NewHouse");
});

test("a vendor that is the store itself falls back to the title", () => {
  assert.equal(listingBrand("Perfume Boss", "Dior Sauvage Eau de Parfum 100ml", "Perfume Boss"), "Dior");
  assert.equal(listingBrand("", "Jean Paul Gaultier Le Male EDT 125ml", "Shop"), "Jean Paul Gaultier");
  assert.equal(listingBrand("Lattafa", "Khamrah EDP 100ml", "Shop"), "Lattafa");
  assert.equal(listingBrand("Designer Fragrances", "Creed Aventus 100ml", "Shop"), "Creed", "a generic vendor is not a house");
  assert.equal(brandFromTitle("[NEW] Maison Francis Kurkdjian Baccarat Rouge 540"), "Maison Francis Kurkdjian");
  assert.equal(brandFromTitle("Some Unknown Scent"), null);
});

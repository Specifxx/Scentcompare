// Every rule in src/lib/title.ts has a store-style title here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { amountOf, categoryOf, cleanName, listingAmounts, pickName, readTitle, sizeOf, sizesConflict, tidyName } from "@/lib/title";

const refused = (t: string) => {
  const r = readTitle(t);
  return "refused" in r ? r.refused : null;
};

test("single bottles pass", () => {
  for (const t of [
    "Dior Sauvage Eau de Parfum 100ml",
    "Chanel Coco Mademoiselle Eau de Parfum Spray 50ml",
    "Creed Aventus Eau de Parfum 100ml",
    "Lattafa Khamrah Eau de Parfum 100ml Unisex",
    "Jean Paul Gaultier Le Male Elixir Parfum 125ml",
    "Maison Francis Kurkdjian Baccarat Rouge 540 Extrait de Parfum 70ml",
    "Chanel Bleu de Chanel Parfum Twist and Spray 3 x 20ml",
  ])
    assert.equal(refused(t), null, t);
});

test("testers, unboxed bottles, decants, samples and damaged stock are refused", () => {
  assert.equal(refused("Dior Sauvage EDP 100ml (Tester)"), "tester");
  assert.equal(refused("Creed Aventus 100ml Unboxed No Cap"), "tester");
  assert.equal(refused("Tom Ford Oud Wood 5ml Decant"), "decant");
  assert.equal(refused("Baccarat Rouge 540 Sample Vial 2ml"), "decant");
  assert.equal(refused("Parfums de Marly Layton 10ml Travel Atomizer"), "decant");
  assert.equal(refused("Versace Eros EDT 100ml (Box Damaged)"), "damaged");
  assert.equal(refused("Chanel No 5 EDP 100ml 80% Full"), "pre-owned");
});

test("dupes and 'inspired by' oils are refused", () => {
  assert.equal(refused("Inspired by Creed Aventus Men's Fragrance Oil 10ml"), "dupe");
  assert.equal(refused("Baccarat Rouge 540 Type Perfume Oil"), "dupe");
  assert.equal(refused("Our Impression of Sauvage 50ml"), "dupe");
  assert.equal(refused("Aventus Dupe EDP 100ml"), "dupe");
  assert.equal(refused("Lattafa Asad Eau de Parfum 100ml"), null, "a real house's bottle is not a dupe");
});

test("store-made bundles are refused; a house's own gift set is not", () => {
  assert.equal(refused("Dior Sauvage + Bleu de Chanel Bundle"), "bundle");
  assert.equal(refused("Buy 2 Get 1 Free Lattafa"), "bundle");
  assert.equal(refused("Versace Eros EDT 100ml x2"), "bundle");
  assert.equal(refused("Perfume Mystery Box"), "mystery");
  assert.equal(refused("Gift Card"), "not-fragrance");
  // Fragrance Nevaeh sells a bottle's cap alone, under the bottle's barcode.
  assert.equal(refused("Parfums de Marly Delina/Delina Exclusif/Delina La Rosee (Cap)"), "not-fragrance");
  assert.equal(refused("Replacement Cap for Sauvage 100ml"), "not-fragrance");
  assert.equal(refused("Dior Sauvage Eau de Toilette 100ml Gift Set"), null);
  assert.equal(refused("Versace Eros 3 Piece Gift Set"), null);
});

test("sections: what it is, then who it is for", () => {
  const c = (t: string, k = "") => categoryOf(t, k);
  assert.equal(c("Chanel Coco Mademoiselle EDP 100ml for Women"), "women");
  assert.equal(c("Dior Sauvage Eau de Parfum 100ml for Men"), "men");
  assert.equal(c("Dior Sauvage Eau de Parfum Pour Homme 100ml"), "men");
  assert.equal(c("Versace Eros Aftershave Lotion 100ml"), "body", "an aftershave lotion is body care");
  assert.equal(c("Lattafa Khamrah EDP 100ml Unisex"), "unisex");
  assert.equal(c("Creed Aventus Eau de Parfum 100ml"), "unisex", "a niche house without a gender is unisex");
  assert.equal(c("Dior Sauvage Eau de Parfum 100ml"), "other", "a designer bottle without a gender says nothing");
  assert.equal(c("Dior Sauvage Eau de Parfum 100ml", "Men's Fragrance"), "men", "the store's type and tags decide next");
  assert.equal(c("Tom Ford Lost Cherry EDP 50ml", "Women, Men"), "unisex");
  assert.equal(c("Versace Eros Eau de Toilette 100ml Gift Set"), "sets");
  assert.equal(c("Dior Sauvage EDT 10ml Travel Spray"), "minis");
  assert.equal(c("Chanel Bleu de Chanel EDP 10ml"), "minis", "a 10 ml bottle is a mini");
  assert.equal(c("Victoria's Secret Bare Vanilla Fragrance Mist 250ml"), "body");
  assert.equal(c("Jo Malone Lime Basil & Mandarin Body Creme 175ml"), "body");
  assert.equal(c("Diptyque Baies Scented Candle 190g"), "other");
  assert.equal(c("Byredo Gypsy Water Hair Perfume 75ml"), "body");
  assert.equal(c("Lancome La Vie Est Belle L'Elixir 50ml Ladies"), "women");
});

test("bottle sizes", () => {
  assert.equal(sizeOf("Dior Sauvage Eau de Parfum 100ml"), "100ml");
  assert.equal(sizeOf("Creed Aventus 3.3 oz EDP Spray"), "3.3 oz");
  assert.equal(sizeOf("Chanel No 5 1.7 fl oz"), "1.7 fl oz");
  assert.equal(sizeOf("Diptyque Baies Candle 190G"), "190g");
  assert.equal(sizeOf("Lattafa Asad EDP"), null);
});

test("names: store noise out, house first, once", () => {
  assert.equal(cleanName("[NEW] Dior Sauvage Eau de Parfum 100ml (Sealed)"), "Dior Sauvage Eau de Parfum 100ml");
  assert.equal(tidyName("Dior - Sauvage Eau de Parfum 100ml", "Dior"), "Dior Sauvage Eau de Parfum 100ml");
  assert.equal(tidyName("Sauvage Eau de Parfum 100ml by Dior", "Dior"), "Dior Sauvage Eau de Parfum 100ml");
  assert.equal(tidyName("VERSACE EROS EAU DE TOILETTE 100ML", "Versace"), "Versace Eros Eau de Toilette 100ml");
  assert.equal(pickName(["Dior Sauvage EDP", "Dior Sauvage Eau de Parfum 100ml", "Dior Sauvage Eau de Parfum 100ml"]), "Dior Sauvage Eau de Parfum 100ml");
});

test("the variant's own trailing size wins over the product title's first", () => {
  assert.equal(sizeOf("Dior Sauvage EDP 60ml / 100ml (100ml)"), "100ml");
  assert.equal(sizeOf("Chanel Chance Eau Tendre EDP 50ml (Spray)"), "50ml");
});

test("listing sizes: one, none when the title names two bottles, the big one in a set", () => {
  assert.deepEqual(listingAmounts("Creed Aventus (3.3 oz / 100ml)").map((a) => [a.dim, Math.round(a.n)]), [["amount", 98]]);
  assert.deepEqual(listingAmounts("Dior Sauvage EDP 60ml / 100ml"), []);
  assert.deepEqual(listingAmounts("Dior Sauvage EDP 60ml / 100ml (100ml)").map((a) => a.n), [100]);
  assert.deepEqual(listingAmounts("Versace Eros EDT 100ml + 10ml Gift Set").map((a) => a.n), [100], "a set is its main bottle");
  assert.equal(sizesConflict(amountOf("50ml"), amountOf("100ml")), true);
  assert.equal(sizesConflict(amountOf("3.4 oz"), amountOf("100ml")), false);
  assert.equal(sizesConflict(amountOf("1.7 fl oz"), amountOf("50ml")), false);
});

test("store flags and size counts are not part of a product's name", () => {
  assert.equal(cleanName("Lattafa NEW* Khamrah Eau de Parfum (3 Sizes) (100ml)"), "Lattafa Khamrah Eau de Parfum (100ml)");
  assert.equal(cleanName("Armaf CLEARANCE* Club de Nuit Intense Man EDT 105ml"), "Armaf Club de Nuit Intense Man EDT 105ml");
  assert.equal(cleanName("Versace Eros EDT 100 ml."), "Versace Eros EDT 100 ml");
  assert.equal(cleanName("Chanel Bleu de Chanel Parfum 100ml - Perfume"), "Chanel Bleu de Chanel Parfum 100ml");
});

test("promotions written into a title are not part of the name", () => {
  assert.equal(cleanName("Afnan $1 Deal *renew* 9pm Eau de Parfum 100ml"), "Afnan 9pm Eau de Parfum 100ml");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { eanOf, isProductEan, normaliseBarcode, validEan13 } from "@/lib/ean";
import { ean } from "./helpers";

const SNAIL = ean("334890115081"); // a French EAN, as on a Dior box

test("EAN-13 check digit", () => {
  assert.ok(validEan13(SNAIL));
  assert.ok(!validEan13(SNAIL.slice(0, 12) + ((Number(SNAIL[12]) + 1) % 10)));
  assert.ok(!validEan13("12345"));
});

test("any country's retail barcode counts; internal, book and coupon ranges do not", () => {
  assert.ok(isProductEan(SNAIL), "France");
  assert.ok(isProductEan(ean("841221350011")), "Spain (Puig)");
  assert.ok(isProductEan(ean("008800000000")), "a US UPC padded to 13");
  assert.ok(isProductEan(ean("628000000000")), "the UAE (Lattafa)");
  assert.ok(!isProductEan(ean("200000000000")), "a store's internal code (2…)");
  assert.ok(!isProductEan(ean("978000000000")), "an ISBN");
  assert.ok(!isProductEan(ean("990000000000")), "a coupon");
  assert.equal(eanOf({ barcode: ean("008571532065").slice(1) }), ean("008571532065"), "a 12-digit UPC is padded to 13");
});

test("barcode, then SKU, then one labelled EAN in the text", () => {
  assert.equal(eanOf({ barcode: SNAIL }), SNAIL);
  assert.equal(eanOf({ barcode: "", sku: SNAIL }), SNAIL);
  assert.equal(eanOf({ sku: "DIOR-SAUV-100" }), null);
  assert.equal(eanOf({ text: `<p>EAN: ${SNAIL}</p>` }), SNAIL);
  assert.equal(eanOf({ text: `EAN: ${SNAIL} / EAN: ${ean("334890115082")}` }), null, "two barcodes: a bundle, skipped");
  assert.equal(normaliseBarcode(" 3348 9011-50811 "), "3348901150811");
});

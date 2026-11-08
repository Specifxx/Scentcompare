// "Smells like X, costs less" (lib/smells-like.ts, DECISIONS.md 2026-11-08).
import { test } from "node:test";
import assert from "node:assert/strict";
import { MIN_SAVING, noteOverlap, noteWeights, sharedNotes, sizeMl, SMELLS_LIKE_MIN } from "../src/lib/smells-like";

test("sizes in ml and oz", () => {
  assert.equal(sizeMl("100ml"), 100);
  assert.equal(sizeMl("3.4 oz"), 101);
  assert.equal(sizeMl("1.7 fl oz"), 50);
  assert.equal(sizeMl("50 ML"), 50);
  assert.equal(sizeMl(null), null);
  assert.equal(sizeMl("3 pcs"), null);
});

test("rare shared notes count for more than common ones", () => {
  const goodGirl = { t: ["almond", "coffee"], h: ["tuberose", "jasmine"], b: ["tonka-bean", "cacao", "musk"] };
  const close = { t: ["coffee"], h: ["tuberose"], b: ["tonka-bean", "musk"] };
  const far = { t: ["lemon"], h: ["rose"], b: ["musk", "amber"] };
  const filler = Array.from({ length: 20 }, () => ({ b: ["musk", "amber"] }));
  const w = noteWeights([goodGirl, close, far, ...filler]);
  assert.ok(noteOverlap(goodGirl, close, w) > noteOverlap(goodGirl, far, w));
  assert.deepEqual(sharedNotes(goodGirl, close), ["coffee", "tuberose", "tonka-bean", "musk"]);
  assert.equal(noteOverlap(goodGirl, goodGirl, w), 1);
});

test("a page needs 3+ alternatives, each meaningfully cheaper (owner, 2026-11-08)", () => {
  assert.equal(SMELLS_LIKE_MIN, 3);
  assert.ok(MIN_SAVING >= 0.1);
});

test("never dupes: the page copy says so and the data layer keeps other houses only", async () => {
  const fs = await import("node:fs");
  const page = fs.readFileSync("src/app/smells-like/[slug]/page.tsx", "utf8");
  assert.match(page, /never dupes, clones or &ldquo;inspired by&rdquo; bottles/);
  assert.match(fs.readFileSync("src/lib/data.ts", "utf8"), /c\.rep\.b === ref\.rep\.b\) continue; \/\/ other houses only/);
});

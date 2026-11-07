// "Smells like" (lib/notes.ts): every case is real store copy from the 2026-11-06 notes probe.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildNotes, consensus, headlineNotes, notesInItem, readNotes, smellsLikeText, wearLine } from "@/lib/notes";

test("labelled top / middle / base lists, origins and adjectives dropped", () => {
  const html = "<p>Fragrance Notes</p><p>Top Notes: Calabrian bergamot, Cardamom, Red apple</p><p>Middle Notes: Bourbon geranium, Clary sage, Lavender</p><p>Base Notes: Haitian vetiver, Patchouli, Tobacco leaf</p>";
  assert.deepEqual(readNotes(html), { t: ["bergamot", "cardamom", "apple"], h: ["geranium", "sage", "lavender"], b: ["vetiver", "patchouli", "tobacco"] });
});

test("Fragrantica's 'Top notes are …; middle notes are …' wording", () => {
  const r = readNotes("Top notes are Cherry, Bergamot and Lemon; middle notes are Orris, Heliotrope, Patchouli and Jasmine; base notes are Madagascar Vanilla and White Musk.");
  assert.deepEqual(r, { t: ["cherry", "bergamot", "lemon"], h: ["iris", "heliotrope", "patchouli", "jasmine"], b: ["vanilla", "musk"] });
});

test("bare TOP : / HEART : / BASE : labels and · separators", () => {
  const r = readNotes("THE NOTES\n TOP : Bitter Orange, Fresh Ginger, Somali Incense\n HEART : Osmanthus, Leather\n BASE : Sandalwood, Haitian Vetiver, Atlas Cedar, Amber");
  assert.deepEqual(r?.t, ["bitter-orange", "ginger", "incense"]);
  assert.deepEqual(r?.b, ["sandalwood", "vetiver", "cedar", "amber"]);
  const s = readNotes("Top: Bergamot · Bitter Orange · Clary Sage\n Heart: Petal Accord · Jasmine Sambac\n Base: Virginia Cedarwood · Tonka Bean · Madagascar Vanilla · Musk");
  assert.deepEqual(s?.h, ["jasmine"]);
});

test("a flat 'Notes:' list", () => {
  assert.deepEqual(readNotes("KEY NOTES: Bergamot, black pepper, lavender, orange blossom, ambery wood, patchouli"), {
    a: ["bergamot", "black-pepper", "lavender", "orange-blossom", "woods", "patchouli"],
  });
});

test("bullet lines under a bare label", () => {
  const r = readNotes("**Product Notes:**\n- **Base Notes:** \n - Musk\n - Amber\n - Cedarwood\n- **Middle Notes:** \n - Jasmine\n - Rose\n- **Top Notes:** \n - Bergamot\n - Lemon");
  assert.deepEqual(r, { t: ["bergamot", "lemon"], h: ["jasmine", "rose"], b: ["musk", "amber", "cedar"] });
});

test("prose is never read as a note list", () => {
  assert.equal(readNotes("The fragrance opens with a lively burst of Italian bergamot. The opening is invigorating with citrus and mint."), null);
  assert.equal(readNotes("Notes of Morello cherry beg you to bite into it."), null);
  assert.equal(readNotes("This 500ml refill offers radiant notes of sandalwood, sage, and jasmine."), null);
});

test("a description that lists two fragrances' pyramids is not guessed", () => {
  const two = "Bleu EDP\nTop notes: Lemon, Mint\nBase notes: Cedar, Amber\nBleu EDT\nTop notes: Grapefruit, Pepper\nBase notes: Vetiver, Musk";
  assert.equal(readNotes(two), null);
});

test("unknown words are dropped, not turned into notes", () => {
  assert.deepEqual(notesInItem("Kyphi"), []);
  assert.deepEqual(notesInItem("orange blossom"), ["orange-blossom"]);
  assert.deepEqual(notesInItem("Raspberry and Peach accord"), ["raspberry", "peach"]);
});

test("consensus: notes two stores agree on, a stray store's list ignored", () => {
  const a = { t: ["bergamot", "lemon"], h: ["lavender"], b: ["vanilla", "cedar"] };
  const b = { t: ["bergamot"], h: ["lavender", "jasmine"], b: ["vanilla", "cedar", "musk"] };
  const wrong = { a: ["rose", "oud", "saffron"] };
  const c = consensus([a, b, wrong]);
  assert.deepEqual(c, { t: ["bergamot"], h: ["lavender"], b: ["vanilla", "cedar"], n: 2 });
  assert.equal(consensus([a, wrong]), null, "two stores that share nothing: no panel");
});

test("buildNotes keeps yesterday's notes only for a barcode nobody described today", () => {
  const out = buildNotes(
    [{ store: "x", ean: "1", notes: { a: ["rose", "musk"] } }],
    ["1", "2", "3"],
    { "2": { a: ["vanilla", "amber"], n: 1 }, "9": { a: ["oud", "rose"], n: 1 } },
  );
  assert.deepEqual(Object.keys(out), ["1", "2"]);
});

test("plain words: vivid notes first, one per family, and how it wears", () => {
  const p = { t: ["bergamot", "lemon", "lavender"], h: ["jasmine"], b: ["vanilla", "musk", "cedar"] };
  assert.equal(smellsLikeText(headlineNotes(p)), "lemon + lavender + jasmine");
  assert.equal(wearLine(p), "Opens bright and zesty, then dries down sweet and cosy.");
  assert.equal(wearLine({ a: ["rose", "jasmine", "cedar"] }), "Mostly fresh flowers and wood.");
});

test("the ops monitor warns when notes go missing", async () => {
  const { judgeNotes } = await import("../scripts/ops-monitor");
  assert.equal(judgeNotes(null, 100).status, "warn");
  assert.equal(judgeNotes(30, 100).status, "ok");
  assert.equal(judgeNotes(2, 100).status, "warn");
});

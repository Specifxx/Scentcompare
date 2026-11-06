// "Smells like": a fragrance's notes, read from the note lists stores print in
// their own product descriptions ("Top notes: Bergamot, Lemon / Heart notes: …
// / Base notes: …"). Nothing is invented: a note is shown only when a store's
// own list names it, only notes in the vocabulary below are kept (so a stray
// word never becomes a "note"), and a product without a readable list shows no
// panel at all. When several stores describe the same barcode, a note must be
// named by at least two of them (consensus), so one store's copy-paste mistake
// cannot put the wrong notes on a bottle. DECISIONS.md 2026-11-06.

export type Family = "citrus" | "fruity" | "floral" | "green" | "fresh" | "spicy" | "sweet" | "woody" | "amber" | "smoky" | "musky";

export interface FamilyInfo {
  key: Family;
  name: string;
  /** the plain-words phrase in "smells like …" sentences */
  words: string;
  /** "opens bright and zesty" */
  adj: string;
  /** CSS colour token for its dot and bar */
  color: string;
}

export const FAMILIES: FamilyInfo[] = [
  { key: "citrus", name: "Citrus", words: "zesty citrus", adj: "bright and zesty", color: "#e8b923" },
  { key: "fruity", name: "Fruity", words: "juicy fruit", adj: "juicy", color: "#e0607e" },
  { key: "floral", name: "Floral", words: "fresh flowers", adj: "flowery", color: "#d77fc0" },
  { key: "green", name: "Green and herbal", words: "herbs and green leaves", adj: "green and herby", color: "#5fa86a" },
  { key: "fresh", name: "Fresh and aquatic", words: "sea air", adj: "fresh and airy", color: "#4fb3d9" },
  { key: "spicy", name: "Spicy", words: "warm spice", adj: "spicy", color: "#d0743c" },
  { key: "sweet", name: "Sweet and gourmand", words: "something sweet to eat", adj: "sweet and cosy", color: "#c98b5a" },
  { key: "woody", name: "Woody", words: "wood", adj: "woody", color: "#8a6a4b" },
  { key: "amber", name: "Amber and resin", words: "warm amber", adj: "warm and glowing", color: "#c2902c" },
  { key: "smoky", name: "Smoky and leather", words: "smoke and leather", adj: "smoky and dark", color: "#5b5560" },
  { key: "musky", name: "Musky and powdery", words: "clean skin", adj: "soft and skin-like", color: "#a99bb8" },
];
export const FAMILY_BY_KEY = Object.fromEntries(FAMILIES.map((f) => [f.key, f])) as Record<Family, FamilyInfo>;

export interface NoteInfo {
  /** URL slug, /notes/<slug> */
  key: string;
  /** how it is shown ("Orange blossom") */
  name: string;
  family: Family;
  /** How much the note stands out to a nose, 1–3: "lavender + vanilla" picks
   *  vivid notes over background ones (musk, amber, woods). */
  vivid: number;
  /** lower-case spellings stores use, accents removed; the name itself is always one */
  aka?: string[];
}

// [key, name, family, vivid, aka]
const N: [string, string, Family, number, string[]?][] = [
  // citrus
  ["bergamot", "Bergamot", "citrus", 2],
  ["lemon", "Lemon", "citrus", 3, ["lemon zest", "lemon peel", "amalfi lemon", "sicilian lemon"]],
  ["lime", "Lime", "citrus", 3],
  ["mandarin", "Mandarin", "citrus", 2, ["mandarin orange", "mandarine", "tangerine", "clementine"]],
  ["orange", "Orange", "citrus", 2, ["sweet orange", "blood orange", "orange zest", "orange peel"]],
  ["bitter-orange", "Bitter orange", "citrus", 2, ["bigarade"]],
  ["grapefruit", "Grapefruit", "citrus", 3, ["pink grapefruit", "pomelo"]],
  ["yuzu", "Yuzu", "citrus", 3],
  ["petitgrain", "Petitgrain", "citrus", 1],
  ["citrus", "Citrus", "citrus", 1, ["citron", "citruses", "citrus accord", "citrus notes", "citrus fruits", "hesperides"]],
  ["lemongrass", "Lemongrass", "green", 2],
  // fruity
  ["apple", "Apple", "fruity", 3, ["green apple", "red apple", "apple accord"]],
  ["pear", "Pear", "fruity", 3, ["nashi pear", "pear accord"]],
  ["peach", "Peach", "fruity", 3, ["white peach"]],
  ["apricot", "Apricot", "fruity", 3],
  ["plum", "Plum", "fruity", 2, ["prune", "black plum", "dried plum"]],
  ["cherry", "Cherry", "fruity", 3, ["black cherry", "sour cherry", "cherry liqueur"]],
  ["raspberry", "Raspberry", "fruity", 3],
  ["strawberry", "Strawberry", "fruity", 3],
  ["blackberry", "Blackberry", "fruity", 3],
  ["blackcurrant", "Blackcurrant", "fruity", 2, ["black currant", "cassis", "blackcurrant bud", "cassis bud", "black currant bud"]],
  ["red-berries", "Red berries", "fruity", 2, ["red fruits", "berries", "wild berries", "red berry", "forest fruits"]],
  ["pineapple", "Pineapple", "fruity", 3],
  ["mango", "Mango", "fruity", 3],
  ["passion-fruit", "Passion fruit", "fruity", 3, ["passionfruit", "passion flower fruit"]],
  ["coconut", "Coconut", "sweet", 3, ["coconut milk", "coconut water"]],
  ["fig", "Fig", "fruity", 2, ["fig leaf", "fig tree"]],
  ["lychee", "Lychee", "fruity", 3, ["litchi"]],
  ["melon", "Melon", "fruity", 3, ["watermelon"]],
  ["pomegranate", "Pomegranate", "fruity", 2],
  ["grape", "Grape", "fruity", 2],
  ["banana", "Banana", "fruity", 3],
  ["quince", "Quince", "fruity", 2],
  ["rhubarb", "Rhubarb", "fruity", 2],
  // floral
  ["rose", "Rose", "floral", 3, ["damask rose", "bulgarian rose", "turkish rose", "rose de mai", "may rose", "centifolia rose", "rose centifolia", "taif rose", "red rose", "pink rose", "rose absolute", "rose petals", "rose oil", "tea rose"]],
  ["jasmine", "Jasmine", "floral", 3, ["jasmine sambac", "sambac jasmine", "jasmin", "jasmine absolute", "grandiflorum jasmine"]],
  ["tuberose", "Tuberose", "floral", 3],
  ["orange-blossom", "Orange blossom", "floral", 3, ["neroli", "orange flower", "orange blossom absolute"]],
  ["ylang-ylang", "Ylang-ylang", "floral", 2, ["ylang ylang", "ylang"]],
  ["iris", "Iris", "musky", 2, ["orris", "orris root", "orris butter", "iris root", "iris pallida"]],
  ["violet", "Violet", "floral", 2, ["violet leaf", "violet leaves"]],
  ["peony", "Peony", "floral", 2],
  ["lily", "Lily", "floral", 2, ["white lily", "water lily"]],
  ["lily-of-the-valley", "Lily of the valley", "floral", 2, ["muguet"]],
  ["magnolia", "Magnolia", "floral", 2],
  ["gardenia", "Gardenia", "floral", 3],
  ["freesia", "Freesia", "floral", 2],
  ["lotus", "Lotus", "floral", 2],
  ["osmanthus", "Osmanthus", "floral", 2],
  ["honeysuckle", "Honeysuckle", "floral", 2],
  ["heliotrope", "Heliotrope", "musky", 2],
  ["geranium", "Geranium", "floral", 2],
  ["mimosa", "Mimosa", "floral", 2],
  ["frangipani", "Frangipani", "floral", 2, ["plumeria", "tiare", "tiare flower", "monoi"]],
  ["lilac", "Lilac", "floral", 2],
  ["carnation", "Carnation", "floral", 2],
  ["cherry-blossom", "Cherry blossom", "floral", 2, ["sakura"]],
  ["white-flowers", "White flowers", "floral", 1, ["white floral", "white florals", "floral notes", "flowers", "floral accord"]],
  ["orchid", "Orchid", "floral", 2, ["black orchid", "vanilla orchid"]],
  ["hibiscus", "Hibiscus", "floral", 2],
  ["narcissus", "Narcissus", "floral", 2, ["jonquil", "daffodil"]],
  ["lavender", "Lavender", "green", 3, ["lavandin", "french lavender", "lavender absolute"]],
  // green / aromatic
  ["mint", "Mint", "green", 3, ["peppermint", "spearmint", "mint leaves"]],
  ["basil", "Basil", "green", 2],
  ["sage", "Sage", "green", 2, ["clary sage"]],
  ["rosemary", "Rosemary", "green", 2],
  ["thyme", "Thyme", "green", 2],
  ["tea", "Tea", "green", 2, ["green tea", "black tea", "white tea", "matcha", "earl grey"]],
  ["green-leaves", "Green leaves", "green", 1, ["green notes", "leaves", "green accord", "galbanum", "grass", "cut grass", "ivy"]],
  ["artemisia", "Artemisia", "green", 1, ["wormwood", "absinthe", "davana"]],
  ["juniper", "Juniper", "green", 2, ["juniper berries", "juniper berry", "gin"]],
  ["eucalyptus", "Eucalyptus", "green", 2],
  ["tomato-leaf", "Tomato leaf", "green", 2],
  ["bamboo", "Bamboo", "green", 1],
  // fresh
  ["sea-notes", "Sea notes", "fresh", 2, ["marine notes", "marine accord", "sea salt", "salt", "sea water", "seawater", "aquatic notes", "water notes", "ozonic notes", "sea breeze", "algae", "seaweed", "sea accord", "aquatic accord"]],
  ["calone", "Calone", "fresh", 1],
  ["aldehydes", "Aldehydes", "fresh", 1, ["aldehyde"]],
  ["cucumber", "Cucumber", "fresh", 2],
  ["ginger", "Ginger", "spicy", 2],
  // spicy
  ["pink-pepper", "Pink pepper", "spicy", 2, ["pink peppercorn", "pink peppercorns"]],
  ["black-pepper", "Black pepper", "spicy", 2, ["pepper", "sichuan pepper", "szechuan pepper", "timur pepper"]],
  ["cardamom", "Cardamom", "spicy", 2, ["cardamon"]],
  ["cinnamon", "Cinnamon", "spicy", 3, ["cinnamon bark"]],
  ["saffron", "Saffron", "spicy", 3],
  ["nutmeg", "Nutmeg", "spicy", 2],
  ["clove", "Clove", "spicy", 2, ["cloves", "clove bud"]],
  ["cumin", "Cumin", "spicy", 2],
  ["coriander", "Coriander", "spicy", 1],
  ["star-anise", "Anise", "spicy", 2, ["star anise", "aniseed", "anise", "licorice", "liquorice"]],
  ["elemi", "Elemi", "spicy", 1],
  // sweet / gourmand
  ["vanilla", "Vanilla", "sweet", 3, ["madagascar vanilla", "bourbon vanilla", "vanilla bean", "vanilla absolute", "vanille", "vanilla pod", "vanillin"]],
  ["tonka-bean", "Tonka bean", "sweet", 2, ["tonka", "tonka beans", "coumarin"]],
  ["caramel", "Caramel", "sweet", 3, ["salted caramel", "toffee", "butterscotch", "dulce de leche"]],
  ["chocolate", "Chocolate", "sweet", 3, ["cocoa", "cacao", "dark chocolate", "cacao pod"]],
  ["coffee", "Coffee", "sweet", 3, ["espresso"]],
  ["honey", "Honey", "sweet", 2],
  ["praline", "Praline", "sweet", 3, ["hazelnut", "almond", "pistachio", "nuts", "chestnut", "marzipan", "nougat", "peanut"]],
  ["sugar", "Sugar", "sweet", 2, ["brown sugar", "candy", "cotton candy", "candyfloss", "marshmallow", "meringue"]],
  ["rum", "Rum", "sweet", 2, ["cognac", "whiskey", "whisky", "liqueur", "brandy", "champagne", "wine"]],
  ["milk", "Milk", "sweet", 2, ["milky notes", "cream", "rice", "steamed milk"]],
  // woody
  ["sandalwood", "Sandalwood", "woody", 2, ["australian sandalwood", "mysore sandalwood", "sandal"]],
  ["cedar", "Cedar", "woody", 2, ["cedarwood", "atlas cedar", "virginia cedar", "virginian cedar", "texas cedar", "cedar wood"]],
  ["vetiver", "Vetiver", "woody", 2, ["haitian vetiver", "java vetiver"]],
  ["patchouli", "Patchouli", "woody", 2, ["patchouly", "patchouli leaf", "patchouli oil"]],
  ["oud", "Oud", "smoky", 3, ["agarwood", "oudh", "oud wood", "oudwood", "aoud"]],
  ["guaiac-wood", "Guaiac wood", "woody", 1, ["guaiac", "gaiac wood", "gaiac"]],
  ["cashmere-wood", "Cashmere wood", "woody", 1, ["cashmeran", "cashmere woods"]],
  ["ambroxan", "Ambroxan", "amber", 1, ["ambrox", "ambroxide", "ambrofix", "ambrettolide"]],
  ["iso-e-super", "Iso E Super", "woody", 1],
  ["woods", "Woods", "woody", 1, ["woody notes", "woody accord", "wood", "soft woods", "dry woods", "precious woods", "driftwood", "blond woods", "white woods", "akigalawood", "papyrus", "cypress", "pine", "fir", "birch", "mahogany", "ebony", "rosewood", "teak", "oak", "oakwood", "cypriol", "nagarmotha"]],
  ["oakmoss", "Oakmoss", "woody", 1, ["moss", "oak moss", "tree moss"]],
  // amber / resins
  ["amber", "Amber", "amber", 1, ["amber accord", "ambergris", "grey amber", "gray amber", "ambery notes"]],
  ["benzoin", "Benzoin", "amber", 1],
  ["labdanum", "Labdanum", "amber", 1, ["cistus", "rockrose"]],
  ["myrrh", "Myrrh", "amber", 2, ["opoponax"]],
  ["tolu-balsam", "Balsam", "amber", 1, ["tolu balsam", "peru balsam", "balsamic notes", "styrax"]],
  ["incense", "Incense", "smoky", 2, ["frankincense", "olibanum"]],
  // smoky / leather
  ["leather", "Leather", "smoky", 3, ["suede", "leather accord", "suede accord"]],
  ["tobacco", "Tobacco", "smoky", 3, ["tobacco leaf", "tobacco leaves", "tabac", "pipe tobacco"]],
  ["smoke", "Smoke", "smoky", 2, ["birch tar", "smoky notes", "cade", "burnt wood", "guaiac smoke"]],
  ["castoreum", "Castoreum", "smoky", 1],
  // musky / powdery
  ["musk", "Musk", "musky", 1, ["musks", "white musk", "white musks", "musky notes", "skin musk", "clean musk", "ambrette", "musk accord"]],
  ["powder", "Powdery notes", "musky", 1, ["powdery notes", "powder", "powdery accord"]],
  ["cotton", "Clean cotton", "fresh", 2, ["cotton flower", "cotton", "clean linen", "laundry"]],
];

const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const NOTES: NoteInfo[] = N.map(([key, name, family, vivid, aka]) => ({ key, name, family, vivid, aka }));
export const NOTE_BY_KEY = new Map(NOTES.map((n) => [n.key, n]));

/** Every spelling → its note, longest first (so "orange blossom" wins over "orange"). */
const SPELLINGS: [RegExp, string][] = (() => {
  const all: [string, string][] = [];
  for (const n of NOTES) for (const s of new Set([strip(n.name), ...(n.aka ?? [])])) all.push([s, n.key]);
  all.sort((a, b) => b[0].length - a[0].length);
  return all.map(([s, k]) => [new RegExp(`(?:^|[^a-z])${s.replace(/[-\s]+/g, "[-\\s]+")}(?:$|[^a-z])`), k]);
})();

/** One list item ("Calabrian bergamot", "Raspberry and Peach accord") → its notes. */
export function notesInItem(item: string): string[] {
  let s = ` ${strip(item).replace(/[*_]/g, " ")} `;
  if (s.trim().length > 45) return []; // a sentence, not a list item
  const out: string[] = [];
  for (const [re, key] of SPELLINGS) {
    const m = re.exec(s);
    if (!m) continue;
    if (!out.includes(key)) out.push(key);
    s = s.slice(0, m.index) + " ".repeat(m[0].length) + s.slice(m.index + m[0].length); // used up
  }
  return out;
}

export interface Pyramid {
  /** top (opening) */
  t?: string[];
  /** heart */
  h?: string[];
  /** base (dry-down) */
  b?: string[];
  /** notes listed without layers */
  a?: string[];
}

/** HTML or text → plain lines. */
export function plainText(html: string): string {
  return String(html ?? "")
    .replace(/<(br|\/p|\/li|\/div|\/h\d|li|p|tr|\/tr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;| /g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;|&#8217;/g, "'")
    .replace(/&[a-z]+;|&#\d+;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

const LAYER = {
  t: "top|head",
  h: "heart|middle|mid",
  b: "base|bottom|dry[\\s-]?down",
} as const;
type Layer = keyof typeof LAYER;
const ANY = "top|head|heart|middle|mid|base|bottom|dry[\\s-]?down";
/** Only a label a store wrote as a label: "Top notes:", "Heart note is", "Base notes are"
 *  (Fragrantica's wording, which many stores copy), "Middle/Heart Notes:", or a bare
 *  "TOP :" at the start of a line. Prose ("the opening is invigorating") never counts. */
const LABEL = (alts: string) =>
  new RegExp(
    `(?:(?:^|[^a-z])(?:${alts})(?:\\s*\\/\\s*(?:${ANY}))?\\s+(?:notes?|accords?)\\s*(?:\\*\\*)?\\s*(?::|\\bare\\b|\\bis\\b)|(?:^|\\n)\\s*[-•*]?\\s*(?:\\*\\*)?(?:${alts})(?:\\s*\\/\\s*(?:${ANY}))?\\s*(?:\\*\\*)?\\s*:)`,
    "gi",
  );

/** The text after a label, up to the next label or the end of its line or sentence;
 *  a label alone on its line takes the bullet lines under it. */
function after(text: string, from: number): string {
  const rest = text.slice(from);
  const nl = rest.indexOf("\n");
  const line = (nl < 0 ? rest : rest.slice(0, nl)).replace(/^[\s*:]+/, "");
  if (line.trim()) {
    const cut = line.search(/;|\.(?:\s|$)|\b(?:top|head|heart|middle|base)\s+notes?\b/i);
    return cut < 0 ? line : line.slice(0, cut);
  }
  const items: string[] = [];
  for (const l of rest.slice(nl + 1).split("\n").slice(0, 14)) {
    const t = l.trim();
    if (!/^[-•*·]\s*\S/.test(t) || t.includes(":")) break;
    items.push(t.replace(/^[-•*·]\s*/, ""));
  }
  return items.join(", ");
}

const split = (s: string) => s.split(/,|;|·|•|\||\/|\s\+\s|\band\b|&|\s[-–]\s|\n/i);
const itemsOf = (s: string) => [...new Set(split(s).flatMap(notesInItem))];

/** A store description → its notes, or null when it carries no readable note list. */
export function readNotes(html: string): Pyramid | null {
  const text = plainText(html);
  if (!/notes?|accords?|top\s*:|base\s*:|heart\s*:/i.test(text)) return null;
  const out: Pyramid = {};
  for (const layer of Object.keys(LAYER) as Layer[]) {
    const hits = [...text.matchAll(LABEL(LAYER[layer]))];
    // Two "Top notes" lists: a set of several fragrances, or two products in one page. Not guessable.
    const lists = hits.map((m) => itemsOf(after(text, m.index! + m[0].length))).filter((l) => l.length);
    if (lists.length > 1) return null;
    if (lists[0]) out[layer] = lists[0];
  }
  const layered = (out.t?.length ?? 0) + (out.h?.length ?? 0) + (out.b?.length ?? 0);
  if (layered && !(out.t?.length && out.b?.length) && !(out.h?.length && out.b?.length) && !(out.t?.length && out.h?.length)) return layered >= 2 ? flatten(out) : null;
  if (!layered) {
    const flat = [...text.matchAll(/(?:^|\n|\.\s)\s*(?:key |main |fragrance |olfactory |olfactive |scent |perfume )?notes?\s*(?:include|\*\*)?\s*:/gi)];
    const lists = flat.map((m) => itemsOf(after(text, m.index! + m[0].length))).filter((l) => l.length >= 2);
    if (lists.length !== 1) return null;
    return lists[0].length <= 24 ? { a: lists[0] } : null;
  }
  return layered <= 30 ? out : null;
}

const flatten = (p: Pyramid): Pyramid => ({ a: [...new Set([...(p.t ?? []), ...(p.h ?? []), ...(p.b ?? [])])] });

/** Every note in a pyramid, top to base, once. */
export function allNotes(p: Pyramid): string[] {
  return [...new Set([...(p.t ?? []), ...(p.h ?? []), ...(p.b ?? []), ...(p.a ?? [])])];
}

/** Several stores' readings of one barcode → the one we show. One store: its own
 *  list. Two or more: the notes at least two of them name, in the layer most of
 *  them put it in; a reading that agrees with nobody is left out. null when
 *  fewer than two notes are agreed on. */
export function consensus(readings: Pyramid[]): (Pyramid & { n: number }) | null {
  if (!readings.length) return null;
  if (readings.length === 1) return allNotes(readings[0]).length >= 2 ? { ...readings[0], n: 1 } : null;
  const count = new Map<string, number>();
  const layerVotes = new Map<string, Record<string, number>>();
  for (const r of readings) {
    for (const k of allNotes(r)) count.set(k, (count.get(k) ?? 0) + 1);
    for (const l of ["t", "h", "b"] as const) for (const k of r[l] ?? []) {
      const v = layerVotes.get(k) ?? {};
      v[l] = (v[l] ?? 0) + 1;
      layerVotes.set(k, v);
    }
  }
  const agreed = [...count].filter(([, c]) => c >= 2).map(([k]) => k);
  if (agreed.length < 2) return null;
  const agreeing = readings.filter((r) => allNotes(r).filter((k) => agreed.includes(k)).length >= 2).length;
  const out: Pyramid = {};
  const loose: string[] = [];
  // Keep the order the first agreeing store wrote them in.
  const order = readings.flatMap(allNotes).filter((k, i, a) => a.indexOf(k) === i && agreed.includes(k));
  for (const k of order) {
    const v = layerVotes.get(k);
    const best = v ? (Object.entries(v).sort((a, b) => b[1] - a[1])[0][0] as "t" | "h" | "b") : null;
    if (best) (out[best] ??= []).push(k);
    else loose.push(k);
  }
  const layers = (["t", "h", "b"] as const).filter((l) => out[l]?.length).length;
  if (layers < 2) return { a: order, n: agreeing };
  if (loose.length) (out.h ??= []).push(...loose);
  return { ...out, n: agreeing };
}

/** The headline: two or three notes a nose would pick out, in the order they appear. */
export function headlineNotes(p: Pyramid, max = 3): NoteInfo[] {
  const list = allNotes(p).map((k, i) => ({ n: NOTE_BY_KEY.get(k)!, i })).filter((x) => x.n);
  // The most vivid first; a family appears once so "lemon + lime" doesn't crowd out the rest.
  const picked: typeof list = [];
  const fams = new Set<Family>();
  for (const x of [...list].sort((a, b) => b.n.vivid - a.n.vivid || a.i - b.i)) {
    if (picked.length >= max) break;
    if (fams.has(x.n.family)) continue;
    picked.push(x);
    fams.add(x.n.family);
  }
  return picked.sort((a, b) => a.i - b.i).map((x) => x.n);
}

/** How much of each family the notes are, biggest first (a share of 0–1). */
export function familyMix(p: Pyramid): { family: FamilyInfo; share: number }[] {
  const notes = allNotes(p).map((k) => NOTE_BY_KEY.get(k)).filter(Boolean) as NoteInfo[];
  if (!notes.length) return [];
  const w = new Map<Family, number>();
  for (const n of notes) w.set(n.family, (w.get(n.family) ?? 0) + 1);
  return [...w].sort((a, b) => b[1] - a[1]).map(([f, c]) => ({ family: FAMILY_BY_KEY[f], share: c / notes.length }));
}

const mainFamily = (keys: string[] | undefined): FamilyInfo | null => {
  if (!keys?.length) return null;
  const w = new Map<Family, number>();
  keys.forEach((k, i) => {
    const n = NOTE_BY_KEY.get(k);
    if (n) w.set(n.family, (w.get(n.family) ?? 0) + n.vivid + (keys.length - i) * 0.01);
  });
  const best = [...w].sort((a, b) => b[1] - a[1])[0];
  return best ? FAMILY_BY_KEY[best[0]] : null;
};

/** One plain sentence about how it wears, from the layers the stores list:
 *  "Opens bright and zesty, then dries down woody." */
export function wearLine(p: Pyramid): string | null {
  const top = mainFamily(p.t);
  const base = mainFamily(p.b);
  if (top && base) return top.key === base.key ? `${top.adj[0].toUpperCase()}${top.adj.slice(1)} from the first spray to the dry-down.` : `Opens ${top.adj}, then dries down ${base.adj}.`;
  const mix = familyMix(p);
  if (!mix.length) return null;
  const words = mix.slice(0, 2).map((m) => m.family.words);
  return `Mostly ${words.join(" and ")}.`;
}

/** "lavender + vanilla + cedar" */
export const smellsLikeText = (notes: NoteInfo[]) => notes.map((n) => n.name.toLowerCase()).join(" + ");

/** The notes file (data/public/notes.json): barcode → its pyramid and how many stores agree. */
export type NotesFile = Record<string, Pyramid & { n: number }>;

/** The importer's step: every store's reading of each barcode (one per store) →
 *  the notes file. A barcode with no reading today keeps yesterday's entry, so a
 *  store that fails one run does not blank a panel. Only barcodes still on the
 *  site are kept. */
export function buildNotes(listings: { store: string; ean: string; notes?: Pyramid }[], eans: string[], prev: NotesFile): NotesFile {
  const by = new Map<string, Map<string, Pyramid>>();
  for (const l of listings) {
    if (!l.notes) continue;
    const m = by.get(l.ean) ?? new Map<string, Pyramid>();
    if (!m.has(l.store)) m.set(l.store, l.notes);
    by.set(l.ean, m);
  }
  const out: NotesFile = {};
  for (const ean of [...eans].sort()) {
    const readings = by.get(ean);
    const c = readings ? consensus([...readings.values()]) : null;
    if (c) out[ean] = c;
    else if (!readings && prev[ean]) out[ean] = prev[ean];
  }
  return out;
}

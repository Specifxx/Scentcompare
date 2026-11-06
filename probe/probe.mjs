// Fragrance store probe (research only; never touches data/ or main).
// For each candidate host: is it Shopify, what currency, how many products,
// how many are fragrances (perfume, cologne, EDP/EDT…), how many valid EAN-13
// barcodes (any prefix: perfume is bottled in France, Spain, the US, Italy…)
// in variant SKUs, and, from a capped sample of single-product reads, how many
// carry variants[].barcode. Writes out-<shard>.json. ~1 request/second.
import fs from "node:fs";

const SHARD = Number(process.env.SHARD ?? 0);
const SHARDS = Number(process.env.SHARDS ?? 1);
const PAGES = 8; // up to 2,000 products
const LOOKUPS = 40;
const UA = "Mozilla/5.0 (compatible; CompareEmpireProbe/1.0; +https://compareempire.com)";
const FRAG = /\b(eau de parfum|eau de toilette|eau de cologne|parfum|perfume|cologne|fragrance|extrait|edp|edt|edc|body mist|aftershave|after shave)\b/i;
const DECANT = /\b(decant|sample|samples|tester|travel spray|atomi[sz]er|\d+\s?ml\s*(decant|sample)|discovery set)\b/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, redirect: "follow", signal: AbortSignal.timeout(25_000) });
      if (res.status === 429) { await sleep(10_000 * (i + 1)); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      await sleep(900);
      return { url: res.url, json: JSON.parse(text) };
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(3000);
    }
  }
  throw new Error("429");
}
const ean = (s) => {
  let d = String(s ?? "").replace(/\D/g, "");
  if (/^\d{12}$/.test(d)) d = `0${d}`;
  if (!/^\d{13}$/.test(d)) return null;
  const sum = [...d.slice(0, 12)].reduce((a, c, i) => a + Number(c) * (i % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === Number(d[12]) ? d : null;
};

// A round file (candidates-round.txt), when present, is probed alone; its hosts join candidates.txt after.
const ROUND = new URL("./candidates-round.txt", import.meta.url);
const hosts = [...new Set(fs.readFileSync(fs.existsSync(ROUND) ? ROUND : new URL("./candidates.txt", import.meta.url), "utf8").split("\n")
  .map((l) => l.replace(/#.*/, "").trim().toLowerCase()).filter(Boolean))].filter((_, i) => i % SHARDS === SHARD);

async function probe(host) {
  const r = { host };
  let base;
  try {
    const first = await get(`https://${host}/products.json?limit=250&page=1`, 2);
    if (!Array.isArray(first.json.products)) return { ...r, shopify: false };
    base = new URL(first.url).origin;
    r.shopify = true;
    r.base = base;
    try { const m = await get(`${base}/meta.json`, 1); r.name = m.json.name; r.currency = m.json.currency; r.country = m.json.country; } catch {}
    const products = [...first.json.products];
    for (let p = 2; p <= PAGES && products.length === (p - 1) * 250; p++) {
      const d = await get(`${base}/products.json?limit=250&page=${p}`);
      products.push(...d.json.products);
    }
    r.products = products.length;
    const isFrag = (p) => FRAG.test(`${p.title} ${p.product_type ?? ""} ${Array.isArray(p.tags) ? p.tags.join(" ") : p.tags ?? ""}`) && !DECANT.test(p.title);
    const fr = products.filter(isFrag);
    r.fragrance = fr.length;
    r.decants = products.filter((p) => DECANT.test(p.title)).length;
    const codes = new Set();
    let skuEan = 0;
    for (const p of fr) for (const v of p.variants ?? []) {
      const c = ean(v.sku);
      if (c) { skuEan++; codes.add(c); }
    }
    r.skuEan = skuEan;
    // Single-product sample: fragrances whose SKU had no EAN, best-known houses first so shops' samples overlap.
    const TOP = /\b(dior|chanel|ysl|yves saint laurent|armani|versace|paco rabanne|rabanne|jean paul gaultier|creed|tom ford|gucci|prada|valentino|carolina herrera|lancome|lancôme|mugler|givenchy|hermes|hermès|burberry|dolce|calvin klein|montblanc|viktor|azzaro|narciso|marc jacobs|hugo boss|lattafa|armaf|maison margiela|jo malone|kayali|ariana grande|billie eilish)\b/i;
    const ranked = [...fr.filter((p) => TOP.test(`${p.vendor} ${p.title}`)), ...fr.filter((p) => !TOP.test(`${p.vendor} ${p.title}`))];
    const sample = ranked.filter((p) => !(p.variants ?? []).some((v) => ean(v.sku))).slice(0, LOOKUPS);
    let looked = 0, withBarcode = 0;
    for (const p of sample) {
      try {
        const d = await get(`${base}/products/${p.handle}.json`, 2);
        looked++;
        let any = false;
        for (const v of d.json.product?.variants ?? []) {
          const c = ean(v.barcode);
          if (c) { any = true; codes.add(c); }
        }
        if (any) withBarcode++;
      } catch { /* skip */ }
    }
    r.sampleLooked = looked;
    r.sampleWithBarcode = withBarcode;
    r.codes = [...codes];
    return r;
  } catch (e) {
    return { ...r, shopify: base ? true : null, error: String(e.message ?? e) };
  }
}

const out = [];
for (const h of hosts) {
  const t = Date.now();
  const res = await probe(h).catch((e) => ({ host: h, error: String(e) }));
  out.push(res);
  const { codes, ...log } = res;
  console.log(JSON.stringify(log), `${Math.round((Date.now() - t) / 1000)}s`);
  fs.writeFileSync(new URL(`./out-${SHARD}.json`, import.meta.url), JSON.stringify(out));
}

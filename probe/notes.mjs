// Notes probe (research only; never touches data/ or main). For every store in
// src/content/stores.ts, reads up to 4 pages of products.json and keeps the
// plain text of each description that talks about notes or accords, so the
// "smells like" parser can be written and measured against real store copy.
// Writes notes-<shard>.json. ~1 request/second.
import fs from "node:fs";
const SHARD = Number(process.env.SHARD ?? 0);
const SHARDS = Number(process.env.SHARDS ?? 1);
const UA = "Mozilla/5.0 (compatible; CompareEmpireProbe/1.0; +https://compareempire.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const src = fs.readFileSync(new URL("../src/content/stores.ts", import.meta.url), "utf8");
const stores = [...src.matchAll(/\{ id: "([^"]+)",[^}]*?base: "([^"]+)"/g)].map((m) => ({ id: m[1], base: m[2] })).filter((_, i) => i % SHARDS === SHARD);
const text = (h) => String(h ?? "").replace(/<(br|\/p|\/li|\/div|\/h\d|li|p)[^>]*>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
const out = [];
const stat = {};
for (const s of stores) {
  let n = 0, kept = 0;
  try {
    for (let page = 1; page <= 4; page++) {
      const res = await fetch(`${s.base}/products.json?limit=250&page=${page}`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      for (const p of d.products) {
        n++;
        const t = text(p.body_html);
        if (!/\bnotes?\b|accords?\b|pyramid/i.test(t)) continue;
        kept++;
        out.push({ s: s.id, id: p.id, t: p.title, v: p.vendor, k: p.product_type, sku: p.variants.map((v) => v.sku).filter(Boolean).slice(0, 6), txt: t.slice(0, 2500) });
      }
      await sleep(1000);
      if (d.products.length < 250) break;
    }
  } catch (e) { stat[s.id] = { err: String(e.message) }; continue; }
  stat[s.id] = { n, kept };
  console.log(s.id, n, kept);
}
fs.writeFileSync(`probe/notes-${SHARD}.json`, JSON.stringify({ stat, out }));

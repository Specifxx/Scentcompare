// Fragrance store probe, round 4: the stores the Shopify probe could not read
// (research only; never touches data/ or main). For each host in
// page-candidates.txt: does the home page answer or is it walled (403, 429,
// a challenge page)? What platform? Does robots.txt let us read product pages?
// Is the WooCommerce Store API open (prices, currency, EANs in SKUs)? And from
// the sitemap, a sample of product pages: how many carry a schema.org Product
// with a valid GTIN/EAN, a price and its currency. ~1 request a second.
import fs from "node:fs";

const SHARD = Number(process.env.SHARD ?? 0);
const SHARDS = Number(process.env.SHARDS ?? 1);
const SAMPLE = 8;
// The importer's own browser-like UA: what the reader would see.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const FRAG = /(parfum|perfume|cologne|toilette|fragrance|profumo|perfume|edp|edt|extrait|duft)/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8") {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: accept, "Accept-Language": "en" }, redirect: "follow", signal: AbortSignal.timeout(25_000) });
  const text = await res.text().catch(() => "");
  await sleep(1000);
  return { status: res.status, url: res.url, text, headers: res.headers };
}
const ean = (s) => {
  let d = String(s ?? "").replace(/\D/g, "");
  if (/^\d{12}$/.test(d)) d = `0${d}`;
  if (/^\d{14}$/.test(d) && d.startsWith("0")) d = d.slice(1);
  if (!/^\d{13}$/.test(d)) return null;
  const sum = [...d.slice(0, 12)].reduce((a, c, i) => a + Number(c) * (i % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === Number(d[12]) ? d : null;
};
// A challenge page, not any page that loads reCAPTCHA for its newsletter form.
const WALL = /<title>[^<]*(just a moment|attention required|access denied|pardon our interruption|security check|are you a (?:robot|human)|request unsuccessful)[^<]*<\/title>|cf-chl-|challenge-platform\/h\/|px-captcha|captcha-delivery\.com|_Incapsula_Resource|geo\.captcha-delivery/i;
const walled = (r) => r.status === 403 || r.status === 429 || r.status === 503 ||
  WALL.test(r.text.slice(0, 30000));

function platform(html) {
  if (/cdn\.shopify\.com|Shopify\.theme/.test(html)) return "shopify";
  if (/woocommerce|wp-content\/plugins\/woocommerce/i.test(html)) return "woocommerce";
  if (/Magento|mage\/cookies|static\/version\d+\/frontend/i.test(html)) return "magento";
  if (/cdn11\.bigcommerce\.com|bigcommerce/i.test(html)) return "bigcommerce";
  if (/demandware|\/on\/demandware\.store|dwanalytics/i.test(html)) return "sfcc";
  if (/shopware/i.test(html)) return "shopware";
  if (/prestashop/i.test(html)) return "prestashop";
  if (/wix\.com|wixstatic/i.test(html)) return "wix";
  if (/squarespace/i.test(html)) return "squarespace";
  if (/__NEXT_DATA__/.test(html)) return "nextjs";
  return "other";
}

/** robots.txt rules for User-agent: * (allow/disallow prefixes) and its sitemaps. */
function robots(text) {
  const out = { disallow: [], allow: [], sitemaps: [] };
  let mine = false, any = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
    if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === "sitemap") out.sitemaps.push(v);
    else if (k === "user-agent") { if (any) { mine = false; any = false; } mine = mine || v === "*"; }
    else if (k === "disallow" || k === "allow") { any = true; if (mine && v) out[k].push(v); }
  }
  return out;
}
const rx = (rule) => new RegExp(`^${rule.replace(/\$$/, "").split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}${rule.endsWith("$") ? "$" : ""}`);
function allowed(rules, path) {
  let best = { len: -1, ok: true };
  for (const p of rules.disallow) if (rx(p).test(path) && p.length > best.len) best = { len: p.length, ok: false };
  for (const p of rules.allow) if (rx(p).test(path) && p.length >= best.len) best = { len: p.length, ok: true };
  return best.ok;
}

const locs = (xml) => [...xml.matchAll(/<loc>\s*(?:<!\[CDATA\[)?([^<\]]+?)(?:\]\]>)?\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));

async function sitemapUrls(base, rules) {
  const tried = new Set();
  let queue = rules.sitemaps.length ? rules.sitemaps.slice(0, 6) : [`${base}/sitemap.xml`, `${base}/sitemap_index.xml`];
  const pages = [];
  let fetched = 0;
  while (queue.length && fetched < 8 && pages.length < 60000) {
    const u = queue.shift();
    if (tried.has(u)) continue;
    tried.add(u);
    try {
      const r = await get(u, "application/xml,text/xml,*/*");
      fetched++;
      if (r.status !== 200 || /\.gz$/.test(u)) continue;
      const ls = locs(r.text);
      if (/<sitemapindex/i.test(r.text)) {
        const kids = ls.sort((a, b) => Number(/product/i.test(b)) - Number(/product/i.test(a)));
        queue = [...kids.filter((k) => /product|prod|item|catalog/i.test(k)).slice(0, 4), ...kids.slice(0, 2), ...queue];
      } else pages.push(...ls);
    } catch { /* next */ }
  }
  return pages;
}

function products(html) {
  const out = [];
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let j;
    try { j = JSON.parse(m[1].trim()); } catch { continue; }
    const walk = (x) => {
      if (!x || typeof x !== "object") return;
      if (Array.isArray(x)) return x.forEach(walk);
      const t = [].concat(x["@type"] ?? []).join(" ");
      if (/Product/.test(t)) out.push(x);
      if (x["@graph"]) walk(x["@graph"]);
      if (x.hasVariant) walk(x.hasVariant);
    };
    walk(j);
  }
  return out;
}
function readProduct(p) {
  const code = ean(p.gtin13) ?? ean(p.gtin) ?? ean(p.gtin12) ?? ean(p.gtin14) ?? ean(p.ean) ?? ean(p.sku) ?? ean(p.mpn);
  const offers = [].concat(p.offers ?? []).flatMap((o) => (o?.offers ? [].concat(o.offers) : [o]));
  const o = offers.find((x) => x && (x.price ?? x.lowPrice) != null);
  const ocode = offers.map((x) => ean(x?.gtin13) ?? ean(x?.gtin) ?? ean(x?.sku)).find(Boolean);
  return { code: code ?? ocode ?? null, price: o ? Number(o.price ?? o.lowPrice) : null, currency: o?.priceCurrency ?? null, avail: o?.availability ?? null, name: p.name };
}

const hosts = [...new Set(fs.readFileSync(new URL("./page-candidates.txt", import.meta.url), "utf8").split("\n")
  .map((l) => l.replace(/#.*/, "").trim().toLowerCase()).filter(Boolean))].filter((_, i) => i % SHARDS === SHARD);

async function probe(host) {
  const r = { host };
  const home = await get(`https://${host}/`);
  r.status = home.status;
  r.base = new URL(home.url).origin;
  r.walled = walled(home);
  r.platform = platform(home.text);
  r.lang = /<html[^>]*lang="([^"]+)"/i.exec(home.text)?.[1];
  if (r.walled) return r;
  if (home.status >= 400) return r;
  // Shopify after all (a store the first probe missed through a redirect)?
  try {
    const p = await get(`${r.base}/products.json?limit=5`, "application/json");
    if (p.status === 200 && p.text.startsWith("{\"products\"")) r.shopifyJson = true;
  } catch {}
  let rules = { disallow: [], allow: [], sitemaps: [] };
  try { const rb = await get(`${r.base}/robots.txt`, "text/plain"); if (rb.status === 200) rules = robots(rb.text); } catch {}
  r.robotsAll = !allowed(rules, "/");
  // WooCommerce Store API.
  if (r.platform === "woocommerce" || r.platform === "other") {
    try {
      const w = await get(`${r.base}/wp-json/wc/store/v1/products?per_page=100`, "application/json");
      if (w.status === 200 && w.text.startsWith("[")) {
        const list = JSON.parse(w.text);
        r.woo = {
          total: Number(w.headers.get("x-wp-total") ?? list.length),
          currency: list[0]?.prices?.currency_code,
          skuEan: list.filter((p) => ean(p.sku)).length,
          frag: list.filter((p) => FRAG.test(`${p.name} ${(p.categories ?? []).map((c) => c.name).join(" ")}`)).length,
          robotsOk: allowed(rules, "/wp-json/"),
        };
      } else r.woo = { status: w.status };
    } catch (e) { r.woo = { error: String(e.message ?? e) }; }
  }
  // Sitemap → a sample of product pages.
  const urls = await sitemapUrls(r.base, rules);
  r.sitemapUrls = urls.length;
  const frag = urls.filter((u) => FRAG.test(u) && allowed(rules, new URL(u, r.base).pathname));
  r.sitemapFrag = frag.length;
  const sample = (frag.length ? frag : urls).filter((u, i, a) => i % Math.max(1, Math.floor(a.length / SAMPLE)) === 0).slice(0, SAMPLE);
  const s = { looked: 0, ok: 0, walled: 0, product: 0, code: 0, priced: 0, currency: {}, names: [] };
  for (const u of sample) {
    try {
      const pg = await get(u);
      s.looked++;
      if (walled(pg)) { s.walled++; if (s.walled >= 2) break; continue; }
      if (pg.status !== 200) continue;
      s.ok++;
      const ps = products(pg.text).map(readProduct);
      // Barcodes outside JSON-LD (microdata, a data layer): worth knowing, not yet read.
      if (/itemprop=["']gtin(13|8|12|14)?["']|"gtin13"\s*:|"ean"\s*:\s*"?\d{12,13}/i.test(pg.text)) s.rawGtin = (s.rawGtin ?? 0) + 1;
      if (!ps.length) continue;
      s.product++;
      if (ps.some((p) => p.code)) s.code++;
      const pr = ps.find((p) => p.price);
      if (pr) { s.priced++; s.currency[pr.currency ?? "?"] = (s.currency[pr.currency ?? "?"] ?? 0) + 1; }
      if (s.names.length < 3) s.names.push(`${ps[0].name ?? ""} | ${ps[0].code ?? "-"} | ${pr?.price ?? "-"} ${pr?.currency ?? ""}`.slice(0, 120));
    } catch { /* next */ }
  }
  r.sample = s;
  return r;
}

const out = [];
for (const h of hosts) {
  const t = Date.now();
  const res = await probe(h).catch((e) => ({ host: h, error: String(e.message ?? e) }));
  out.push(res);
  console.log(JSON.stringify(res), `${Math.round((Date.now() - t) / 1000)}s`);
  fs.writeFileSync(new URL(`./pages-out-${SHARD}.json`, import.meta.url), JSON.stringify(out));
}

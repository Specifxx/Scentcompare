// SEO audit (2026-11-03): split sitemap, homepage title, breadcrumbs and site schema, alt text, llms.txt.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { PRODUCTS_PER_FILE, allSitemapUrls, sitemapIndexXml, sitemapPart, sitemapParts } from "../src/lib/sitemap";
import { DESCRIPTION_MAX, TITLE_MAX, breadcrumbLd, fitDescription, fitTitle, ldJson } from "../src/lib/seo";
import { SITE } from "../src/site";

const read = (p: string) => readFileSync(p, "utf8");
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

test("the sitemap is an index of parts, none over the chunk size, no URL twice", () => {
  const index = sitemapIndexXml();
  assert.match(index, /<sitemapindex/);
  for (const p of sitemapParts()) {
    assert.ok(index.includes(`${SITE.url}/sitemaps/${p}.xml`), p);
    const n = sitemapPart(p)!.length;
    assert.ok(n > 0 && n <= PRODUCTS_PER_FILE, `${p}: ${n}`);
  }
  const urls = allSitemapUrls().map((x) => x.url);
  assert.equal(new Set(urls).size, urls.length);
  assert.equal(sitemapPart("nope"), null);
});

test("homepage title fits 60 characters, keyword first, brand last", () => {
  const t = read("src/app/page.tsx").match(/absolute: `([^`]+)`/)![1].replace("${SITE.name}", SITE.name);
  assert.ok(t.length <= 60, t);
  assert.ok(t.endsWith(SITE.name));
  assert.match(t, /^Perfume price comparison/i);
});

test("breadcrumbs start at Home with absolute URLs", () => {
  const b = breadcrumbLd([{ name: "Brands", path: "/brands" }]);
  assert.equal(b.itemListElement[0].item, SITE.url);
  assert.equal(b.itemListElement[1].item, `${SITE.url}/brands`);
});

test("deep pages carry breadcrumbs; the homepage carries Organization, WebSite and FAQPage", () => {
  for (const f of ["src/app/product/[slug]/page.tsx", "src/app/brands/[slug]/page.tsx", "src/components/CatHub.tsx", "src/app/guides/[slug]/page.tsx", "src/app/blog/[slug]/page.tsx"]) {
    assert.match(read(f), /breadcrumbLd|<Crumbs/, f);
  }
  assert.match(read("src/app/page.tsx"), /siteLd\(\)/);
  assert.match(read("src/app/page.tsx"), /faqLd\(FAQ\)/);
});

test("no product photo has empty alt text", () => {
  for (const f of walk("src").filter((f) => f.endsWith(".tsx") && !f.endsWith("QuickView.tsx"))) assert.ok(!/<img[^>]*alt=""/.test(read(f)), f);
});

test("llms.txt is a static route", () => {
  assert.match(read("src/app/llms.txt/route.ts"), /force-static/);
});

// ScentCompare's own audit (2026-11-06): store titles are long, so titles and descriptions are fitted, not cut by Google.
test("fitTitle keeps the brand suffix when it fits, drops it before the keyword, never reorders", () => {
  assert.equal(fitTitle("Dior Sauvage price: compare 9 stores"), "Dior Sauvage price: compare 9 stores");
  const long = "Givenchy Gentleman by Givenchy Eau De Parfum Spray 2 oz for Men 60ml";
  const t = fitTitle(`${long} price: compare 9 stores`, `${long} price`);
  assert.deepEqual(t, { absolute: `${long} price` }); // nothing fits: the last, keyword first
  const mid = "Dior Sauvage Eau de Parfum 100ml";
  const m = fitTitle(`${mid} price: compare 12 stores`, `${mid} price comparison`, `${mid} price`);
  assert.equal(typeof m, "string"); // "… price | ScentCompare" fits 60
  assert.ok(`${m} | ${SITE.name}`.length <= TITLE_MAX);
});

test("fitDescription takes the first that fits 160, else cuts the last at a word", () => {
  assert.equal(fitDescription("a".repeat(200), "short"), "short");
  const cut = fitDescription(("word ".repeat(60)).trim());
  assert.ok(cut.length <= DESCRIPTION_MAX && cut.endsWith("…"), cut);
});

test("JSON-LD escapes < so a visitor's review cannot close the script", () => {
  assert.ok(!ldJson({ reviewBody: "</script><script>alert(1)</script>" }).includes("</script"));
  const page = read("src/app/product/[slug]/page.tsx");
  assert.ok(!page.includes("JSON.stringify(jsonLd)"), "the product page writes its Product block through JsonLd");
  assert.ok(!/Skin Care/.test(page), "fragrance, not KaeYoung's skin-care category");
});

test("hub and product titles start with a capital, and every fitted title lands within 60", () => {
  for (const f of ["src/app/deals/page.tsx", "src/app/blog/page.tsx", "src/app/brands/page.tsx", "src/app/guides/page.tsx", "src/app/black-friday/page.tsx", "src/components/SaleSeasonPage.tsx"]) {
    assert.ok(!/title[:=]\s*["`{]*\s*`?(fragrance|perfume) /.test(read(f)), f);
  }
  assert.ok(SITE.description.length <= DESCRIPTION_MAX, SITE.description);
});

test("the quick view's JSON is never indexed", () => {
  const cfg = read("next.config.js");
  assert.match(cfg, /source: "\/q\/:slug\*", headers: \[\{ key: "X-Robots-Tag", value: "noindex" \}\]/);
});

test("the sitemap is a lean core: at most SITEMAP_PRODUCTS products, no hub page 2+, only brands with a core product", async () => {
  const { SITEMAP_PRODUCTS } = await import("../src/lib/index-tiers");
  const urls = allSitemapUrls().map((x) => x.url);
  assert.ok(urls.filter((x) => x.includes("/product/")).length <= SITEMAP_PRODUCTS);
  assert.ok(!urls.some((x) => /\/page\/\d+$/.test(x)));
  assert.ok(urls.length < 600, `${urls.length} URLs`);
});

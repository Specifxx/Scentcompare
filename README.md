# ScentCompare

**Smell expensive. Pay less.** Compare perfume and cologne prices across real fragrance stores in the US, UK,
Canada, Australia, New Zealand and Europe: women's, men's and unisex. Matched by the barcode on the box, bottle size
by bottle size, checked every day. Built on KaeYoung's static engine (`Specifxx/Kaeyoung`), 2026-11-05.
Live at **scentcompare.app**.

## How it works

```
GitHub Actions, daily 06:11 UTC (import.yml)
  page jobs first: "pages" stores' sitemaps → product pages' schema.org GTIN, budgeted, robots.txt only
    (scripts/read-pages.ts, src/lib/import/pages.ts) → data/state/pages/<store>.json
  every store in src/content/stores.ts (Shopify products.json or the WooCommerce Store API, 2 at a time,
    ~1 request a second; page stores from their state, readings up to 5 days old)
  → one listing per variant with a valid EAN-13 or UPC (src/lib/ean.ts, src/lib/import/shopify.ts)
  → refuse testers, unboxed, decants, samples, dupes, bundles (src/lib/title.ts); section, size, house
  → one product per barcode, kept when 2+ stores in a region sell it (src/lib/merge.ts)
  → eBay Browse by GTIN, budgeted (scripts/ebay-import.ts; 4,800 calls a day on its own keyset)
  → data/public/{products,history,ebay,meta}.json, data/state/*
  → commit to main with "[deploy]" in the subject → one Vercel build a day → IndexNow ping
```

* **No accounts; no database or function behind any page.** The one exception is the rating form (`POST /api/reviews`, saved to `reviews.json` on this repo's public `reviews` branch), exported daily to `data/public/reviews.json`. Every page is prerendered at the daily build from the
  committed JSON; search is a static `/search-index.json`. The visitor's region is picked in the browser.
* **Deploys are gated** (`scripts/vercel-ignore-build.sh`): production builds only for `[deploy]` in the subject.
* **Barcodes**: `fill-barcodes.yml` (16 runners) does big barcode fills after stores are added; the daily import
  then looks up only new products (2,400 a run).
* **More stores**: add hosts to `probe/candidates.txt` on a `claude/*` branch; `probe-stores.yml` reads them and
  commits `probe/results.json` and `probe/summary.md`.
* **Monitoring**: `ops-monitor.yml` every three hours; a failure emails the owner through GitHub.

## Pages

Home, `/popular`, `/product/<slug>` (with ratings and reviews) (every store's price per region, pinned eBay/Amazon/retailer rows, price history, FAQ,
Product + FAQ JSON-LD, phone buy bar), `/<section>` (women, men, unisex, sets, minis, body, other; paged), `/brands`, `/brands/<slug>`, `/guides` and
`/guides/<slug>` (live-data price guides per category and per country), `/deals`, `/new`, `/stores`, `/search`,
`/about`, `/disclosure`, `/privacy`, `/terms`, `sitemap.xml`, `robots.txt`.

## Run locally

```
npm install
SC_DATA_DIR=tests/fixtures/data npm run dev        # synthetic fixture (npx tsx tests/fixtures/make-fixture.ts)
STORES=nudieglow npx tsx scripts/import.ts         # a real import of one store
```

Checks: `npm run typecheck`, `npm run lint`, `npm test`. Going live: the Chrome setup prompt in the project files
(`kyoung/chrome-prompt-setup.md`).

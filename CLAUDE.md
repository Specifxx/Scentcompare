# Working in this repo

ScentCompare (scentcompare.app, "Smell expensive. Pay less.") compares perfume and cologne prices across real
fragrance stores in the US, UK, Canada, Australia, New Zealand and Europe: women's, men's and unisex, for everyone
(owner, 2026-11-05). A copy of KaeYoung's static engine (`Specifxx/Kaeyoung`), itself built on FigureCompare's, and
a sister site of RiftCompare (`Specifxx/TCGEmpire`). It is a copy, not a synced sister: port fixes by hand. Read
`README.md`, then `DECISIONS.md` (the entries before 2026-11-05 are KaeYoung's).

## A fully static site: data in GitHub, pages on Vercel's CDN

- The daily import (`.github/workflows/import.yml`: `scripts/import.ts`, then `scripts/ebay-import.ts`) writes
  `data/public/*.json` and commits it to `main` with `[deploy]` in the subject: the one production build a day.
- Every page is prerendered at that build (`generateStaticParams` + `dynamicParams = false`): a visit is a static
  file, never a function. No database, no middleware, no ISR timer, no page reads cookies, headers or `searchParams`,
  every `next/link` has `prefetch={false}`, image optimisation is off. `tests/cost-rules.test.ts` pins all of it.
- The only function is eBay's account-deletion hook (`src/app/api/ebay/marketplace-deletion`); keep it while an eBay
  keyset exists.
- No database at all. Reviews (DECISIONS.md "Reviews live on the public repo's reviews branch") are ONE public file,
  `reviews.json` on this repo's `reviews` branch (never deployed, `vercel.json`), reached only through
  `src/lib/reviews-store.ts`: the two POST-only `/api/reviews` routes write it with `REVIEWS_GITHUB_TOKEN` (Vercel
  only, never client-side); `scripts/reviews-export.ts` and the ops monitor read it with the Actions token. Pages read
  `data/public/reviews.json`, never the branch (`tests/cost-rules.test.ts`). Nothing about a reviewer is stored: no
  IP, no hash of one, no email (per-visitor limits are in memory only). Never merge `reviews` into `main` or edit it by
  hand except to moderate. Ratings never order prices.
- Never write anything private to `data/`: it is public with the source. Never edit `data/` by hand.
- The visitor's region is chosen in the browser (time zone, then their own pick in localStorage) by the script in
  `src/app/layout.tsx`; every region's prices are in the HTML and CSS shows one (`.rp-XX` in `globals.css`).

## Deploys are gated: never add `[deploy]` to a commit subject

**One production build per 12 hours, and production only (owner, 2026-11-02: Vercel spend capped at $5–6 a
day).** `scripts/vercel-ignore-build.sh` skips a `[deploy]` commit within 12 hours of the last production
deployment (it rides the next release); `[urgent]` in the subject overrides that, only when the owner says
so. `vercel.json` disables every branch except production (`"**": false`), so no preview is ever built.
Never dispatch a manual release just to ship a merge. DECISIONS.md, 2026-11-02.

Production builds only a commit whose SUBJECT carries `[deploy]` (`scripts/vercel-ignore-build.sh`,
`tests/vercel-ignore-build.test.ts`). The daily data commit carries it. "Push to prod" means land on `main` and ride
the next release; use *Production deploy* (or `[deploy]`) only when the owner says it is urgent, and say so.
Previews build only with `[preview]`, when the owner asks. `claude/*` and `ccr-*` branches never deploy (`vercel.json`).

## Matching: the barcode on the box or nothing

- A listing is matched ONLY by a valid EAN-13 or UPC-A (`src/lib/ean.ts` `isProductEan`: a correct check digit,
  outside the internal, book and coupon ranges), read from the variant barcode, the SKU or a labelled "EAN:" in a
  single-variant description. No barcode, no listing. Never match on a title: a 50 ml and a 100 ml, an EDT and an
  EDP, a tester and a boxed bottle, and a fake all share a name.
- Every Shopify variant is its own listing (a 50 ml and a 100 ml are two products). `products.json` has no barcode,
  so `/products/<handle>.json` is read once per product and cached in `data/state/barcodes.json`
  (`fill-barcodes.yml` does big fills on 16 runners). In `mixed` stores only fragrance-worded products are looked up.
- The title decides only whether a listing belongs (`src/lib/title.ts`): testers, unboxed, decants, samples, vials,
  dupes and "inspired by", pre-owned, damaged, store-made bundles and mystery boxes are refused; a house's own gift
  set is kept. It also gives the section (women, men, unisex, sets, minis, body) and the size (ml, g, oz only).
  Every rule changed gets a store title in `tests/title.test.ts`.
- A product gets a page only when 2+ stores in one region sell it (`SITE.minStoresPerRegion`). With 3+ stores,
  prices under 40% or over 250% of the median are dropped. Mirrors (one stock, two domains) count once.
- The house is the Shopify vendor, folded by `src/lib/brand.ts` (aliases: YSL, Rabanne, MFK, Dolce & Gabbana…).
- Real stores only, never marketplaces (counterfeits). Stores live in `src/content/stores.ts`; read two at a time;
  a 403, 429 or captcha stops that store (never worked around). Prices are never converted between currencies; a
  store whose own currency is not its region's is skipped. Slugs are kept forever (`data/state/slugs.json`).

## Money

- Affiliate tags are added at build (`src/lib/affiliate.ts`): `sc-<region>-<placement>-<ean>` in EPN `customid`,
  Amazon `ascsubtag` and the retailers' `{sub}`; stores get `utm_source=scentcompare.app`.
- **No banner ads** (owner, 2026-10-30, inherited): no eBay strips, no AdSense, no nav ad boxes. Paid links live
  only in a product's price table, pinned above the stores, drawn like a store row and labelled: eBay, Amazon
  (hard-coded tags: US `riftcompare-20`, AU `scentcompare-22`, UK `compareempi03-21`, CA `compareempire-20`, EU
  `compareempire-21`), and the retailers in `PARTNERS` (FragranceX, FragranceNet, Perfumania, Sephora, Notino, Scent
  Store, LOOKFANTASTIC, Cult Beauty, Parfumdreams, Sobelia, Adore Beauty, YesStyle), each shown only once its `AFF_*`
  tracking template is set in Vercel (FragranceX and FragranceNet always, as plain searches until then). None is
  ever counted as a store or "the cheapest"; commission never decides order. `tests/site.test.ts` pins it.
- eBay listings come only from `scripts/ebay-import.ts` in GitHub Actions (Browse API by GTIN, new, Buy It Now,
  local sellers only, never from CN/HK sellers, 60%–300% of the store median). ScentCompare has its OWN keyset
  (owner, 2026-11-05): `EBAY_DAILY_CAP` is 2,500 and the pass is a no-op until `EBAY_CLIENT_ID`/`EBAY_CLIENT_SECRET`
  exist. Popular products first (the engine's tiers). Never point it at a sister's keyset or raise the cap without
  the owner.
- No pop-ups, no interstitials, no sign-up or accounts.

## Design

KaeYoung's layout, but blue (owner, 2026-11-05: "less peachy … blue themed so it's a little more masculine"), still
polished and neutral enough for the women's section: ice-white page, white cards with soft blue hairlines, cobalt
(`--accent`) for prices and buttons, a cool pastel set (`--peach` is ice blue, `--lavender`, `--mint`, `--butter` is
sand, `--sky`; the token names stay KaeYoung's so the engine's classes work) for section tiles and washes, green only
for savings, Fraunces headings and Inter text
(self-hosted through fontsource), no emoji decoration. Flat SVG drawings of generic bottles (`src/components/Art.tsx`),
never a house's own flacon. Light theme unless the visitor picks night. The side panel (`SideNav`, `src/lib/nav.ts`)
from `lg` up, the same groups in the phone menu. Product photos are the stores' own, hotlinked. Icons and the share
image come from `scripts/og/render.mjs`; look at them before committing.

## Blog

`src/content/blog.ts` lists the posts; `src/app/blog/[slug]/page.tsx` writes each one around live blocks drawn from
the day's prices at build, so every number is a real store price. A post answers one question the data answers; it
never repeats a section hub or a price guide.

## The site watches itself

`ops-monitor.yml` runs `scripts/ops-monitor.ts` every three hours; a failing check fails the run and GitHub emails
the owner. When you add a scheduled job, an external API or anything with a limit, add a check there.

## Checks

```
npm run typecheck
npm run lint
npm test
SC_DATA_DIR=tests/fixtures/data npx next build   # every page prerenders against the fixture
```

Record non-obvious decisions in `DECISIONS.md` (newest at the bottom).

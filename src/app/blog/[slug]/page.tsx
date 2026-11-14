import type { Metadata } from "next";
import { fitDescription, fitTitle } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { REGIONS, SITE, type CatKey, type RegionCode } from "@/site";
import { STORE_BY_ID } from "@/content/stores";
import { LIVE_POSTS, POST_BY_SLUG, type Post, type Section } from "@/content/blog";
import { bestIn, dealsIn, getBrands, getMeta, getProducts, orderableIn, popularIn, productsOfCat, storeName } from "@/lib/data";
import { money, niceDate, pct } from "@/lib/format";
import { storeUrl } from "@/lib/affiliate";
import { PageHead } from "@/components/Section";
import { PriceList } from "@/components/PriceList";
import { CatIcon } from "@/components/Art";
import type { Product } from "@/lib/types";
import { Crumbs } from "@/lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => LIVE_POSTS.map((p) => ({ slug: p.slug }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = POST_BY_SLUG[params.slug];
  if (!p) return {};
  return {
    title: fitTitle(p.title),
    description: fitDescription(p.description),
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", title: p.title, description: p.description, publishedTime: p.date, modifiedTime: p.updated, ...(p.image ? { images: [{ url: p.image.src, width: 1200, height: 630, alt: p.image.alt }] } : {}) },
    ...(p.image ? { twitter: { card: "summary_large_image", images: [p.image.src] } } : {}),
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const p = POST_BY_SLUG[params.slug];
  if (!p) notFound();
  const meta = getMeta();
  const asOf = meta ? niceDate(meta.updatedAt) : null;
  const Body = BODIES[p.slug];
  const sections = p.sections;
  return (
    <article className="mx-auto max-w-4xl px-4">
      <Crumbs items={[{ name: "Blog", path: "/blog" }, { name: p.title, path: `/blog/${p.slug}` }]} />
      <PageHead
        eyebrow={`Blog · Published ${niceDate(p.date)}${p.updated && p.updated > p.date ? ` · Updated ${niceDate(p.updated)}` : ""}`}
        title={p.title}
        sub={<p>{p.description}</p>}
        art={<CatIcon cat={p.art} size={150} />}
      />
      {p.image ? (
        // The post's own thumbnail, a static file in public/blog: no optimiser, no function.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.image.src} alt={p.image.alt} width={1200} height={630} className="mb-8 aspect-[1200/630] w-full rounded-2xl border border-line object-cover" />
      ) : null}
      <div className="article-body">{Body ? <Body asOf={asOf} /> : sections ? <Advice post={p} sections={sections} /> : null}</div>
      <aside className="mt-12 space-y-3 rounded-2xl bg-subtle p-5 text-sm text-soft">
        <h2 className="font-semibold text-ink">How this post was made</h2>
        <p>
          Every price table is drawn from the stores&apos; own listings at our daily check{asOf ? ` (last run ${asOf})` : ""}, matched by the barcode on the box, in each store&apos;s own currency and before delivery. Tables refresh every day; the text is
          only changed when we revise it, and then it shows an updated date. Prices change fast, so the store&apos;s own page is always the final word. If you spot a mistake, email{" "}
          <a className="underline" href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Correction: ${p.title}`)}`}>{SITE.email}</a> and we will fix it.
        </p>
        {p.sources?.length ? (
          <div>
            <h3 className="font-semibold text-ink">Sources</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {p.sources.map((x) => (
                <li key={x.url}>
                  <a href={x.url} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-ink">{x.title}</a>, {x.by}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p>
          Some store links earn us a commission; it never changes the order of prices (<Link prefetch={false} href="/disclosure" className="underline">how we make money</Link>).{" "}
          <Link prefetch={false} href="/blog" className="font-medium text-accent-deep hover:underline">
            More posts →
          </Link>
        </p>
      </aside>
    </article>
  );
}

const P = ({ children }: { children: ReactNode }) => <p className="mb-4 max-w-[68ch] text-[16px] leading-[1.7]">{children}</p>;
const H2 = ({ children }: { children: ReactNode }) => <h2 className="h-display mb-3 mt-10 text-2xl">{children}</h2>;
const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link prefetch={false} href={href} className="font-medium text-accent-deep underline underline-offset-4">
    {children}
  </Link>
);
const Empty = ({ region }: { region: RegionCode }) => (
  <p className="card p-6 text-center text-soft">Not enough stores {REGIONS.find((r) => r.code === region)!.phrase} sell these yet to compare. Try another country at the top.</p>
);

/** One block per region, shown by the region switch (CSS). */
function PerRegion({ render }: { render: (r: RegionCode) => ReactNode }) {
  return (
    <>
      {REGIONS.map((r) => (
        <div key={r.code} className={`rp rp-${r.code}`}>
          {render(r.code)}
        </div>
      ))}
    </>
  );
}

type BodyProps = { asOf: string | null };

const BODIES: Record<string, (p: BodyProps) => ReactNode> = {
  "brand-stores-vs-fragrance-shops": BrandStores,
  "same-product-different-price": Gaps,
  "avoid-fake-perfume": AvoidFakes,
};

// ---- Brand stores vs fragrance shops -------------------------------------

type Duel = { f: Product; official: { s: string; p: number; u: string }; shop: { s: string; p: number; u: string } };

/** Products a brand sells from its own store AND at least one specialist shop,
 *  both in stock, in one region: the brand's price against the cheapest shop. */
function duels(region: RegionCode): Duel[] {
  const out: Duel[] = [];
  for (const f of getProducts()) {
    const offers = (f.offers[region] ?? []).filter((o) => o.st === "in");
    const off = offers.filter((o) => STORE_BY_ID[o.s]?.official).sort((a, b) => a.p - b.p)[0];
    const shop = offers.filter((o) => !STORE_BY_ID[o.s]?.official).sort((a, b) => a.p - b.p)[0];
    if (off && shop) out.push({ f, official: off, shop });
  }
  return out.sort((a, b) => (b.official.p - b.shop.p) / b.official.p - (a.official.p - a.shop.p) / a.official.p);
}

function BrandStores() {
  return (
    <>
      <P>
        Some fragrance houses sell from their own online stores as well as through the shops that stock them. It is natural to assume the brand&apos;s own store is the safe, fair-price choice. We
        checked that against every specialist fragrance shop that sells the same product, matched by the barcode on the box, so the size and version are identical.
      </P>
      <PerRegion
        render={(r) => {
          const d = duels(r);
          if (!d.length) return <Empty region={r} />;
          const cheaper = d.filter((x) => x.shop.p < x.official.p).length;
          const same = d.filter((x) => x.shop.p === x.official.p).length;
          const savings = d.filter((x) => x.shop.p < x.official.p).map((x) => (x.official.p - x.shop.p) / x.official.p).sort((a, b) => a - b);
          const median = savings.length ? savings[Math.floor(savings.length / 2)] : 0;
          return (
            <>
              <H2>What the prices say</H2>
              <P>
                Of the {d.length} products both a brand store and a fragrance shop have in stock, a shop is cheaper for <b>{cheaper}</b>
                {same ? `, the price is the same for ${same}` : ""} and the brand&apos;s own store is cheaper for {d.length - cheaper - same}.
                {savings.length ? ` When a shop is cheaper, the typical saving is ${pct(median)} off the brand's own price.` : ""} Brand stores often run their own sales and
                bundles, so check both before you buy; and remember shipping, which brand stores sometimes make free above a lower threshold.
              </P>
              <H2>The biggest differences</H2>
              <div className="overflow-x-auto rounded-2xl border border-line bg-card">
                <table className="w-full min-w-[600px] text-sm">
                  <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-soft">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold">Brand store</th>
                      <th className="px-4 py-3 font-semibold">Cheapest shop</th>
                      <th className="px-4 py-3 text-right font-semibold">Difference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {d.slice(0, 15).map(({ f, official, shop }) => (
                      <tr key={f.ean}>
                        <td className="px-4 py-2.5">
                          <Link prefetch={false} href={`/product/${f.slug}`} className="font-medium hover:underline">
                            {f.name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 tabular-nums">{money(official.p, r)}</td>
                        <td className="px-4 py-2.5">
                          <span className="font-semibold tabular-nums">{money(shop.p, r)}</span>{" "}
                          <a href={storeUrl(shop.s, shop.u)} target="_blank" rel="nofollow noopener" className="text-soft hover:underline">
                            {storeName(shop.s)}
                          </a>
                        </td>
                        <td className={`px-4 py-2.5 text-right tabular-nums ${shop.p < official.p ? "text-save" : "text-soft"}`}>
                          {shop.p < official.p ? `−${pct((official.p - shop.p) / official.p)}` : shop.p === official.p ? "same" : `+${pct((shop.p - official.p) / official.p)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          );
        }}
      />
      <P>
        <span className="mt-6 block">
          Every product page on ScentCompare lists the brand&apos;s own store alongside the shops when it sells there, so you never have to check twice. Start with the <A href="/deals">deals list</A> or search for your product at the top.
        </span>
      </P>
    </>
  );
}

// ---- Biggest gaps ------------------------------------------------------------

function Gaps() {
  return (
    <>
      <P>
        The same product, the same size, the same barcode, and one store charges far more than another. That is the whole reason ScentCompare exists. Here are today&apos;s widest gaps in your country among products at least two stores have in stock,
        with the cheapest store first.
      </P>
      <PerRegion
        render={(r) => {
          const d = dealsIn(r, 20);
          return d.length ? (
            <>
              <H2>Biggest gaps today</H2>
              <PriceList region={r} products={d.map((x) => x.f)} />
            </>
          ) : (
            <Empty region={r} />
          );
        }}
      />
      <P>
        <span className="mt-6 block">
          A big gap is usually a sale at one store or an old price at another, so it rarely lasts. The live list is always on <A href="/deals">Deals today</A>.
        </span>
      </P>
    </>
  );
}

// ---- Avoiding fakes ------------------------------------------------------------

function AvoidFakes() {
  return (
    <>
      <P>
        Popular perfume is copied. Counterfeits turn up most on open marketplaces, where anyone can list a product, and they can look very close to the real thing. A fake is not just a waste of money: you do not know what is in it.
        Here is what we check, and what you can.
      </P>
      <H2>1. Buy from a store, not a stranger</H2>
      <P>
        Specialist fragrance stores and the brands&apos; own stores buy their stock from the brand or its distributors. Many brands publish a list of authorised sellers on their website; if a shop is on it, that is a good sign. Every store ScentCompare
        compares is a real shop selling new, sealed products; open marketplaces and second-hand sellers are never part of the store comparison. You can see all of them on <A href="/stores">Stores we compare</A>. We do show an eBay and an Amazon row
        above the stores on product pages, labelled as ads and kept out of the &quot;cheapest&quot; ranking; on either site, buy from the brand&apos;s official shop or a seller with a long record.
      </P>
      <H2>2. Be wary of a price far below everyone else&apos;s</H2>
      <P>
        Real stores price within a fairly narrow band of each other. When one listing is a fraction of what every store charges, ask why. When three or more stores sell a product, ScentCompare drops any price far below the others, so a price that looks too
        good to be true doesn&apos;t become the &quot;cheapest&quot;.
      </P>
      <H2>3. Check the box when it arrives</H2>
      <P>
        Compare the packaging with the brand&apos;s own photos: fonts, colours, the seal and the batch or expiry code printed on the box and the container. Real bottles have a batch code that matches between box and bottle, a cleanly glued box, a cap that fits and a sprayer that mists evenly. A colour, a scent that fades in minutes or a juice
        unlike what you have worn before is a reason to stop and contact the seller.
      </P>
      <H2>4. What a barcode does and doesn&apos;t tell you</H2>
      <P>
        ScentCompare matches every listing by the barcode printed on the box, which is how we know two stores sell the identical bottle and size. A barcode alone does not prove a product is genuine,
        because a counterfeit can copy it; that is why we also only list real stores.
      </P>
      <P>
        <span className="mt-2 block">
          Want the lowest price from a store you can trust? Search for your product at the top of the page, or start from <A href="/deals">today&apos;s deals</A>.
        </span>
      </P>
    </>
  );
}

// ---- Advice posts (src/content/blog-advice.ts) ----------------------------

/** "[text](/path)" in a paragraph becomes a link; everything else is text. */
function Linked({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        return m ? (
          <A key={i} href={m[2]}>
            {m[1]}
          </A>
        ) : (
          part
        );
      })}
    </>
  );
}

function picked(sec: Section): Product[] {
  if (!sec.picks) return [];
  const re = new RegExp(sec.picks.match, "i");
  return (sec.picks.cat ? productsOfCat(sec.picks.cat) : getProducts()).filter((f) => re.test(f.name));
}

function Advice({ sections }: { post: Post; sections: Section[] }) {
  return (
    <>
      {sections.map((sec, i) => {
        const list = picked(sec);
        return (
          <section key={i}>
            {sec.h && <H2>{sec.h}</H2>}
            {sec.p.map((t, j) => (
              <P key={j}>
                <Linked text={t} />
              </P>
            ))}
            {sec.picks && (
              <PerRegion
                render={(r) => {
                  const rows = popularIn(r, sec.picks!.limit ?? 10, list);
                  if (!rows.length) return <Empty region={r} />;
                  return (
                    <div className="mb-6">
                      <h3 className="mb-2 text-sm font-semibold text-soft">{sec.picks!.title.replace("{region}", REGIONS.find((x) => x.code === r)!.phrase)}</h3>
                      <PriceList region={r} products={rows} />
                    </div>
                  );
                }}
              />
            )}
          </section>
        );
      })}
      <P>
        Picks are the products the most stores in your country stock, shown cheapest first, so the table changes as stores restock and reprice. How a fragrance smells on you is the one thing no price can tell you: wear a sample before you buy a big bottle. <A href="/blog">More from the blog</A>.
      </P>
    </>
  );
}

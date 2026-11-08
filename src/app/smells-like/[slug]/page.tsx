import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { REGIONS } from "@/site";
import { altsIn, bestIn, smellsLikeOf, smellsLikePages } from "@/lib/data";
import { NOTE_BY_KEY } from "@/lib/notes";
import { money, pct } from "@/lib/format";
import { ProductTile } from "@/components/ProductTile";
import { ProductImage } from "@/components/ProductImage";
import { PageHead } from "@/components/Section";
import { Crumbs } from "@/lib/seo";

// "Smells like X, costs less" (lib/smells-like.ts, DECISIONS.md 2026-11-08): real bottles from other houses whose
// store-listed notes overlap most with a well-known scent and that cost less per ml. Only references with 3+ such
// bottles get a page, all prerendered at the release build.
export const dynamicParams = false;
export const generateStaticParams = () => smellsLikePages().map((x) => ({ slug: x.ref.slug }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const x = smellsLikeOf(params.slug);
  if (!x) return {};
  return {
    title: `Smells like ${x.ref.name}? ${x.alts.length} real perfumes that cost less`,
    description: `${x.alts.length} perfumes from other houses whose notes overlap most with ${x.ref.name} and cost less per ml, with every store's price compared. Real bottles with their own barcodes, never dupes or clones.`,
    alternates: { canonical: `/smells-like/${x.ref.slug}` },
  };
}

const noteName = (k: string) => NOTE_BY_KEY.get(k)?.name ?? k;

export default function SmellsLikePage({ params }: { params: { slug: string } }) {
  const x = smellsLikeOf(params.slug);
  if (!x) notFound();
  const { ref, alts } = x;
  const short = ref.name.toLowerCase().startsWith(`${ref.brand.toLowerCase()} `) ? ref.name.slice(ref.brand.length + 1) : ref.name;
  return (
    <div className="mx-auto max-w-6xl px-4">
      <Crumbs items={[{ name: "Smells like", path: "/smells-like" }, { name: ref.name, path: `/smells-like/${ref.slug}` }]} />
      <PageHead
        eyebrow="Smells like, costs less"
        title={`Love ${short}? The same notes for less`}
        sub={
          <p>
            Fragrances from other houses whose note lists overlap most with {ref.name}, cheaper per ml in your region. These are real perfumes with their own barcodes, never dupes, clones or &ldquo;inspired by&rdquo; bottles. Sharing notes is not smelling the same: try a mini or a store tester when you can.
          </p>
        }
      />
      <section className="mb-10 grid gap-6 sm:grid-cols-[200px_1fr] sm:items-start">
        <div className="max-w-[200px]">
          <ProductTile f={ref.rep} />
        </div>
        <div className="card p-5">
          <h2 className="eyebrow text-accent-deep">{ref.name} lists</h2>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {[...new Set([...(ref.notes.t ?? []), ...(ref.notes.h ?? []), ...(ref.notes.b ?? []), ...(ref.notes.a ?? [])])].map((k) => (
              <li key={k}>
                <Link prefetch={false} href={`/notes/${k}`} className="chip border border-line bg-card text-ink hover:border-soft">
                  {noteName(k)}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-soft">
            <Link prefetch={false} href={`/product/${ref.rep.slug}`} className="font-medium text-ink underline underline-offset-4">
              Compare {ref.name} prices
            </Link>{" "}
            across every store, or see what else costs less below.
          </p>
        </div>
      </section>
      <h2 className="h-display mb-4 text-2xl">Closest notes, lower price per ml</h2>
      {REGIONS.map((r) => {
        const list = altsIn(alts, r.code);
        return (
          <div key={r.code} className={`rp rp-${r.code} mb-12`}>
            {list.length ? (
              <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((a, i) => {
                  const b = bestIn(a.scent.rep, r.code);
                  return (
                    <li key={a.scent.key}>
                      <Link prefetch={false} href={`/product/${a.scent.rep.slug}`} data-qv={a.scent.rep.slug} data-qv-name={a.scent.rep.name} data-qv-brand={a.scent.rep.brand || undefined} data-qv-img={a.scent.rep.img || undefined} className="card tile-hover flex h-full gap-3 p-3">
                        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-white to-subtle">
                          <ProductImage src={a.scent.rep.img} alt={a.scent.rep.name} label={a.scent.brand || "fragrance"} className="h-full w-full object-contain p-1.5" />
                        </div>
                        <div className="min-w-0 text-sm">
                          <p className="eyebrow">
                            #{i + 1} · {a.shared.length} shared notes
                          </p>
                          <p className="mt-1 font-medium leading-snug text-ink">{a.scent.name}</p>
                          <p className="mt-1 line-clamp-2 text-soft">{a.shared.map(noteName).join(", ").toLowerCase()}</p>
                          <p className="mt-1.5">
                            <span className="font-semibold text-save">{pct(a.saving[r.code]!)} less per ml</span>
                            {b && <span className="text-soft"> · from {money(b.offer.p, r.code)}{a.scent.rep.size ? ` (${a.scent.rep.size})` : ""}</span>}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="card p-6 text-center text-soft">None of these is cheaper per ml {r.phrase} today. Pick another region at the top, or compare {ref.name} prices.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { REGIONS, type RegionCode } from "@/site";
import { altsIn, bestIn, smellsLikeOf, smellsLikePages } from "@/lib/data";
import { NOTE_BY_KEY } from "@/lib/notes";
import { ProductTile } from "@/components/ProductTile";
import { ProductImage } from "@/components/ProductImage";
import { AltCards, type AltItem, type AltPick } from "@/components/AltCards";
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

type Alts = NonNullable<ReturnType<typeof smellsLikeOf>>["alts"];

/** The six regions' lists as compact rows for AltCards: each bottle once, then per region its rank, saving and price. */
function altRows(alts: Alts): { items: AltItem[]; picks: [RegionCode, AltPick[]][] } {
  const items: AltItem[] = [];
  const at = new Map<string, number>();
  const picks = REGIONS.map((r): [RegionCode, AltPick[]] => [
    r.code,
    altsIn(alts, r.code).map((a) => {
      let i = at.get(a.scent.key);
      if (i == null) {
        const f = a.scent.rep;
        i = items.push([f.slug, f.name, a.scent.name, a.scent.brand || f.brand || "", f.img || "", a.shared.length, a.shared.map(noteName).join(", ").toLowerCase(), f.size || ""]) - 1;
        at.set(a.scent.key, i);
      }
      const b = bestIn(a.scent.rep, r.code);
      return [i, Math.round(a.saving[r.code]! * 100), b ? b.offer.p : -1];
    }),
  ]);
  return { items, picks };
}

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
      <AltCards {...altRows(alts)} refName={ref.name} />
    </div>
  );
}

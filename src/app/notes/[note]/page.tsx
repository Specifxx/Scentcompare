import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/site";
import { notePages, notesOf, productsWithNote } from "@/lib/data";
import { allNotes, FAMILY_BY_KEY, NOTE_BY_KEY } from "@/lib/notes";
import { TileGrid } from "@/components/ProductTile";
import { PageHead } from "@/components/Section";
import { JsonLd, breadcrumbLd, fitDescription, fitTitle } from "@/lib/seo";

// One page per note at least NOTE_PAGE_MIN products list (lib/data.ts notePages),
// all prerendered at the release build like the brand pages.
export const dynamicParams = false;
export function generateStaticParams() {
  return notePages().map((x) => ({ note: x.note.key }));
}

/** Tiles per section: the most widely stocked, so the page stays light. */
const PER_SECTION = 12;

export function generateMetadata({ params }: { params: { note: string } }): Metadata {
  const n = NOTE_BY_KEY.get(params.note);
  if (!n) return {};
  const count = productsWithNote(n.key).length;
  const lower = n.name.toLowerCase();
  return {
    title: fitTitle(`${n.name} perfumes: ${count} fragrances with ${lower} notes`, `Perfumes with ${lower} notes: compare prices`, `${n.name} perfumes and colognes`, `${n.name} perfumes`),
    description: fitDescription(
      `${count} perfumes and colognes that list ${lower} in their notes, for women, men and unisex, with every store's price compared side by side. Find a ${lower} scent without testing samples.`,
      `${count} perfumes that list ${lower} in their notes, with every store's price compared side by side.`,
    ),
    alternates: { canonical: `/notes/${n.key}` },
  };
}

export default function NotePage({ params }: { params: { note: string } }) {
  const n = NOTE_BY_KEY.get(params.note);
  if (!n) notFound();
  const list = productsWithNote(n.key);
  const fam = FAMILY_BY_KEY[n.family];
  const lower = n.name.toLowerCase();
  // Notes that most often share a bottle with this one, among notes with a page.
  const pagesSet = new Set(notePages().map((x) => x.note.key));
  const pair = new Map<string, number>();
  for (const f of list) for (const k of allNotes(notesOf(f)!)) if (k !== n.key && pagesSet.has(k)) pair.set(k, (pair.get(k) ?? 0) + 1);
  const paired = [...pair].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k]) => NOTE_BY_KEY.get(k)!);
  const cats = CATEGORIES.map((c) => ({ c, items: list.filter((f) => f.cat === c.key) })).filter((x) => x.items.length);
  return (
    <div className="mx-auto max-w-6xl px-4">
      <JsonLd data={breadcrumbLd([{ name: "Scent notes", path: "/notes" }, { name: n.name, path: `/notes/${n.key}` }])} />
      <nav aria-label="Breadcrumb" className="mt-5 text-sm text-soft">
        <Link prefetch={false} href="/notes" className="hover:text-ink">Scent notes</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{n.name}</span>
      </nav>
      <PageHead
        eyebrow={`Smells like · ${fam.name}`}
        title={`Perfumes with ${lower}`}
        sub={`${list.length.toLocaleString("en-US")} fragrances whose store note lists name ${lower}, most widely stocked first. Every price is compared across real fragrance stores, matched by the barcode on the box.`}
      />
      {paired.length > 0 && (
        <section className="mb-8">
          <h2 className="eyebrow mb-2">Often paired with {lower}</h2>
          <ul className="flex flex-wrap gap-2">
            {paired.map((p) => (
              <li key={p.key}>
                <Link prefetch={false} href={`/notes/${p.key}`} className="chip border border-line bg-card py-1.5 text-sm text-ink hover:border-soft">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {cats.map(({ c, items }) => (
        <section key={c.key} className="mb-10">
          <h2 className="h-display mb-4 text-xl">
            {c.name} with {lower} <span className="text-base text-soft">({items.length})</span>
          </h2>
          <TileGrid products={items.slice(0, PER_SECTION)} />
        </section>
      ))}
    </div>
  );
}

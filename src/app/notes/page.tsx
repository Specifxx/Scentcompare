import type { Metadata } from "next";
import Link from "next/link";
import { notePages } from "@/lib/data";
import { FAMILIES } from "@/lib/notes";
import { PageHead } from "@/components/Section";
import { JsonLd, breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shop perfume by scent note: vanilla, rose, oud and more",
  description: "Find a perfume by what it smells like: vanilla, rose, oud, lavender, citrus and every other note stores list, each with its fragrances' prices compared across stores.",
  alternates: { canonical: "/notes" },
};

export default function Notes() {
  const pages = notePages();
  return (
    <div className="mx-auto max-w-6xl px-4">
      <JsonLd data={breadcrumbLd([{ name: "Scent notes", path: "/notes" }])} />
      <PageHead
        eyebrow="Smells like"
        title="Shop perfume by scent note"
        sub="Can't test a sample online? Start from a smell you already love. Every note here comes from the note lists stores print for each bottle, grouped by family, with how many fragrances list it."
      />
      {FAMILIES.map((fam) => {
        const list = pages.filter((x) => x.note.family === fam.key);
        if (!list.length) return null;
        return (
          <section key={fam.key} className="mb-8">
            <h2 className="h-display mb-3 flex items-center gap-2 text-xl">
              <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: fam.color }} />
              {fam.name}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {list.map(({ note, count }) => (
                <li key={note.key}>
                  <Link prefetch={false} href={`/notes/${note.key}`} className="chip border border-line bg-card py-1.5 text-sm text-ink hover:border-soft">
                    {note.name} <span className="text-soft">{count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

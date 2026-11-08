import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/site";
import { smellsLikePages } from "@/lib/data";
import { PageHead } from "@/components/Section";
import { Crumbs } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Smells like, costs less: real perfumes with the same notes for less",
  description: "Pick a perfume you love and see real fragrances from other houses with the most notes in common that cost less per ml. Never dupes or clones; every price compared across stores.",
  alternates: { canonical: "/smells-like" },
};

export default function SmellsLikeIndex() {
  const pages = smellsLikePages();
  return (
    <div className="mx-auto max-w-6xl px-4">
      <Crumbs items={[{ name: "Smells like", path: "/smells-like" }]} />
      <PageHead
        eyebrow="Smells like, costs less"
        title="Love a perfume? Find the same notes for less"
        sub={
          <p>
            Pick a bestseller and see real fragrances from other houses whose store-listed notes overlap most, each cheaper per ml. Never dupes or clones. Or start from a single{" "}
            <Link prefetch={false} href="/notes" className="font-medium text-ink underline underline-offset-4">
              scent note
            </Link>
            .
          </p>
        }
      />
      {CATEGORIES.filter((c) => pages.some((x) => x.ref.rep.cat === c.key)).map((c) => (
        <section key={c.key} className="mb-8">
          <h2 className="h-display mb-3 text-xl">{c.name}</h2>
          <ul className="flex flex-wrap gap-2">
            {pages
              .filter((x) => x.ref.rep.cat === c.key)
              .map((x) => (
                <li key={x.ref.slug}>
                  <Link prefetch={false} href={`/smells-like/${x.ref.slug}`} className="chip border border-line bg-card py-1.5 text-sm text-ink hover:border-soft">
                    {x.ref.name} <span className="text-soft">{x.alts.length}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

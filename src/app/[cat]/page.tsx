import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, CAT_BY_KEY, type CatKey } from "@/site";
import { CatHub } from "@/components/CatHub";
import { CAT_SEO, fitDescription, fitTitle } from "@/lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => CATEGORIES.map((c) => ({ cat: c.key }));

export function generateMetadata({ params }: { params: { cat: string } }): Metadata {
  const c = CAT_BY_KEY[params.cat as CatKey];
  if (!c) return {};
  return {
    title: fitTitle(`${CAT_SEO[c.key]}: compare every store`, `${CAT_SEO[c.key]} compared`, CAT_SEO[c.key]),
    description: fitDescription(
      `Compare ${c.plural} prices across real fragrance stores in the US, UK, Canada, Australia, New Zealand and Europe. Matched by barcode, size by size, updated daily.`,
      `Compare ${c.plural} prices across real fragrance stores in the US, UK, Canada, Australia, NZ and Europe. Matched by barcode, updated daily.`,
      `${c.name} prices compared across real fragrance stores in six regions. Matched by barcode, updated daily.`,
    ),
    alternates: { canonical: `/${c.key}` },
  };
}

export default function CatPage({ params }: { params: { cat: string } }) {
  if (!CAT_BY_KEY[params.cat as CatKey]) notFound();
  return <CatHub cat={params.cat as CatKey} page={1} />;
}

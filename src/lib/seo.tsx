// Structured data helpers (SEO audit, 2026-11-03). Every block describes only what the page shows: the breadcrumb trail
// printed at the top, the questions printed in a FAQ, the prices printed in the table. Region is chosen in the browser on
// ONE URL per page (every region's prices are in the HTML), so the site has no hreflang alternates by design.
import Link from "next/link";
import { SITE, type CatKey } from "@/site";

/** The title a results page can show in full (SEO audit for ScentCompare, 2026-11-06): the first candidate that fits 60
 *  characters with the " | ScentCompare" the root template adds, else the first that fits alone (absolute, no suffix),
 *  else the last candidate as is. Candidates go from richest to shortest; the keyword always leads. */
export const TITLE_MAX = 60;
export function fitTitle(...candidates: string[]): string | { absolute: string } {
  const suffix = ` | ${SITE.name}`.length;
  const withSuffix = candidates.find((t) => t.length + suffix <= TITLE_MAX);
  if (withSuffix) return withSuffix;
  return { absolute: candidates.find((t) => t.length <= TITLE_MAX) ?? candidates[candidates.length - 1] };
}

/** The first description that fits a results snippet (160), else the last cut at a word with an ellipsis. */
export const DESCRIPTION_MAX = 160;
export function fitDescription(...candidates: string[]): string {
  const fit = candidates.find((d) => d.length <= DESCRIPTION_MAX);
  if (fit) return fit;
  const last = candidates[candidates.length - 1];
  return last.slice(0, DESCRIPTION_MAX - 1).replace(/\s+\S*$/, "") + "…";
}

/** Each section's search phrase, singular as people type it ("women's perfume prices"), each under 45 characters so
 *  the hub's title keeps " | ScentCompare" (2026-11-06; the plurals read "Women's perfumes prices"). */
export const CAT_SEO: Record<CatKey, string> = {
  women: "Women's perfume prices",
  men: "Men's cologne & aftershave prices",
  unisex: "Unisex fragrance prices",
  sets: "Perfume gift set prices",
  minis: "Travel spray & mini perfume prices",
  body: "Body mist & scented body care prices",
  other: "Candle, home scent & discovery set prices",
};

export const ldJson = (obj: unknown) => JSON.stringify(obj).replace(/</g, "\\u003c");

export function siteLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE.url}/#org`, name: SITE.name, url: SITE.url, logo: `${SITE.url}/icon.svg`, email: SITE.email },
      { "@type": "WebSite", "@id": `${SITE.url}/#website`, url: SITE.url, name: SITE.name, description: SITE.description, publisher: { "@id": `${SITE.url}/#org` }, inLanguage: "en" },
    ],
  };
}

/** The visible trail, Home first; the last item is the page itself. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE.url}${it.path === "/" ? "" : it.path}` })),
  };
}

export function faqLd(qa: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />;
}

/** A visible breadcrumb trail (Home first, the page itself last, unlinked) and its BreadcrumbList. */
export function Crumbs({ items, className = "mt-5 text-sm text-soft" }: { items: { name: string; path: string }[]; className?: string }) {
  const trail = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbLd(items)} />
      <nav aria-label="Breadcrumb" className={className}>
        {trail.map((it, i) => (
          <span key={it.path}>
            {i > 0 && <span className="mx-1.5">/</span>}
            {i < trail.length - 1 ? (
              <Link prefetch={false} href={it.path} className="hover:text-ink">{it.name}</Link>
            ) : (
              <span className="text-ink">{it.name}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

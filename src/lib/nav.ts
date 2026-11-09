// Every place the site goes, grouped the way a fragrance shopper looks: the section,
// where the value is, houses and guides, and the rest. The header mega menus
// (components/HeaderMenus.tsx, lg up; they replaced the side panel, Bill
// 2026-11-09) and the phone menu (components/MobileMenu.tsx) draw this list,
// so they never disagree. Static links to pages that exist.
// No data import here: the client menus import isActive from this file.
import { saleStrip } from "@/lib/black-friday";
import { CAT_BY_KEY, STEP_MENU_ORDER, type CatKey } from "@/site";

export type NavItem = { href: string; label: string; count?: number; cat?: CatKey };
export type NavGroup = { title: string; links: NavItem[] };

/** A header menu link; `regions` = the markets it has products in (absent: every market), drawn with the engine's rp-XX classes. */
export type MenuLink = { href: string; label: string; regions?: string[] };
export type HeaderMenu = { label: string; all: { href: string; label: string }; columns: { title?: string; links: MenuLink[] }[] };

/** What the header menus list beyond the groups: each already filtered to products and tagged with the markets that have them. */
export interface MenuFacts {
  catRegions: Partial<Record<CatKey, string[]>>;
  brands: MenuLink[];
  notes: MenuLink[];
}

function saleLinks(): NavItem[] {
  const s = saleStrip(new Date().toISOString().slice(0, 10));
  return s ? [{ href: s.href, label: `${s.name} deals` }] : [];
}

export function navGroups(counts: Record<CatKey, number>, topBrands: { slug: string; name: string }[] = []): NavGroup[] {
  return [
    {
      title: "Shop by section",
      links: STEP_MENU_ORDER.map((k) => CAT_BY_KEY[k]).filter((c) => counts[c.key] > 0).map((c) => ({ href: `/${c.key}`, label: c.name, count: counts[c.key], cat: c.key })),
    },
    {
      // The second ways in, under their own heading (Bill, 2026-11-09): by note and by the designer scent a cheaper one smells like.
      title: "Find a scent",
      links: [
        { href: "/notes", label: "Shop by scent note" },
        { href: "/smells-like", label: "Smells like, costs less" },
        { href: "/popular", label: "Popular" },
      ],
    },
    {
      title: "Save",
      links: [
        // Black Friday, then Cyber Monday, while the strip shows (lib/black-friday.ts saleStrip).
        ...saleLinks(),
        { href: "/deals", label: "Deals today" },
        { href: "/basket", label: "Basket compare" },
        { href: "/new", label: "New arrivals" },
        { href: "/guides", label: "Price guides" },
        { href: "/blog", label: "Blog" },
      ],
    },
    {
      title: "Brands",
      links: [...topBrands.map((b) => ({ href: `/brands/${b.slug}`, label: b.name })), { href: "/brands", label: "All brands" }],
    },
    {
      title: "ScentCompare",
      links: [
        { href: "/forum", label: "Community" },
        { href: "/creators", label: "Creators" },
        { href: "/stores", label: "Stores we compare" },
        { href: "/about", label: "How it works" },
        { href: "/disclosure", label: "How we make money" },
      ],
    },
  ];
}

/**
 * The header's mega menus (components/HeaderMenus.tsx, lg up). Sections and the other groups ARE the groups the phone menu draws;
 * notes and houses are the longer lists those link to. A link with no products in any market is left out (regions: []).
 */
export function headerMenus(groups: NavGroup[], f: MenuFacts): HeaderMenu[] {
  const live = (l: MenuLink) => !l.regions || l.regions.length > 0;
  const sections: MenuLink[] = (groups[0]?.links ?? []).map((l) => ({ href: l.href, label: l.label, regions: l.cat ? f.catRegions[l.cat] : undefined })).filter(live);
  const group = (title: string) => groups.find((g) => g.title === title)?.links ?? [];
  return [
    { label: "Shop", all: { href: "/popular", label: "Popular right now" }, columns: [{ title: "Women, men, unisex and more", links: sections }] },
    {
      label: "Scent notes",
      all: { href: "/notes", label: "All scent notes" },
      columns: [{ title: "By note", links: f.notes.filter(live) }, { title: "Find a scent", links: group("Find a scent").filter((l) => l.href !== "/notes" && l.href !== "/popular") }],
    },
    { label: "Houses", all: { href: "/brands", label: "All houses" }, columns: [{ links: f.brands.filter(live) }] },
    { label: "Deals & more", all: { href: "/deals", label: "Deals today" }, columns: [{ title: "Save", links: group("Save") }, { title: "ScentCompare", links: group("ScentCompare") }] },
  ];
}

/**
 * The quick row under the header below lg (components/CategoryStrip.tsx): the sections as the first group lists them, this niche's
 * second way in, then Brands. A subset of the groups above, so the strip never names a place the menus do not.
 */
export function quickLinks(groups: NavGroup[]): NavItem[] {
  return [...(groups[0]?.links ?? []).map(({ href, label }) => ({ href, label })), { href: "/notes", label: "Scent notes" }, { href: "/brands", label: "Brands" }];
}

/** The current page is this link, or inside it ("/men/page/2" is in Men's cologne). */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

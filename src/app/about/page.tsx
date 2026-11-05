import type { Metadata } from "next";
import { SITE } from "@/site";
import { STORES } from "@/content/stores";
import { PageHead } from "@/components/Section";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "About ScentCompare and how matching works",
  description: "How ScentCompare compares perfume prices: barcode matching, real fragrance stores only, daily price checks, and how the site is paid for.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <PageHead title="About ScentCompare" sub="An independent price guide for perfume and cologne. Smell expensive, pay less." />
      <Prose>
        <p>
          ScentCompare checks {STORES.length} real fragrance stores every day and shows every store&apos;s price for the same bottle, side by side, in your own currency: the US, UK, Canada, Australia, New Zealand and Europe.
        </p>
        <h2>How a product is matched</h2>
        <p>
          Every boxed fragrance carries a 13-digit barcode (an EAN, or a 12-digit UPC in North America). We match store listings <strong>only</strong> by that barcode, bottle size by bottle size. A listing without one is left out rather than guessed from its title, because the 50 ml and the 100 ml, the eau de toilette and the eau de parfum, the old and new bottle and a tester all look alike in a title.
        </p>
        <p>Testers and unboxed bottles, decants, samples and vials, dupes and &quot;inspired by&quot; oils, damaged boxes and store-made bundles are left out too. A product gets a page once at least two stores in one region sell it: comparing one shop is not a comparison.</p>
        <h2>Women&apos;s, men&apos;s and unisex</h2>
        <p>
          A fragrance is filed by who the house sells it for, read from the stores&apos; own listings: <a href="/women">women&apos;s perfume</a>, <a href="/men">men&apos;s cologne</a> and <a href="/unisex">unisex</a>, where most niche houses sit. Anyone can wear anything; the sections are only how shops shelve them. Gift sets, travel sprays and body mists have their own sections.
        </p>
        <h2>Which stores</h2>
        <p>
          Real fragrance shops and houses&apos; own stores that sell new, boxed bottles. No open marketplaces in the store list, because counterfeit fragrance is common there. eBay and Amazon appear above the store prices as rows labelled as
          ads, and big fragrance retailers that deliver to your country sit in their own labelled group as search links, because we can&apos;t read their prices. None of them is ever counted as a store or as &quot;the cheapest&quot;.
        </p>
        <h2>Prices and currencies</h2>
        <p>
          Each region shows prices in its own currency, exactly as the store lists them. We never convert currencies. Stores are sorted by the item price. Beside each store we show what delivery cost in that store&apos;s own quote for a small
          order to one city in your region, and from what order total it became free, checked once a week; your address can change it. To compare several products with delivery, use the <a href="/basket">basket</a>.
        </p>
        <h2>How fresh and how accurate</h2>
        <p>
          A program reads every store&apos;s own product feed once a day and the date of the last check is shown at the foot of every page. Between checks a store can change a price, run a sale or sell out, so the price at the store&apos;s
          checkout is always the one that counts. We would rather leave a listing out than show a wrong one: anything we can&apos;t match by barcode is dropped, and when three or more stores sell a product, a price far below or above the others
          is dropped as a likely mistake. When you find an error, email us and we fix it, usually the same day.
        </p>
        <h2>How the site is paid for</h2>
        <p>
          ScentCompare is free and has no ads beside the prices. It is paid for by affiliate links: if you buy after clicking eBay or Amazon (and, once their programs accept us, the big fragrance retailers), we may earn a commission at no cost to you.
          Today none of the stores in the comparison pays us anything. Commission never changes the order: stores are always sorted by price. The details are in <a href="/disclosure">how we make money</a>. No sign-up, no accounts, no pop-ups.
        </p>
        <h2>Spotted a mistake? Want a store added?</h2>
        <p>
          Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </Prose>
    </div>
  );
}

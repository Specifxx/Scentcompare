import Link from "next/link";
import { SITE } from "@/site";
import { LogoMark } from "./Logo";
import { FeedbackAsk } from "@/components/FeedbackAsk";

export function Footer({ updated }: { updated?: string | null }) {
  return (
    <footer className="wash mt-16 border-t border-line pt-12 text-sm">
      {/* "Was this page useful?" (owner, 2026-11-18: more feedback). One inline line, never a pop-up. */}
      <div className="mx-auto max-w-6xl px-4"><FeedbackAsk email={SITE.email} /></div>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <span className="font-display text-xl font-semibold">ScentCompare</span>
          </div>
          <p className="mt-3 text-soft">
            Perfume prices from real fragrance stores, matched by the barcode on the box and checked every day. {SITE.slogan}
          </p>
          {updated && <p className="mt-3 text-xs text-soft">Prices updated {updated}.</p>}
          <p className="mt-3 text-xs text-soft">
            <Link prefetch={false} href="/contact" className="underline hover:text-ink">Contact us</Link>:{" "}
            <a className="underline hover:text-ink" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        </div>
        <nav aria-label="About ScentCompare" className="lg:col-span-3">
          {/* Nine links, not 40-odd (2026-11-19): the header reaches every section, so the footer keeps who we are and how we work. */}
          <ul className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
            <li><Link prefetch={false} href="/about" className="text-soft hover:text-ink">About us: Bill and George</Link></li>
            <li><Link prefetch={false} href="/disclosure" className="text-soft hover:text-ink">How the site is paid for</Link></li>
            <li><Link prefetch={false} href="/how-we-pick-stores" className="text-soft hover:text-ink">Which stores we trust</Link></li>
            <li><Link prefetch={false} href="/stores" className="text-soft hover:text-ink">Every store we read</Link></li>
            <li><Link prefetch={false} href="/guides" className="text-soft hover:text-ink">Fragrance price guides</Link></li>
            <li><Link prefetch={false} href="/blog" className="text-soft hover:text-ink">Blog</Link></li>
            <li><Link prefetch={false} href="/contact" className="text-soft hover:text-ink">Contact</Link></li>
            <li><Link prefetch={false} href="/privacy" className="text-soft hover:text-ink">Privacy</Link></li>
            <li><Link prefetch={false} href="/terms" className="text-soft hover:text-ink">Terms</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line px-4 py-5 text-center text-xs text-soft">
        <p>
          Some links (eBay, Amazon and the labelled retailer rows) can earn us a commission at no cost to you; they never change the order of prices.{" "}
          <Link prefetch={false} href="/disclosure" className="underline hover:text-ink">How we make money</Link>. Prices are checked daily and can change between checks, so the store&apos;s checkout is always the final price; tell us about any
          mistake and we fix it.
        </p>
        <p className="mt-1">
          As an Amazon Associate we earn from qualifying purchases. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
        </p>
        <p className="mt-1">
          ScentCompare is an independent price guide, not affiliated with any brand or store. Product names and photos belong to their owners. Nothing here is medical advice.
        </p>
      </div>
    </footer>
  );
}

import { InlineAds } from "@/components/InlineAds";
import type { Metadata } from "next";
import { PageHead } from "@/components/Section";
import { Browse } from "@/components/Browse";

export const metadata: Metadata = {
  title: "Search perfume",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default function Search() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-40">
      <PageHead title="Search perfume" sub="Type a house, a perfume's name or a 13-digit barcode, then narrow it down by type, house, size and price." />
      <Browse search />
      {/* The one ad block (owner, 2026-11-13; added here 2026-11-19): after the page's content. */}
      <InlineAds page="search" />
    </div>
  );
}

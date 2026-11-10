"use client";
// The "Closest notes, lower price per ml" lists of a smells-like page (app/smells-like/[slug]), one per region, switched
// by .rp-XX. Drawn from compact rows (each bottle once, then per region its rank, saving and price) so the RSC payload
// carries numbers rather than a second copy of six lists' markup; the server HTML is the same as before.
// DECISIONS.md 2026-11-10, "Hub pages under 300 KB".
import Link from "next/link";
import { REGION_BY_CODE, type RegionCode } from "@/site";
import { money } from "@/lib/format";
import { ProductImage } from "./ProductImage";

/** [slug, bottle name (photo alt), scent name (shown), brand, img, shared notes count, shared notes text, size] */
export type AltItem = [string, string, string, string, string, number, string, string];
/** per region: [index into items, saving % per ml, lowest price in minor units or -1] */
export type AltPick = [number, number, number];

export function AltCards({ items, picks, refName }: { items: AltItem[]; picks: [RegionCode, AltPick[]][]; refName: string }) {
  return (
    <>
      {picks.map(([code, list]) => (
        <div key={code} className={`rp rp-${code} mb-12`}>
          {list.length ? (
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map(([idx, save, price], i) => {
                const [slug, name, scent, brand, img, shared, notes, size] = items[idx];
                return (
                  <li key={slug}>
                    <Link prefetch={false} href={`/product/${slug}`} data-qv="" data-qv-brand={brand || undefined} className="card tile-hover flex h-full gap-3 p-3">
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-white to-subtle">
                        <ProductImage src={img || null} alt={name} label={brand || "fragrance"} className="h-full w-full object-contain p-1.5" />
                      </div>
                      <div className="min-w-0 text-sm">
                        <p className="eyebrow">{`#${i + 1} · ${shared} shared notes`}</p>
                        <p className="mt-1 font-medium leading-snug text-ink">{scent}</p>
                        <p className="mt-1 line-clamp-2 text-soft">{notes}</p>
                        <p className="mt-1.5">
                          <span className="font-semibold text-save">{`${save}% less per ml`}</span>
                          {price >= 0 && <span className="text-soft">{` · from ${money(price, code)}${size ? ` (${size})` : ""}`}</span>}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="card p-6 text-center text-soft">{`None of these is cheaper per ml ${REGION_BY_CODE[code].phrase} today. Pick another region at the top, or compare ${refName} prices.`}</p>
          )}
        </div>
      ))}
    </>
  );
}

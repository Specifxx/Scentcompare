// The mark (owner, 2026-11-06): a square perfume bottle in see-through glass with a thin
// light-grey edge, a soft rose scent and a matte gold lid, on light blue. Calm, not shiny.
// Same as src/app/icon.svg, which also draws the favicon, apple icon and share images' mark.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
      <linearGradient id="sc-mark-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#a9cdf5"/>
      <stop offset="1" stopColor="#5b93d6"/>
      </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#sc-mark-bg)"/>
      <rect x="29" y="20.3" width="6" height="3.7" fill="#e6eaf0" fillOpacity=".45" stroke="#e6eaf0" strokeWidth="1.6"/>
      <rect x="16" y="24" width="32" height="31" rx="5" fill="#e6eaf0" fillOpacity=".3"/>
      <path d="M17 37h30v13a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4z" fill="#e8a6bd" fillOpacity=".85"/>
      <rect x="16" y="24" width="32" height="31" rx="5" fill="none" stroke="#e6eaf0" strokeWidth="2"/>
      <rect x="25" y="9" width="14" height="10" rx="1.5" fill="#c9a35c"/>
      <rect x="25" y="9" width="14" height="10" rx="1.5" fill="none" stroke="#a9843f" strokeWidth="1"/>
    </svg>
  );
}

/** `wordmark` sets when the name shows: the header hides it on the narrowest phones, where the region, theme and
 *  menu buttons need the row (owner, 2026-11-06: header overflow); the link keeps its aria-label. */
export function Logo({ wordmark = "flex" }: { wordmark?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className={`${wordmark} flex-col leading-none`}>
        <span className="font-display text-[22px] font-semibold tracking-tight text-ink">ScentCompare</span>
        <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.2em] text-soft sm:block">Smell expensive. Pay less.</span>
      </span>
    </span>
  );
}

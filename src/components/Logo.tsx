// The mark (owner, 2026-11-06): a chrome perfume bottle with pink scent and a shiny gold
// lid on a sky-blue rounded square. Same as src/app/icon.svg, which also draws the
// favicon, the apple icon and the share images' mark.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
      <linearGradient id="sc-mark-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#bcdcff"/>
      <stop offset="1" stopColor="#4f8fe0"/>
      </linearGradient>
      <linearGradient id="sc-mark-chrome" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#5f6d84"/>
      <stop offset=".22" stopColor="#ffffff"/>
      <stop offset=".5" stopColor="#9aa8bd"/>
      <stop offset=".78" stopColor="#eef3fa"/>
      <stop offset="1" stopColor="#55627a"/>
      </linearGradient>
      <linearGradient id="sc-mark-gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#9c6a1e"/>
      <stop offset=".3" stopColor="#ffe7a3"/>
      <stop offset=".55" stopColor="#d9a441"/>
      <stop offset=".8" stopColor="#f7d27a"/>
      <stop offset="1" stopColor="#94621a"/>
      </linearGradient>
      <linearGradient id="sc-mark-pink" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ff9fc4"/>
      <stop offset="1" stopColor="#d42f72"/>
      </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#sc-mark-bg)"/>
      <rect x="25" y="7.5" width="14" height="9.5" rx="2" fill="url(#sc-mark-gold)"/>
      <rect x="25" y="7.5" width="14" height="2.2" rx="1.1" fill="#fff" opacity=".55"/>
      <rect x="28.5" y="17" width="7" height="5" fill="url(#sc-mark-chrome)"/>
      <path d="M22 35c4-2 8 2 10 0s6-2 10 0v12a4.5 4.5 0 0 1-4.5 4.5h-11A4.5 4.5 0 0 1 22 47z" fill="url(#sc-mark-pink)"/>
      <rect x="18.5" y="22.5" width="27" height="32" rx="8" fill="none" stroke="url(#sc-mark-chrome)" strokeWidth="3.6"/>
      <path d="M24.5 28.5v8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".8"/>
      <circle cx="24.5" cy="40" r="1.2" fill="#fff" opacity=".7"/>
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[22px] font-semibold tracking-tight text-ink">ScentCompare</span>
        <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.2em] text-soft sm:block">Smell expensive. Pay less.</span>
      </span>
    </span>
  );
}

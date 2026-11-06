// The mark (owner, 2026-11-06: "less stock-icon, richer, not girly"): a solid gold
// faceted flacon on a deep ink-navy rounded square. Same as src/app/icon.svg, which
// also draws the favicon, the apple icon and the share images' mark.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="sc-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22355f" />
          <stop offset="1" stopColor="#0b1530" />
        </linearGradient>
        <linearGradient id="sc-mark-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6dc96" />
          <stop offset=".55" stopColor="#d4a24a" />
          <stop offset="1" stopColor="#a8752a" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#sc-mark-bg)" />
      <path d="M27 8h10l3 3.5V18H24v-6.5z" fill="url(#sc-mark-gold)" />
      <rect x="28.5" y="18" width="7" height="4.5" fill="#b8862f" />
      <path d="M19 28q0-5.5 5.5-5.5h15q5.5 0 5.5 5.5v19q0 8-8 8H27q-8 0-8-8z" fill="url(#sc-mark-gold)" />
      <path d="M23.5 30q0-3 3-3h1.5v23Q23.5 49 23.5 45z" fill="#fff" opacity=".32" />
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

// The mark: a rose-to-peach rounded square with a white perfume flacon (cap,
// neck, bottle) and a spritz of two drops. Same as src/app/icon.svg.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="sc-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#sc-mark)" />
      <rect x="26" y="11" width="12" height="9" rx="2.5" fill="#fff" />
      <rect x="29" y="20" width="6" height="5" fill="#fff" opacity=".9" />
      <rect x="18" y="25" width="28" height="28" rx="8" fill="none" stroke="#fff" strokeWidth="5" />
      <path d="M26 44a6 6 0 0 1 12 0" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity=".9" />
      <circle cx="48" cy="14" r="2.5" fill="#fff" opacity=".9" />
      <circle cx="54" cy="20" r="1.8" fill="#fff" opacity=".7" />
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

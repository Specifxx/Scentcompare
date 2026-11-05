// ScentCompare's drawings: simple flat perfume bottles, flacons and atomisers
// in the pastel set, drawn in SVG so they cost nothing to load and follow the
// theme. No house's bottle is drawn: these are generic shapes.
import type { CatKey } from "@/site";

/** Each section's tile colour (globals.css .tint-*). */
export const CAT_TINT: Record<CatKey, string> = {
  women: "tint-lavender",
  men: "tint-sky",
  unisex: "tint-rose", // accent-pale, the pale blue
  sets: "tint-peach",
  minis: "tint-butter",
  body: "tint-mint",
  other: "tint-lavender",
};

const INK = "#1f2a44";
const ROSE = "#5b8def"; // the accent blue; the name is KaeYoung's
const PEACH = "#9ec5ff"; // ice blue
const LAV = "#aeb4f2";
const MINT = "#7fd3b2";
const BUTTER = "#ffd66b";
const SKY = "#8ec5ff";
const WHITE = "#fdfdff";

const S = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** A small drawing for a section, 48×48. */
export function CatIcon({ cat, size = 40 }: { cat: CatKey; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      {ICONS[cat]}
    </svg>
  );
}

const ICONS: Record<CatKey, React.ReactNode> = {
  // rounded flacon with a gold cap and a sprayer
  women: (
    <g {...S}>
      <rect x="20" y="4" width="8" height="5" rx="1.5" fill={BUTTER} />
      <path d="M28 6h5" />
      <rect x="18" y="9" width="12" height="6" rx="2" fill={WHITE} />
      <path d="M12 24q0-9 12-9t12 9v10q0 8-8 8h-8q-8 0-8-8z" fill={ROSE} />
      <path d="M17 27q0 7 6 8" stroke={WHITE} strokeWidth="2" />
    </g>
  ),
  // square cologne bottle with a dark cap
  men: (
    <g {...S}>
      <rect x="18" y="5" width="12" height="9" rx="2" fill={INK} />
      <rect x="20" y="14" width="8" height="4" fill={WHITE} />
      <rect x="11" y="18" width="26" height="24" rx="4" fill={SKY} />
      <rect x="16" y="25" width="16" height="10" rx="1.5" fill={WHITE} />
    </g>
  ),
  // tall cylinder with a round cap
  unisex: (
    <g {...S}>
      <circle cx="24" cy="9" r="5" fill={LAV} />
      <rect x="20" y="13" width="8" height="4" fill={WHITE} />
      <path d="M15 21q0-4 4-4h10q4 0 4 4v17q0 4-4 4H19q-4 0-4-4z" fill={WHITE} />
      <rect x="19" y="26" width="10" height="9" rx="1" fill={LAV} />
    </g>
  ),
  // gift box with a bow
  sets: (
    <g {...S}>
      <rect x="8" y="20" width="32" height="22" rx="3" fill={PEACH} />
      <rect x="6" y="14" width="36" height="8" rx="2" fill={WHITE} />
      <path d="M24 14v28" />
      <path d="M24 14q-8-10-10-2 2 3 10 2zM24 14q8-10 10-2-2 3-10 2z" fill={ROSE} />
    </g>
  ),
  // three little bottles
  minis: (
    <g {...S}>
      <rect x="8" y="22" width="9" height="18" rx="2.5" fill={BUTTER} />
      <rect x="10" y="17" width="5" height="5" rx="1" fill={INK} />
      <rect x="19.5" y="18" width="9" height="22" rx="2.5" fill={WHITE} />
      <rect x="21.5" y="13" width="5" height="5" rx="1" fill={INK} />
      <rect x="31" y="24" width="9" height="16" rx="2.5" fill={ROSE} />
      <rect x="33" y="19" width="5" height="5" rx="1" fill={INK} />
    </g>
  ),
  // body mist spray bottle
  body: (
    <g {...S}>
      <path d="M22 4h4v6h-4zM26 6h7" />
      <rect x="19" y="10" width="10" height="5" rx="1.5" fill={MINT} />
      <path d="M13 21q0-6 6-6h10q6 0 6 6v17q0 5-5 5H18q-5 0-5-5z" fill={WHITE} />
      <path d="M18 28q3-3 6 0t6 0" stroke={MINT} strokeWidth="2.2" />
      <circle cx="38" cy="8" r="1.5" fill={MINT} stroke="none" />
      <circle cx="41" cy="12" r="1.2" fill={MINT} stroke="none" />
    </g>
  ),
  // candle and sparkle
  other: (
    <g {...S}>
      <rect x="12" y="20" width="22" height="22" rx="4" fill={LAV} />
      <path d="M12 24h22" />
      <path d="M23 8q-5 7 0 11 5-4 0-11z" fill={BUTTER} />
      <path d="M39 30q1 4 4 5-3 1-4 5-1-4-4-5 3-1 4-5z" fill={ROSE} />
    </g>
  ),
};

/** The hero drawing: a shelf of generic perfume bottles among petals. */
export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 340" className={className} aria-hidden role="presentation">
      <defs>
        <linearGradient id="sc-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dbe8ff" />
          <stop offset="1" stopColor="#5b8def" />
        </linearGradient>
        <linearGradient id="sc-lav" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecedff" />
          <stop offset="1" stopColor="#aeb4f2" />
        </linearGradient>
        <linearGradient id="sc-amber" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c9" />
          <stop offset="1" stopColor="#f3b64a" />
        </linearGradient>
        <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6f1ff" />
          <stop offset="1" stopColor="#8ec5ff" />
        </linearGradient>
      </defs>
      {/* soft round backdrop */}
      <circle cx="215" cy="170" r="150" fill="#eaf1fd" />
      <circle cx="320" cy="95" r="60" fill="#e4ecfb" />
      <circle cx="95" cy="250" r="55" fill="#f4f0e4" />
      {/* shelf */}
      <rect x="55" y="268" width="320" height="12" rx="6" fill="#c9d8f5" />
      <g {...S} strokeWidth="2.2">
        {/* tall cylinder (unisex) */}
        <circle cx="107" cy="102" r="17" fill="#aeb4f2" />
        <rect x="96" y="116" width="22" height="12" fill={WHITE} />
        <path d="M82 136q0-8 8-8h34q8 0 8 8v124q0 8-8 8H90q-8 0-8-8z" fill="url(#sc-lav)" />
        <rect x="92" y="170" width="30" height="46" rx="4" fill={WHITE} />
        {/* rounded flacon with gold cap (women) */}
        <rect x="178" y="48" width="20" height="14" rx="4" fill="#f3b64a" />
        <path d="M198 54h18" />
        <rect x="171" y="62" width="34" height="16" rx="4" fill={WHITE} />
        <path d="M150 118q0-40 42-40t42 40v110q0 40-40 40h-4q-40 0-40-40z" fill="url(#sc-glass)" />
        <path d="M170 130q0 26 24 30" stroke={WHITE} strokeWidth="5" opacity=".8" />
        {/* square cologne bottle (men) */}
        <rect x="266" y="112" width="40" height="28" rx="6" fill={INK} />
        <rect x="276" y="140" width="20" height="10" fill={WHITE} />
        <path d="M246 160q0-10 10-10h60q10 0 10 10v98q0 10-10 10h-60q-10 0-10-10z" fill="url(#sc-sky)" />
        <rect x="258" y="190" width="56" height="40" rx="3" fill={WHITE} />
        {/* small amber bottle leaning (mini) */}
        <g transform="rotate(14 350 230)">
          <rect x="338" y="190" width="18" height="12" rx="3" fill={INK} />
          <path d="M330 206q0-6 6-6h20q6 0 6 6v50q0 8-8 8h-16q-8 0-8-8z" fill="url(#sc-amber)" />
        </g>
      </g>
      {/* petals and sparkles */}
      <g fill="#5b8def" opacity=".85">
        <path d="M60 80q12-14 22 0-10 12-22 0z" />
        <path d="M352 290q12-14 22 0-10 12-22 0z" transform="rotate(30 363 290)" />
        <path d="M250 30q10-12 18 0-8 10-18 0z" transform="rotate(-20 259 30)" />
      </g>
      <g fill="#f3b64a">
        <path d="M372 150q2 10 10 12-8 2-10 12-2-10-10-12 8-2 10-12z" />
        <path d="M44 170q1.5 7 7 8.5-5.5 1.5-7 8.5-1.5-7-7-8.5 5.5-1.5 7-8.5z" />
      </g>
      <g fill="#aeb4f2">
        <circle cx="140" cy="50" r="5" />
        <circle cx="392" cy="60" r="4" />
        <circle cx="30" cy="120" r="3.5" />
      </g>
    </svg>
  );
}

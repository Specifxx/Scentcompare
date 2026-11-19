// Google AdSense (owner, 2026-11-19: "get scentcompare authorised for adsense"). The publisher ID is the owner's one AdSense
// account, the same as the sister sites' (public: it is in every page's head and in /ads.txt).
//
// For the site review only: the `google-adsense-account` meta (app/layout.tsx) and /ads.txt (public/ads.txt). No AdSense
// script loads yet: it is ~250 kB and the site is speed-first (DECISIONS.md, 2026-11-19). Once AdSense approves the site,
// the ad unit goes inside the ONE existing in-content block (InlineAds), loaded after idle, never a second block.

export const ADSENSE_CLIENT = "ca-pub-6842128782879909";

/** The ads.txt line Google wants for the client (its certification authority ID is fixed: f08c47fec0942fa0). */
export const adsTxtLine = (client: string) => `google.com, ${client.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0`;

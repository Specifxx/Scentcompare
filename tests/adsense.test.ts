import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { ADSENSE_CLIENT, adsTxtLine } from "../src/lib/adsense";

test("AdSense: the review meta and ads.txt name the same publisher", () => {
  assert.match(ADSENSE_CLIENT, /^ca-pub-\d{16}$/);
  assert.equal(readFileSync("public/ads.txt", "utf8").trim(), adsTxtLine(ADSENSE_CLIENT));
  assert.match(readFileSync("src/app/layout.tsx", "utf8"), /name="google-adsense-account" content=\{ADSENSE_CLIENT\}/);
});

test("AdSense: the privacy page discloses Google's ad cookies and the opt-out", () => {
  const p = readFileSync("src/app/privacy/page.tsx", "utf8");
  assert.match(p, /adssettings\.google\.com/);
  assert.match(p, /policies\.google\.com\/technologies\/partner-sites/);
});

test("AdSense: no AdSense script in the site until a placement is decided", () => {
  const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
  const hits = walk("src").filter((f) => /\.(tsx?|js)$/.test(f) && /adsbygoogle|pagead2\.googlesyndication/.test(readFileSync(f, "utf8")));
  assert.deepEqual(hits, []);
});

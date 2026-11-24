import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PARTNERS, inrewardsUrl, partnersFor } from "@/lib/affiliate";
import { inrewardsHref, isShortLink, mayRetry, shortLinkFrom, type InrewardsFile } from "@/lib/inrewards";
import { judgeInrewards } from "../scripts/ops-monitor";

const sephora = PARTNERS.find((p) => p.key === "sephora")!;
const file = (links: Record<string, string>): InrewardsFile => ({ v: 1, links, refused: {} });

test("the short link comes from data.shortLinks, string or object, and only from inrwd.me", () => {
  assert.equal(shortLinkFrom({ data: { shortLinks: ["https://inrwd.me/BVGqjYiKMSa"] } }), "https://inrwd.me/BVGqjYiKMSa");
  assert.equal(shortLinkFrom({ data: { shortLinks: [{ originalUrl: "https://www.sephora.com/x", shortLink: "https://inrwd.me/abc123" }] } }), "https://inrwd.me/abc123");
  assert.equal(shortLinkFrom({ data: { shortLinks: ["https://evil.example/abc"] } }), null);
  assert.equal(shortLinkFrom(null), null);
  assert.equal(isShortLink("http://inrwd.me/abc"), false);
});

test("Sephora's InRewards link shows in the US only, and wins over a template there", () => {
  const q = "Dior Sauvage Eau de Toilette 3.4 oz";
  const f = file({ [inrewardsUrl(sephora, q)]: "https://inrwd.me/sep1" });
  const us = partnersFor("US", q, "s", {}, f);
  assert.deepEqual(us.filter((r) => r.p.key === "sephora").map((r) => [r.href, r.paid]), [["https://inrwd.me/sep1", true]]);
  assert.equal(partnersFor("US", q, "s", { AFF_SEPHORA: "https://n.example/?u={url}" }, f).find((r) => r.p.key === "sephora")?.href, "https://inrwd.me/sep1");
  // Not confirmed to pay in Canada yet: no InRewards link there.
  assert.equal(partnersFor("CA", q, "s", {}, f).some((r) => r.href.includes("inrwd.me")), false);
  assert.equal(inrewardsHref(f, ["US"], "AU", inrewardsUrl(sephora, q)), null);
});

test("a refused URL is asked again after a week", () => {
  assert.equal(mayRetry(undefined, "2026-11-25"), true);
  assert.equal(mayRetry("2026-11-20", "2026-11-25"), false);
  assert.equal(mayRetry("2026-11-18", "2026-11-25"), true);
});

test("the ops check stays quiet until the key exists and is amber on an error", () => {
  const now = Date.parse("2026-11-25T12:00:00Z");
  assert.equal(judgeInrewards(null, false, now).status, "ok");
  const run = { at: "2026-11-25T08:00:00Z", asked: 10, made: 0, refused: 0, pending: 5 };
  assert.equal(judgeInrewards({ ...file({}), run: { ...run, error: "key refused (HTTP 401)" } }, true, now).status, "warn");
  assert.equal(judgeInrewards({ ...file({ a: "https://inrwd.me/a" }), run }, true, now).status, "ok");
  assert.equal(judgeInrewards({ ...file({}), run: { ...run, at: "2026-11-22T00:00:00Z" } }, true, now).status, "warn");
});

test("the key is read only by the InRewards script and the ops monitor, never by a page", () => {
  const src = (p: string) => fs.readFileSync(p, "utf8");
  assert.ok(src("scripts/inrewards-links.ts").includes("INREWARDS_API_KEY"));
  for (const p of ["src/lib/inrewards.ts", "src/lib/affiliate.ts", "src/components/PriceTable.tsx"]) assert.ok(!src(p).includes("INREWARDS_API_KEY"), p);
});

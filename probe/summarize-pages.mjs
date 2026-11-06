// Joins the page probe's shards into pages-results.json and pages-summary.md.
import fs from "node:fs";
const dir = process.argv[2];
let all = [];
for (const d of fs.readdirSync(dir)) for (const f of fs.readdirSync(`${dir}/${d}`)) all = all.concat(JSON.parse(fs.readFileSync(`${dir}/${d}/${f}`, "utf8")));
all.sort((a, b) => a.host.localeCompare(b.host));
const good = (r) => !r.walled && ((r.sample?.code ?? 0) >= 2 || (r.woo?.total ?? 0) > 0 || r.shopifyJson);
let md = `# Page-store probe ${new Date().toISOString().slice(0, 10)}\n\n${all.length} hosts; ${all.filter((r) => r.walled).length} walled; ${all.filter(good).length} worth a look.\n\n`;
md += "| Host | Status | Platform | Robots / | Shopify json | Woo (total, cur, skuEAN, frag) | Sitemap (all/frag) | Sample looked/ok/product/code/priced | Currency | Examples |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n";
for (const r of all.filter(good)) {
  const s = r.sample ?? {};
  const w = r.woo?.total ? `${r.woo.total}, ${r.woo.currency}, ${r.woo.skuEan}, ${r.woo.frag}${r.woo.robotsOk === false ? ", robots no" : ""}` : "";
  md += `| ${r.base ?? r.host} | ${r.status} | ${r.platform} | ${r.robotsAll ? "BLOCKED" : "ok"} | ${r.shopifyJson ? "yes" : ""} | ${w} | ${r.sitemapUrls ?? ""}/${r.sitemapFrag ?? ""} | ${s.looked ?? 0}/${s.ok ?? 0}/${s.product ?? 0}/${s.code ?? 0}/${s.priced ?? 0} | ${Object.keys(s.currency ?? {}).join(" ")} | ${(s.names ?? []).join("; ").replace(/\|/g, "/")} |\n`;
}
md += "\nWalled: " + all.filter((r) => r.walled).map((r) => `${r.host} (${r.status})`).join(", ") + "\n";
md += "\nOther: " + all.filter((r) => !r.walled && !good(r)).map((r) => `${r.host} (${r.error ?? `${r.status} ${r.platform ?? ""} ${r.sample ? `${r.sample.ok}/${r.sample.product}/${r.sample.code}` : ""}`})`).join(", ") + "\n";
fs.writeFileSync("probe/pages-results.json", JSON.stringify(all, null, 1) + "\n");
fs.writeFileSync("probe/pages-summary.md", md);
console.log(md);

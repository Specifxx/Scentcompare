// Research only (Reddit post images): renders today's link thumbnail and
// downloads a few product photos. Lives on a claude/* branch, never main.
import fs from "node:fs";
import * as React from "react";
(globalThis as any).React = React;

async function main() {
  fs.mkdirSync("reddit-assets/out", { recursive: true });
  for (const line of fs.readFileSync("reddit-assets/urls.txt", "utf8").split("\n").filter(Boolean)) {
    const [name, url] = line.split(" ");
    try {
      const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
      const type = r.headers.get("content-type") ?? "";
      const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
      fs.writeFileSync(`reddit-assets/out/${name}.${ext}`, Buffer.from(await r.arrayBuffer()));
      console.log(name, r.status, type);
    } catch (e) { console.log(name, "failed", e); }
  }
  const { default: Image } = await import("../src/app/opengraph-image");
  const res = await Image();
  fs.writeFileSync("reddit-assets/out/og-home.png", Buffer.from(await res.arrayBuffer()));
  console.log("og done");
}
main();

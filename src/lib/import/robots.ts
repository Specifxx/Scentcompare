// robots.txt for the page and WooCommerce readers: the rules for User-agent: *
// and the sitemaps it lists. A path robots.txt disallows is never read.

export interface Robots {
  disallow: string[];
  allow: string[];
  sitemaps: string[];
}

export function parseRobots(text: string): Robots {
  const out: Robots = { disallow: [], allow: [], sitemaps: [] };
  let mine = false;
  let rulesSeen = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === "sitemap") out.sitemaps.push(value);
    else if (key === "user-agent") {
      // A new group starts after a group's rules.
      if (rulesSeen) {
        mine = false;
        rulesSeen = false;
      }
      mine = mine || value === "*";
    } else if (key === "disallow" || key === "allow") {
      rulesSeen = true;
      if (mine && value) out[key].push(value);
    }
  }
  return out;
}

function matches(rule: string, path: string): boolean {
  const anchored = rule.endsWith("$");
  const body = anchored ? rule.slice(0, -1) : rule;
  const re = new RegExp(`^${body.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}${anchored ? "$" : ""}`);
  return re.test(path);
}

/** Longest matching rule wins; Allow wins a tie (Google's reading). */
export function robotsAllows(r: Robots, pathAndQuery: string): boolean {
  let best = -1;
  let ok = true;
  for (const d of r.disallow) if (matches(d, pathAndQuery) && d.length > best) (best = d.length), (ok = false);
  for (const a of r.allow) if (matches(a, pathAndQuery) && a.length >= best) (best = a.length), (ok = true);
  return ok;
}

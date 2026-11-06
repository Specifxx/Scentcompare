import Link from "next/link";
import { hasNotePage } from "@/lib/data";
import { familyMix, headlineNotes, NOTE_BY_KEY, smellsLikeText, wearLine, type Pyramid } from "@/lib/notes";

/** "Smells like": the notes stores list for this bottle, in plain words, for a
 *  shopper who cannot spray a tester (owner, 2026-11-06). Server HTML only, no
 *  script. Rendered only when there is a note list (lib/data.ts notesOf). */
export function SmellsLike({ name, notes }: { name: string; notes: Pyramid & { n: number } }) {
  const head = headlineNotes(notes);
  const wear = wearLine(notes);
  const mix = familyMix(notes);
  const rows: [string, string, string[] | undefined][] = notes.a
    ? [["The notes", "", notes.a]]
    : [
        ["First spray", "top notes", notes.t],
        ["After an hour", "heart notes", notes.h],
        ["All day on skin", "base notes", notes.b],
      ];
  return (
    <section data-reveal aria-labelledby="smells-like" className="card relative overflow-hidden p-5">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-2xl" style={{ background: mix[0]?.family.color }} />
      <h2 id="smells-like" className="eyebrow text-accent-deep">
        Smells like
      </h2>
      <p className="h-display mt-1 text-2xl leading-snug sm:text-[1.7rem]">
        {head.map((n, i) => (
          <span key={n.key}>
            {i > 0 && <span className="text-soft"> + </span>}
            <span className="whitespace-nowrap">{n.name.toLowerCase()}</span>
          </span>
        ))}
      </p>
      {wear && <p className="mt-1.5 text-[15px] text-soft">{wear}</p>}

      {mix.length > 1 && (
        <div className="mt-4">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-subtle" role="img" aria-label={`Scent families: ${mix.map((m) => `${m.family.name} ${Math.round(m.share * 100)}%`).join(", ")}`}>
            {mix.map((m) => (
              <span key={m.family.key} style={{ width: `${m.share * 100}%`, background: m.family.color }} />
            ))}
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-soft">
            {mix.slice(0, 5).map((m) => (
              <li key={m.family.key} className="inline-flex items-center gap-1.5">
                <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: m.family.color }} />
                {m.family.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <dl className="mt-4 space-y-2.5 text-sm">
        {rows
          .filter(([, , keys]) => keys?.length)
          .map(([label, hint, keys]) => (
            <div key={label} className="grid grid-cols-[7.5rem_1fr] items-start gap-3">
              <dt className="pt-1 font-medium leading-tight">
                {label}
                {hint && <span className="block text-xs font-normal text-soft">{hint}</span>}
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {keys!.map((k) => {
                  const n = NOTE_BY_KEY.get(k);
                  if (!n) return null;
                  return hasNotePage(k) ? (
                    <Link key={k} prefetch={false} href={`/notes/${k}`} className="chip border border-line bg-card text-ink hover:border-soft" title={`More perfumes with ${n.name.toLowerCase()}`}>
                      {n.name}
                    </Link>
                  ) : (
                    <span key={k} className="chip border border-line bg-card text-ink">
                      {n.name}
                    </span>
                  );
                })}
              </dd>
            </div>
          ))}
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-soft">
        From the note list {notes.n > 1 ? `${notes.n} stores print` : "the store prints"} for {name}
        {notes.n > 1 ? " (we show the notes they agree on)" : ""}. Skin changes how a scent wears, so treat it as a guide, not a sniff.
      </p>
    </section>
  );
}

/** The sentence the FAQ and the meta use: "Stores list bergamot and lemon on top, …". */
export function notesSentence(name: string, p: Pyramid): string {
  const names = (keys?: string[]) => {
    const list = (keys ?? []).map((k) => NOTE_BY_KEY.get(k)?.name.toLowerCase()).filter(Boolean) as string[];
    return list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}` : (list[0] ?? "");
  };
  const plain = `In plain words, it smells like ${smellsLikeText(headlineNotes(p))}.`;
  const wear = wearLine(p);
  if (p.a) return `Stores list ${name}'s notes as ${names(p.a)}. ${plain}${wear ? ` ${wear}` : ""}`;
  const parts = [p.t?.length ? `${names(p.t)} on top` : "", p.h?.length ? `${names(p.h)} in the heart` : "", p.b?.length ? `${names(p.b)} in the base` : ""].filter(Boolean);
  return `Stores list ${parts.join("; ")}. ${plain}${wear ? ` ${wear}` : ""}`;
}

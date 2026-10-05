// Tiny ICU-light formatter. No dependencies and no imports, so it also runs under `node --test` without a build.
// Supported: {name} and {name, plural, =0 {..} one {..} other {..}} with # for the number. Nothing else (no select, no dates).

export type Vars = Record<string, string | number>;

/** Index of the brace that closes the one opened at `open`, or -1. */
function closing(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}" && --depth === 0) return i;
  }
  return -1;
}

function parsePlural(body: string): { key: string; text: string }[] {
  const out: { key: string; text: string }[] = [];
  const re = /\s*(=\d+|[a-z]+)\s*\{/gy;
  let pos = 0;
  for (;;) {
    re.lastIndex = pos;
    const m = re.exec(body);
    if (!m) break;
    const open = m.index + m[0].length - 1;
    const end = closing(body, open);
    if (end < 0) break;
    out.push({ key: m[1], text: body.slice(open + 1, end) });
    pos = end + 1;
  }
  return out;
}

export function formatMessage(template: string, vars: Vars = {}, locale = "en"): string {
  let out = "";
  let i = 0;
  while (i < template.length) {
    const open = template.indexOf("{", i);
    if (open < 0) { out += template.slice(i); break; }
    out += template.slice(i, open);
    const end = closing(template, open);
    if (end < 0) { out += template.slice(open); break; }
    const inner = template.slice(open + 1, end);
    const comma = inner.indexOf(",");
    if (comma < 0) {
      const v = vars[inner.trim()];
      out += v === undefined ? `{${inner}}` : String(v);
    } else {
      const name = inner.slice(0, comma).trim();
      const rest = inner.slice(comma + 1).trimStart();
      const n = Number(vars[name]);
      if (rest.startsWith("plural,") && Number.isFinite(n)) {
        const options = parsePlural(rest.slice("plural,".length));
        const pick = options.find((o) => o.key === `=${n}`) ?? options.find((o) => o.key === new Intl.PluralRules(locale).select(n)) ?? options.find((o) => o.key === "other");
        out += formatMessage((pick?.text ?? "").replace(/#/g, new Intl.NumberFormat(locale).format(n)), vars, locale);
      } else out += `{${inner}}`;
    }
    i = end + 1;
  }
  return out;
}

/** Names of the variables a template uses, sorted. Used by the catalogue test to check that translations keep every placeholder. */
export function placeholders(template: string): string[] {
  const names = new Set<string>();
  const walk = (s: string) => {
    let i = 0;
    while (i < s.length) {
      const open = s.indexOf("{", i);
      if (open < 0) return;
      const end = closing(s, open);
      if (end < 0) return;
      const inner = s.slice(open + 1, end);
      const comma = inner.indexOf(",");
      if (comma < 0) names.add(inner.trim());
      else {
        names.add(inner.slice(0, comma).trim());
        const rest = inner.slice(comma + 1).trimStart();
        if (rest.startsWith("plural,")) for (const o of parsePlural(rest.slice("plural,".length))) walk(o.text);
      }
      i = end + 1;
    }
  };
  walk(template);
  return [...names].sort();
}

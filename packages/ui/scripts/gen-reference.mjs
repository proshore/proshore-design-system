// Generates the component and token reference that ships inside the Claude instructions:  node scripts/gen-reference.mjs <outDir>
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(process.argv[2] ?? join(root, ".pack/claude-reference"));
mkdirSync(out, { recursive: true });
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : []; });
const files = walk(join(root, "src")).map((p) => ({ path: p, text: readFileSync(p, "utf8") }));
const core = readFileSync(join(root, "src/index.ts"), "utf8");

// 1. every public name in the core entry
const names = new Set(); const stars = [];
for (const m of core.matchAll(/export (type )?\{([^}]+)\} from "([^"]+)"/g)) if (!m[1]) for (const n of m[2].split(",")) names.add(n.trim().split(" as ").pop());
for (const m of core.matchAll(/export \* from "([^"]+)"/g)) stars.push(m[1]);
const resolveMod = (rel) => { const base = join(root, "src", rel); return files.filter((f) => f.path === `${base}.ts` || f.path === `${base}.tsx` || f.path === join(base, "index.tsx") || f.path === join(base, "index.ts")); };
for (const s of stars) for (const f of resolveMod(s)) for (const m of f.text.matchAll(/export (?:function|const|class) ([A-Za-z0-9_]+)/g)) names.add(m[1]);
// index.tsx files re-export from siblings
for (const s of stars) for (const f of resolveMod(s)) for (const m of f.text.matchAll(/export \{([^}]+)\} from/g)) for (const n of m[1].split(",")) names.add(n.trim().split(" as ").pop());

// 2. doc comment + file for each name
const rows = [];
for (const name of [...names].filter((n) => /^[A-Za-z]/.test(n))) {
  const re = new RegExp(`export (?:function|const|class) ${name}\\b`);
  for (const f of files) {
    const m = re.exec(f.text); if (!m) continue;
    const before = f.text.slice(0, m.index).trimEnd();
    let doc = "";
    if (before.endsWith("*/")) { const start = before.lastIndexOf("/**"); if (start >= 0 && !before.slice(start, -2).includes("*/")) doc = before.slice(start).replace(/\/\*\*|\*\//g, "").split("\n").map((l) => l.replace(/^\s*\* ?/, "").trim()).filter(Boolean).join(" "); }
    rows.push({ name, file: relative(join(root, "src"), f.path).replace(/\\/g, "/"), doc });
    break;
  }
}
const group = (file) => file.startsWith("primitives/forms") ? "Forms" : file.startsWith("primitives/") ? "Primitives" : file.startsWith("components/charts") ? "Charts" : file.startsWith("components/table") ? "Tables" : file === "icons.tsx" ? "Icons" : file.startsWith("theme/") ? "Theme" : "Patterns and layout";
const by = {}; for (const r of rows) (by[group(r.file)] ??= []).push(r);
let md = `# @proshore/ui component reference (generated)\n\nEvery name below is imported from \`@proshore/ui\`. Exact props: read the declaration file \`node_modules/@proshore/ui/dist/types/<file without src>.d.ts\` (the "File" column), because it is always in step with the installed version.\n\n`;
for (const g of ["Theme", "Patterns and layout", "Primitives", "Forms", "Tables", "Charts", "Icons"]) {
  const list = (by[g] ?? []).sort((a, b) => a.name.localeCompare(b.name)); if (!list.length) continue;
  md += `## ${g}\n\n`;
  if (g === "Icons") { md += `Radix-drawn 15px icons, \`currentColor\`: ${list.map((r) => "`" + r.name + "`").join(", ")}.\n\n`; continue; }
  md += "| Name | File | What it is for |\n| --- | --- | --- |\n";
  for (const r of list) md += `| \`${r.name}\` | \`${r.file.replace(/\.tsx?$/, "")}\` | ${r.doc.replace(/\|/g, "/").slice(0, 330) || "(no description yet)"} |\n`;
  md += "\n";
}
writeFileSync(join(out, "components.md"), md);

// 3. tokens
const tokens = readFileSync(join(root, "src/theme/tokens.css"), "utf8");
const light = tokens.match(/:root, :root\[data-theme="light"\][^{]*\{([\s\S]*?)\n\}/)?.[1] ?? tokens;
const props = [...new Set([...tokens.matchAll(/(--[a-z0-9-]+):/g)].map((m) => m[1]))].sort();
const family = (p) => (p.match(/^--(space|font-size|font-weight|radius|shadow|gray|accent|sherpa|sev|pr|chart|focus|color|default-font|code-font)/)?.[1] ?? "other");
const fam = {}; for (const p of props) (fam[family(p)] ??= []).push(p);
let tmd = `# @proshore/ui design tokens (generated)\n\nCustom properties defined by the theme. Use these, never hard-coded colours, sizes or radii. Light and dark values are defined by the theme; components pick them up automatically.\n\n`;
const notes = { space: "spacing scale (use the layout primitives first)", "font-size": "type scale, 1 smallest (never below 12px) to 9", gray: "neutral scale 1 (background) to 12 (text); 11 = secondary text", accent: "Proshore blue accent scale; 9 = solid fill, 11 = link and accent text", sherpa: "semantic: canvas, surface, line, status (observed, inferred, confirmed, unknown, danger, coverage), accent mark", sev: "severity ramp (critical, high, medium, low, review) with matching -fg text colours", pr: "raw brand primitives (Relume): use semantic tokens instead", chart: "chart series and axis colours", radius: "corner radii", focus: "focus ring colour" };
for (const [f, list] of Object.entries(fam)) tmd += `## ${f}\n${notes[f] ? `*${notes[f]}*\n\n` : "\n"}${list.map((p) => "`" + p + "`").join(", ")}\n\n`;
writeFileSync(join(out, "tokens.md"), tmd);
console.log(`reference: ${rows.length} exports, ${props.length} tokens -> ${out}`);

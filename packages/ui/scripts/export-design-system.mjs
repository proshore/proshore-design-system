// Mirrors the design system into the file layout of Claude's "Design System" artifact type.
//   npm run pack && npm run export:design-system
// Reads the source tokens (src/theme/*.css), the reviewed usage notes (design-system-notes.json), the real built CSS and
// components from the packed library (.pack/dist or release/*.tgz) and writes packages/ui/.design-system/project/.
// It never publishes anything. The repo stays the source of truth; see docs/claude-design-system.md.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(root, "../..");
export const OUT_DIR = join(root, ".design-system");
export const PROJECT_DIR = join(OUT_DIR, "project");

// Caps of the Design System artifact type (SKILL.md of the type).
export const CAPS = { files: 1008, fileBytes: 15 * 1024 * 1024, svgBytes: 2 * 1024 * 1024, callBytes: 16 * 1024 * 1024 };

/* ------------------------------------------------------------------ tokens: parse, cascade, resolve */

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Split a stylesheet into top-level rules. At-rules are kept as `{ at: true }` so their custom properties can be reported. */
export function parseRules(css, file = "") {
  const text = stripComments(css);
  const rules = [];
  let i = 0, order = 0;
  while (i < text.length) {
    const open = text.indexOf("{", i);
    if (open < 0) break;
    const selector = text.slice(i, open).trim();
    let depth = 1, j = open + 1;
    while (depth && j < text.length) { if (text[j] === "{") depth++; else if (text[j] === "}") depth--; j++; }
    const body = text.slice(open + 1, j - 1);
    i = j;
    rules.push({ selector, body, file, order: order++, at: selector.startsWith("@") });
  }
  return rules;
}

const declarations = (body) => [...body.matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);?/g)].map((m) => ({ name: m[1], value: m[2].trim() }));

/**
 * Does one selector apply to the document element for a theme, and with which specificity?
 * Context: <html data-theme="light|dark"> (the library puts the theme on :root so portals inherit it).
 * `.pr-theme` wrappers and `[data-surface]` scopes are not the document element and are not mirrored.
 */
export function matchSelector(selector, theme) {
  const s = selector.trim();
  if (s === ":root") return [0, 1, 0];
  const m = /^:root\[data-theme="(light|dark)"\]$/.exec(s);
  if (m) return m[1] === theme ? [0, 2, 0] : null;
  return null;
}
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/** Cascade of custom properties for one theme: highest specificity wins, then later source order. */
export function cascade(rules, theme, { exclude = () => false } = {}) {
  const env = new Map();
  const skippedScopes = [];
  for (const r of rules) {
    const decls = declarations(r.body);
    if (!decls.length) continue;
    if (r.at) { skippedScopes.push({ scope: r.selector, file: r.file, names: decls.map((d) => d.name.slice(2)), reason: "inside an at-rule (media query), not a theme value" }); continue; }
    let best = null;
    for (const sel of r.selector.split(",")) { const sp = matchSelector(sel, theme); if (sp && (!best || cmp(sp, best) > 0)) best = sp; }
    if (!best) {
      const other = r.selector.split(",").some((sel) => matchSelector(sel, theme === "light" ? "dark" : "light"));
      if (theme === "light" && !other) skippedScopes.push({ scope: r.selector, file: r.file, names: decls.map((d) => d.name.slice(2)), reason: "not the document element (component or surface scope)" });
      continue;
    }
    for (const d of decls) {
      if (exclude(d.name, r)) continue;
      const prev = env.get(d.name);
      if (!prev || cmp(best, prev.spec) > 0 || (cmp(best, prev.spec) === 0 && r.order >= prev.order)) env.set(d.name, { value: d.value, spec: best, order: r.order });
    }
  }
  return { env: new Map([...env].map(([k, v]) => [k, v.value])), skippedScopes };
}

export function resolveVar(env, value, depth = 0) {
  if (depth > 20) return null;
  let failed = false;
  const out = value.replace(/var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,\s*([^)]*))?\)/g, (_m, name, fallback) => {
    const v = env.get(name);
    if (v == null) { if (fallback) return fallback.trim(); failed = true; return ""; }
    const r = resolveVar(env, v, depth + 1);
    if (r == null) { failed = true; return ""; }
    return r;
  });
  return failed ? null : out.trim();
}

const COLOR = /^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla|oklch)\([\d.,\s%/deg-]+\))$/i;
export const isColor = (v) => COLOR.test(v);
const normColor = (v) => v.toLowerCase().replace(/(^|[^\d])\.(\d)/g, "$10.$2").replace(/\s+/g, " ").replace(/\s*,\s*/g, ",");
const NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;

const CATEGORY = [
  ["type", /^--font-size-\d+$/], ["spacing", /^--space-\d+$/], ["radius", /^--(pr-)?radius-[a-z0-9-]+$/], ["shadow", /^--pr-card-shadow$/],
];
const LAYOUT = /^--(pr-(gap|container-large|page-padding|shell-nav-width|panel-width)|page-x)$/;

/**
 * Build the token families from source CSS. Returns { tokens, skipped }.
 * tokens: { color:[{name,value,usage}], spacing, radius, shadow, type:[{name,fontSize,fontWeight,usage}] }
 * skipped: [{ name, reason }]  (every token the type would reject, or that is not a design token)
 */
export function buildTokens(themeFiles, notes) {
  const rules = themeFiles.flatMap((f) => parseRules(f.css, f.name));
  const L = cascade(rules, "light"), D = cascade(rules, "dark");
  const skipped = [];
  const scoped = new Map(); // name -> first scope reason; reported later only if the name was never exported
  for (const s of L.skippedScopes) for (const n of s.names) if (!scoped.has(n)) scoped.set(n, `${s.reason}: ${s.scope}`.slice(0, 120));

  const names = [...new Set([...L.env.keys(), ...D.env.keys()])].sort();
  const res = (T, n) => { const env = T === "light" ? L.env : D.env; const v = env.get(n); return v == null ? null : resolveVar(env, v); };
  const raw = {}; // color tokens that will be exported, name -> {light,dark}
  const out = { color: [], spacing: [], radius: [], shadow: [], type: [] };
  const pending = [];
  for (const n of names) {
    const name = n.slice(2);
    if (!NAME.test(name)) { skipped.push({ name, reason: "name not allowed by the type" }); continue; }
    if (n.startsWith("--b-") || /^--(card-padding|l-|font-family|default-font|heading-font|code-font)/.test(n) || /^--(default|heading|code)-font-family$/.test(n)) { skipped.push({ name, reason: "font family or component-internal variable (fonts are named in type.families)" }); continue; }
    if (LAYOUT.test(n)) { skipped.push({ name, reason: "layout size, not a design token family of the type" }); continue; }
    const cat = CATEGORY.find(([, re]) => re.test(n))?.[0];
    const l = res("light", n), d = res("dark", n);
    if (cat === "shadow") { pending.push({ cat, name, l, d }); continue; }
    if (cat) { pending.push({ cat, name, l, d }); continue; }
    const lc = l && isColor(l), dc = d && isColor(d);
    if (lc || dc) { raw[name] = { l: lc ? l : null, d: dc ? d : null, src: { l: L.env.get(n), d: D.env.get(n) } }; continue; }
    skipped.push({ name, reason: `value is not a plain colour in any theme (light: ${l ?? "unset"}, dark: ${d ?? "unset"})` });
  }

  const alias = (src) => { const m = src && /^var\(\s*--([A-Za-z0-9_-]+)\s*\)$/.exec(src.trim()); return m && raw[m[1]] ? `{${m[1]}}` : null; };
  const noteFor = (name) => { const hit = notes.find((p) => new RegExp(p.match).test(name)); return hit ? hit.usage : null; };
  const missingNotes = [];
  const usage = (name) => { const u = noteFor(name); if (!u) missingNotes.push(name); return u ?? ""; };

  for (const [name, r] of Object.entries(raw)) {
    const lv = r.l ? alias(r.src.l) ?? normColor(r.l) : null;
    const dv = r.d ? alias(r.src.d) ?? normColor(r.d) : null;
    const value = lv && dv ? (lv === dv ? lv : { light: lv, dark: dv }) : lv ? { light: lv } : { dark: dv };
    out.color.push({ name, value, usage: usage(name) });
  }
  for (const p of pending) {
    if (p.cat === "type") {
      let v = p.l;
      const mx = v && /^max\(\s*(\d+(?:\.\d+)?)px\s*,\s*(\.?\d+(?:\.\d+)?)rem\s*\)$/.exec(v);
      if (mx) v = Math.abs(parseFloat(mx[1]) - parseFloat(mx[2]) * 16) < 0.01 ? `${mx[1]}px` : null; // max(12px,.75rem): both are 12px at the default root size
      if (!v || !/^\d*\.?\d+(px|rem|em|%)$/.test(v)) { skipped.push({ name: p.name, reason: `font size not a plain length (${p.l})` }); continue; }
      const step = +p.name.replace("font-size-", "");
      out.type.push({ name: `text-${step}`, fontSize: v, fontWeight: step >= 6 ? 600 : 400, usage: usage(`text-${step}`) });
    } else if (p.cat === "spacing" || p.cat === "radius") {
      if (!p.l || !/^\d*\.?\d+(px|rem|em|%)$/.test(p.l)) { skipped.push({ name: p.name, reason: `not a plain length (${p.l})` }); continue; }
      out[p.cat].push({ name: p.name, value: p.l, usage: usage(p.name) });
    } else if (p.cat === "shadow") {
      if (!p.l || !p.d || /var\(|color-mix/.test(p.l + p.d)) { skipped.push({ name: p.name, reason: "shadow did not resolve" }); continue; }
      out.shadow.push({ name: p.name, value: p.l === p.d ? p.l : { light: p.l, dark: p.d }, usage: usage(p.name) });
    }
  }
  const done = new Set([...Object.values(out).flat().map((t) => t.name), ...Object.keys(raw), ...skipped.map((x) => x.name)]);
  for (const [n, reason] of scoped) if (!done.has(n) && !names.includes(`--${n}`)) skipped.push({ name: n, reason });
  const byNum = (a, b) => a.name.localeCompare(b.name, "en", { numeric: true });
  out.spacing.sort(byNum); out.type.sort(byNum);
  return { tokens: out, skipped, missingNotes: [...new Set(missingNotes)], env: { light: L.env, dark: D.env } };
}

/* ------------------------------------------------------------------ assets */

/** Remove the XML prolog and comments (the artifact store rejects the Illustrator prolog and editor comment). Artwork unchanged. */
export function cleanSvg(svg) {
  return svg.replace(/^﻿/, "").replace(/<\?xml[\s\S]*?\?>\s*/g, "").replace(/<!--[\s\S]*?-->\s*/g, "").trimStart();
}

/** Simple well-formedness check: balanced tags, one root `svg`, no prolog or comments left. Not a full XML parser. */
export function checkSvg(svg) {
  const problems = [];
  if (/<\?xml/i.test(svg)) problems.push("xml prolog present");
  if (/<!--/.test(svg)) problems.push("comment present");
  if (!/^<svg[\s>]/.test(svg.trim())) problems.push("does not start with <svg");
  const stack = [];
  for (const m of svg.matchAll(/<(\/?)([A-Za-z][\w:.-]*)((?:"[^"]*"|'[^']*'|[^'">])*?)(\/?)>/g)) {
    const [, close, tag, , self] = m;
    if (self) continue;
    if (close) { if (stack.pop() !== tag) { problems.push(`unbalanced </${tag}>`); break; } } else stack.push(tag);
  }
  if (stack.length) problems.push(`unclosed <${stack.at(-1)}>`);
  if (!/<\/svg>\s*$/.test(svg.trim())) problems.push("does not end with </svg>");
  return problems;
}

/* ------------------------------------------------------------------ previews */

const MARKER = /^<!-- @dsCard [^>]*-->$/;
/** Returns a list of problems. Component previews: marker on line 1 and no other comment. The cover: also exactly one derivation comment. */
export function checkPreview(html, { cover = false } = {}) {
  const problems = [];
  const lines = html.split("\n");
  if (!MARKER.test(lines[0])) problems.push("line 1 is not the @dsCard marker");
  const rest = lines.slice(1).join("\n");
  if (/<script/i.test(html)) problems.push("contains <script");
  if (/<iframe/i.test(html)) problems.push("contains <iframe");
  const comments = rest.match(/<!--[\s\S]*?-->/g) ?? [];
  if (cover) { if (comments.length !== 1 || !/blocks/i.test(comments[0])) problems.push("cover needs exactly one derivation comment (blocks, arrangement, pattern, scales)"); }
  else if (comments.length) problems.push(`contains ${comments.length} HTML comment(s) beyond the marker`);
  if (/(?:src|href)\s*=\s*["']?https?:/i.test(html)) problems.push("loads an external URL");
  return problems;
}

/* ------------------------------------------------------------------ packed library */

export function locatePack() {
  const dist = join(root, ".pack", "dist");
  if (existsSync(join(dist, "index.js")) && existsSync(join(dist, "styles.css"))) return { dist, cleanup: () => {} };
  const rel = join(repo, "release");
  const tgz = existsSync(rel) ? readdirSync(rel).filter((f) => /^proshore-ui-.*\.tgz$/.test(f)).sort().at(-1) : null;
  if (!tgz) throw new Error("No packed library found. Run `npm run pack` first (looked in packages/ui/.pack/dist and release/proshore-ui-*.tgz).");
  const tmp = join(OUT_DIR, "_lib");
  rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
  execFileSync("tar", ["-xzf", join(rel, tgz), "-C", tmp]);
  return { dist: join(tmp, "package", "dist"), cleanup: () => rmSync(tmp, { recursive: true, force: true }) };
}

/** Find the Latin subset font files by the @font-face unicode-range that starts at U+00 (shown as U+??). */
export function latinFonts(css) {
  const found = {};
  for (const m of css.matchAll(/@font-face\{([^}]*)\}/g)) {
    const b = m[1];
    const fam = /font-family:([^;]+)/.exec(b)?.[1].replace(/["']/g, "").trim();
    const file = /url\(\.\/(fonts\/[^)]+\.woff2)\)/.exec(b)?.[1];
    if (fam && file && /unicode-range:U\+\?\?/.test(b)) found[fam] = file;
  }
  return found;
}

/* ------------------------------------------------------------------ rendering */

const ASSETS = { "proshore-icon-orange.svg": "Proshore ridge mark in brand orange", "proshore-wordmark-blue.svg": "Proshore wordmark in navy" };

function fillTemplate(text, env, what) {
  return text.replace(/\{\{(light|dark|version):?([\w-]*)\}\}/g, (_m, kind, name) => {
    if (kind === "version") return env.version;
    const v = env[kind].get(`--${name}`);
    const r = v && resolveVar(env[kind], v);
    if (!r) throw new Error(`${what}: unresolved placeholder {{${kind}:${name}}}`);
    return r;
  });
}

export function frame(marker, inner) {
  return `<!-- @dsCard ${marker} -->\n<div style="padding:16px;background:var(--pr-canvas);color:var(--gray-12);font-family:var(--default-font-family)">${inner}</div>\n`;
}

async function renderPreviews(distDir, previews) {
  const React = (await import("react")).default ?? (await import("react"));
  const { renderToStaticMarkup } = await import("react-dom/server");
  const UI = await import(pathToFileURL(join(distDir, "index.js")).href);
  const build = (n) => {
    if (typeof n === "string") return n;
    const type = /^[a-z]/.test(n.c) ? n.c : UI[n.c];
    if (!type) throw new Error(`Preview component "${n.c}" is not exported by the packed library`);
    return React.createElement(type, n.p ?? {}, ...(n.k ?? []).map(build));
  };
  const files = {};
  const failed = [];
  for (const p of previews) {
    try { files[p.name] = { ...p, html: renderToStaticMarkup(build(p.tree)) }; }
    catch (e) { failed.push({ name: p.name, error: String(e).slice(0, 300) }); }
  }
  return { files, failed };
}

/* ------------------------------------------------------------------ main build */

export async function buildProject({ log = () => {} } = {}) {
  const read = (p) => readFileSync(join(root, p), "utf8");
  const pkg = JSON.parse(read("package.json"));
  const themeDir = join(root, "src", "theme");
  const themeFiles = readdirSync(themeDir).filter((f) => f.endsWith(".css")).sort().map((f) => ({ name: f, css: readFileSync(join(themeDir, f), "utf8") }));
  const notes = JSON.parse(read("design-system-notes.json")).notes;
  const previews = (await import(pathToFileURL(join(root, "design-system-previews.mjs")).href)).default;

  const { tokens, skipped, missingNotes, env } = buildTokens(themeFiles, notes);
  if (missingNotes.length) throw new Error(`These tokens have no usage note in packages/ui/design-system-notes.json (add a reviewed note):\n  ${missingNotes.join("\n  ")}`);
  if (!tokens.color.length) throw new Error("No colour tokens resolved; check src/theme/tokens.css");

  const pack = locatePack();
  try {
    const css = readFileSync(join(pack.dist, "styles.css"), "utf8");
    const fonts = latinFonts(css);
    const sans = fonts["Geist Variable"], mono = fonts["Geist Mono Variable"];
    if (!sans || !mono) throw new Error("Could not find the Latin Geist / Geist Mono font files in the packed styles.css (@font-face with unicode-range starting at U+??).");

    rmSync(PROJECT_DIR, { recursive: true, force: true });
    const files = new Map(); // path under project/ -> Buffer|string
    const put = (p, c) => files.set(p, c);
    const copy = (src, p) => put(p, readFileSync(src));

    const tokensJson = {
      name: "Proshore", version: 1,
      color: { themes: [{ id: "light", name: "Light" }, { id: "dark", name: "Dark" }], tokens: tokens.color },
      type: {
        fonts: [
          { family: "Geist Variable", file: "fonts/geist-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
          { family: "Geist Mono Variable", file: "fonts/geist-mono-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
        ],
        families: { sans: "\"Geist Variable\", \"Geist\", system-ui, sans-serif", mono: "\"Geist Mono Variable\", \"Geist Mono\", ui-monospace, monospace" },
        groups: [{ name: "Scale", family: "sans", styles: tokens.type }],
      },
      spacing: { tokens: tokens.spacing }, radius: { tokens: tokens.radius }, shadow: { tokens: tokens.shadow },
      meta: { source: `proshore-design-system packages/ui/src/theme/*.css, @proshore/ui ${pkg.version} (generated by npm run export:design-system)` },
    };
    put("tokens.json", JSON.stringify(tokensJson, null, 1) + "\n");
    copy(join(pack.dist, sans), "fonts/geist-latin-wght-normal.woff2");
    copy(join(pack.dist, mono), "fonts/geist-mono-latin-wght-normal.woff2");
    put("components/bundle.css", css.replace(/@font-face\{[^}]*\}/g, ""));

    const tpl = (name, what) => fillTemplate(readFileSync(join(root, "design-system", name), "utf8"), { light: env.light, dark: env.dark, version: pkg.version }, what);
    put("README.md", tpl("README.md", "README.md"));
    put("assets/Logos/README.md", tpl("logos-README.md", "logos-README.md"));
    const svgRecords = {};
    for (const f of Object.keys(ASSETS)) {
      const svg = cleanSvg(readFileSync(join(root, "src", "assets", f), "utf8"));
      put(`assets/Logos/${f}`, svg);
      svgRecords[f] = { name: f, blob: "", size: Buffer.byteLength(svg), type: "image/svg+xml" };
    }

    const { files: rendered, failed } = await renderPreviews(pack.dist, previews);
    if (failed.length) log(`previews that did not render (skipped): ${failed.map((f) => f.name).join(", ")}`);
    for (const p of Object.values(rendered)) {
      put(`components/${p.name}/preview.html`, frame(`group="${p.group}" height=${p.height}`, p.html));
      put(`components/${p.name}/README.md`, p.readme.trim() + "\n");
    }
    put("components/Cover/preview.html", readFileSync(join(root, "design-system", "cover.html"), "utf8"));

    // The index. Blob ids of the logos only exist after they are uploaded as artifact assets (a publish step, see docs).
    const now = new Date().toISOString();
    put("design-system.json", JSON.stringify({
      v: 3, layout: "files", createdOnFiles: { v: 1, at: now }, title: "Proshore design system", namespace: "ProshoreUI", libraries: [], sections: {}, groups: ["Logos"],
      assetGroups: { Logos: { name: "Logos", tile: "l", order: Object.keys(ASSETS), files: svgRecords } },
      blobs: {}, docs: { readme: "project/README.md", sections: [] },
      lastChange: { by: "Claude", at: now, via: `repo script export:design-system (@proshore/ui ${pkg.version}), not CI`, note: "Generated mirror of the repo; the repo is the source of truth" },
    }, null, 1) + "\n");

    // Validate before writing anything the type would reject.
    const problems = [];
    for (const [p, c] of files) {
      const s = typeof c === "string" ? c : null;
      if (p.endsWith("preview.html")) for (const x of checkPreview(s, { cover: p === "components/Cover/preview.html" })) problems.push(`${p}: ${x}`);
      if (p.endsWith(".svg")) for (const x of checkSvg(s)) problems.push(`${p}: ${x}`);
      const bytes = typeof c === "string" ? Buffer.byteLength(c) : c.length;
      if (bytes > CAPS.fileBytes) problems.push(`${p}: ${bytes} bytes exceeds ${CAPS.fileBytes}`);
      if (p.endsWith(".svg") && bytes > CAPS.svgBytes) problems.push(`${p}: svg over 2 MB`);
    }
    if (files.size > CAPS.files) problems.push(`${files.size} files exceed the cap of ${CAPS.files}`);
    const colorLeft = JSON.stringify(tokensJson).match(/var\(|color-mix/g);
    if (colorLeft) problems.push("tokens.json still contains var() or color-mix()");
    if (problems.length) throw new Error("The generated system breaks the type's rules:\n  " + problems.join("\n  "));

    for (const [p, c] of files) { const f = join(PROJECT_DIR, p); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, c); }
    const total = [...files.values()].reduce((a, c) => a + (typeof c === "string" ? Buffer.byteLength(c) : c.length), 0);
    const report = {
      generatedFrom: `@proshore/ui ${pkg.version}`,
      counts: { color: tokens.color.length, type: tokens.type.length, spacing: tokens.spacing.length, radius: tokens.radius.length, shadow: tokens.shadow.length, files: files.size, bytes: total },
      previewsRendered: Object.keys(rendered), previewsFailed: failed,
      skippedTokens: skipped, note: "Skipped tokens are in the source CSS but are not exported to the mirror, with the reason.",
    };
    writeFileSync(join(OUT_DIR, "report.json"), JSON.stringify(report, null, 1) + "\n");
    return { report, files, tokens, tokensJson };
  } finally { pack.cleanup(); }
}

async function main() {
  const { report } = await buildProject({ log: (m) => console.log(m) });
  const c = report.counts;
  console.log(`Design system mirror written to ${relative(process.cwd(), PROJECT_DIR) || PROJECT_DIR}`);
  console.log(`  tokens: ${c.color} colour, ${c.type} text styles, ${c.spacing} spacing, ${c.radius} radius, ${c.shadow} shadow`);
  console.log(`  previews: ${report.previewsRendered.join(", ")}`);
  console.log(`  files: ${c.files}, ${(c.bytes / 1024).toFixed(0)} kB total (caps: ${CAPS.files} files, 15 MiB per file)`);
  const byReason = {};
  for (const s of report.skippedTokens) (byReason[s.reason.split(":")[0].replace(/\(.*$/, "").trim()] ??= []).push(s.name);
  console.log(`  skipped tokens: ${report.skippedTokens.length} (full list with reasons in ${relative(process.cwd(), join(OUT_DIR, "report.json"))})`);
  for (const [r, n] of Object.entries(byReason)) console.log(`    - ${r}: ${n.length}`);
  console.log("Not published. See docs/claude-design-system.md for the manual publish step.");
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((e) => { console.error(`\nexport:design-system failed: ${e.message}`); process.exit(1); });
}

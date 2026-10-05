// Tests for the Claude design system mirror. No network. Needs a packed build (the root script `test:export` runs `npm run pack` first).
//   node --test packages/ui/scripts/export-design-system.test.mjs
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { before, describe, test } from "node:test";
import { CAPS, PROJECT_DIR, buildProject, checkPreview, checkSvg, cleanSvg, matchSelector } from "./export-design-system.mjs";

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const flat = (v, theme) => (typeof v === "string" ? v : v[theme] ?? v.light);
let run;
let byName;
before(async () => { run = await buildProject(); byName = new Map(run.tokensJson.color.tokens.map((t) => [t.name, t])); });

describe("token cascade", () => {
  test("light and dark resolve differently for known tokens", () => {
    assert.deepEqual(byName.get("pr-canvas").value, { light: "#f4f5fc", dark: "#121212" });
    assert.equal(flat(byName.get("pr-surface").value, "dark"), "#1e1e1e");
    assert.equal(flat(byName.get("pr-surface").value, "light"), "{pr-white}");
    assert.equal(byName.get("pr-accent-text").value, "{accent-11}"); // same alias in both themes collapses to one string
    assert.equal(flat(byName.get("accent-11").value, "light"), "{pr-lapis}");
    assert.equal(flat(byName.get("accent-11").value, "dark"), "{pr-lapis-lighter}");
    assert.equal(flat(byName.get("gray-12").value, "dark"), "#ececec");
  });
  test("the later, more specific dark rule beats the earlier navy one", () => {
    assert.notEqual(flat(byName.get("gray-1").value, "dark"), "{pr-clear-blue-darkest}");
    assert.equal(flat(byName.get("gray-1").value, "dark"), "#121212");
  });
  test("selector matching: specificity and scope", () => {
    assert.deepEqual(matchSelector(":root", "dark"), [0, 1, 0]);
    assert.deepEqual(matchSelector(':root[data-theme="dark"]', "dark"), [0, 2, 0]);
    assert.equal(matchSelector(':root[data-theme="dark"]', "light"), null);
    assert.equal(matchSelector(".pr-btn", "light"), null);
    assert.equal(matchSelector('[data-surface="inverse"]', "dark"), null);
  });
  test("every alias points at an existing colour token and is not self-referencing", () => {
    for (const t of byName.values()) for (const v of typeof t.value === "string" ? [t.value] : Object.values(t.value)) {
      const m = /^\{(.+)\}$/.exec(v);
      if (m) { assert.ok(byName.has(m[1]), `${t.name} aliases missing ${m[1]}`); assert.notEqual(m[1], t.name); }
    }
  });
});

describe("tokens.json shape", () => {
  const text = () => readFileSync(join(PROJECT_DIR, "tokens.json"), "utf8");
  test("no var() or color-mix anywhere", () => { assert.ok(!/var\(|color-mix/.test(text())); });
  test("names are valid and unique across families", () => {
    const j = JSON.parse(text());
    const names = [...j.color.tokens, ...j.spacing.tokens, ...j.radius.tokens, ...j.shadow.tokens, ...j.type.groups.flatMap((g) => g.styles)].map((t) => t.name);
    assert.equal(new Set(names).size, names.length, "duplicate token name");
    for (const n of names) assert.match(n, /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/);
  });
  test("colour values are hex, rgb(a) or an alias", () => {
    for (const t of byName.values()) for (const v of typeof t.value === "string" ? [t.value] : Object.values(t.value)) assert.match(v, /^(#[0-9a-f]{3,8}|rgba?\([\d.,\s%]+\)|\{[\w.-]+\})$/i, `${t.name}: ${v}`);
  });
  test("every token has a non-empty usage note", () => {
    const j = JSON.parse(text());
    const all = [...j.color.tokens, ...j.spacing.tokens, ...j.radius.tokens, ...j.shadow.tokens, ...j.type.groups.flatMap((g) => g.styles)];
    for (const t of all) assert.ok(t.usage && t.usage.length > 10, `${t.name} has no usage note`);
  });
  test("skipped tokens are reported with a reason", () => {
    assert.ok(run.report.skippedTokens.length > 0);
    for (const s of run.report.skippedTokens) assert.ok(s.name && s.reason);
    assert.ok(!run.report.skippedTokens.some((s) => s.name.startsWith("sherpa-")), "the old --sherpa-* aliases no longer exist, so nothing is skipped for them");
  });
});

describe("previews", () => {
  const previews = () => walk(join(PROJECT_DIR, "components")).filter((f) => f.endsWith("preview.html"));
  test("there is a cover and the fixed previews", () => {
    const names = previews().map((f) => f.split("/").at(-2));
    assert.ok(names.includes("Cover") && names.includes("Button") && names.includes("DataTable"));
  });
  test("no script, iframe or comment beyond the marker", () => {
    for (const f of previews()) {
      const html = readFileSync(f, "utf8");
      const cover = f.endsWith("Cover/preview.html");
      assert.deepEqual(checkPreview(html, { cover }), [], f);
      assert.ok(!/<script|<iframe/i.test(html));
    }
  });
  test("the checker rejects forbidden constructs", () => {
    assert.ok(checkPreview('<!-- @dsCard group="A" height=10 -->\n<script>1</script>').length);
    assert.ok(checkPreview('<!-- @dsCard group="A" height=10 -->\n<iframe></iframe>').length);
    assert.ok(checkPreview('<!-- @dsCard group="A" height=10 -->\n<!-- note --><p>x</p>').length);
    assert.ok(checkPreview("<p>no marker</p>").length);
    assert.deepEqual(checkPreview('<!-- @dsCard group="A" height=10 -->\n<p>x</p>'), []);
  });
});

describe("files and caps", () => {
  test("file count and sizes are under the caps; layout is as the type expects", () => {
    const files = walk(PROJECT_DIR);
    assert.ok(files.length <= CAPS.files);
    for (const f of files) assert.ok(statSync(f).size <= CAPS.fileBytes, f);
    for (const p of ["design-system.json", "tokens.json", "README.md", "components/bundle.css", "components/Cover/preview.html", "fonts/geist-latin-wght-normal.woff2", "fonts/geist-mono-latin-wght-normal.woff2", "assets/Logos/README.md"])
      assert.ok(files.includes(join(PROJECT_DIR, p)), `missing ${p}`);
    assert.ok(!readFileSync(join(PROJECT_DIR, "components/bundle.css"), "utf8").includes("@font-face"));
  });
  test("the index carries the marker and the logo records", () => {
    const j = JSON.parse(readFileSync(join(PROJECT_DIR, "design-system.json"), "utf8"));
    assert.equal(j.layout, "files"); assert.ok(j.createdOnFiles);
    assert.deepEqual(j.assetGroups.Logos.order.sort(), ["proshore-icon-orange.svg", "proshore-wordmark-blue.svg"]);
  });
  test("logo SVGs are well-formed and have no XML prolog or comment", () => {
    for (const f of walk(join(PROJECT_DIR, "assets/Logos")).filter((x) => x.endsWith(".svg"))) {
      const svg = readFileSync(f, "utf8");
      assert.deepEqual(checkSvg(svg), [], f);
      assert.ok(!/<\?xml[^>]*iso-8859-1/i.test(svg));
      assert.ok(!svg.includes("Adobe Illustrator"));
    }
  });
  test("cleanSvg and checkSvg", () => {
    const dirty = '<?xml version="1.0" encoding="iso-8859-1"?>\n<!-- Generator: Adobe Illustrator -->\n<svg xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0"/></g></svg>\n';
    assert.ok(checkSvg(dirty).length);
    assert.deepEqual(checkSvg(cleanSvg(dirty)), []);
    assert.ok(checkSvg("<svg><g></svg>").length);
  });
});

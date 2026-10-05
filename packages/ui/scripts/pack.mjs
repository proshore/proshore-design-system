// Builds the installable core tarball of @proshore/ui:  npm run pack -w @proshore/ui
// Output: <repo>/release/proshore-ui-<version>.tgz  (also unpacked in packages/ui/.pack for inspection)
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(root, "../..");
const pack = join(root, ".pack");
const dist = join(pack, "dist");
const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, stdio: "inherit" });
const src = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

rmSync(pack, { recursive: true, force: true });
console.log("1/6 library build");
run("npx", ["vite", "build", "-c", "vite.lib.config.ts", "--logLevel", "warn"]);
console.log("2/6 type declarations");
run("npx", ["tsc", "-p", "tsconfig.pack.json"]);

console.log("3/6 fonts out of the stylesheet");
let css = readFileSync(join(dist, "styles.css"), "utf8");
mkdirSync(join(dist, "fonts"), { recursive: true });
let fontCount = 0;
css = css.replace(/url\(data:font\/woff2;base64,([A-Za-z0-9+/=]+)\)/g, (_m, b64) => {
  const buf = Buffer.from(b64, "base64");
  const name = `font-${createHash("sha1").update(buf).digest("hex").slice(0, 10)}.woff2`;
  writeFileSync(join(dist, "fonts", name), buf); fontCount++;
  return `url(./fonts/${name})`;
});

console.log("4/6 guard: no product-specific styles in the package");
const leaked = ["ask__", "dec__", "sevbar", "app-tile", "sherpa-trail", "flow__"].filter((k) => css.includes(`.${k}`));
if (leaked.length) { console.error("Product-specific CSS found in the package:", leaked.join(", ")); process.exit(1); }
writeFileSync(join(dist, "styles.css"), css);
console.log(`   styles.css ${(css.length / 1024).toFixed(0)} kB, ${fontCount} font files`);

console.log("5/6 package metadata, instructions for Claude, reference");
const pkg = {
  name: src.name, version: src.version, description: "Proshore design system, core: tokens, layout, forms, tables, charts, overlays, icons. Product-neutral.",
  type: "module", license: "UNLICENSED", private: false,
  repository: { type: "git", url: "git+https://github.com/proshore/proshore-design-system.git" },
  publishConfig: { registry: "https://npm.pkg.github.com", access: "restricted" },
  main: "./dist/index.js", module: "./dist/index.js", types: "./dist/types/entry.d.ts",
  sideEffects: ["**/*.css"],
  exports: { ".": { types: "./dist/types/entry.d.ts", import: "./dist/index.js" }, "./styles.css": "./dist/styles.css", "./tokens.json": "./tokens/tokens.json", "./package.json": "./package.json" },
  bin: { "proshore-ui-init": "./claude/init.mjs" },
  files: ["dist", "claude", "tokens", "README.md"],
  peerDependencies: { react: src.peerDependencies.react, "react-dom": src.peerDependencies["react-dom"] },
  dependencies: Object.fromEntries(Object.entries(src.dependencies).filter(([k]) => !k.startsWith("@fontsource"))),
};
writeFileSync(join(pack, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
cpSync(join(root, "README.pack.md"), join(pack, "README.md"));
cpSync(join(root, "claude"), join(pack, "claude"), { recursive: true });
cpSync(join(root, "tokens"), join(pack, "tokens"), { recursive: true });
run("node", ["scripts/gen-reference.mjs", join(pack, "claude", "skills", "proshore-ui", "reference")]);

console.log("6/6 npm pack");
mkdirSync(join(repo, "release"), { recursive: true });
run("npm", ["pack", "--pack-destination", join(repo, "release")], pack);
console.log("done:", readdirSync(join(repo, "release")).filter((f) => f.endsWith(".tgz")).join(", "));

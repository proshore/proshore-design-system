# Installable design-system package (29 Sep to 5 Oct 2026)

Jeroen wants to reuse this interface in another internal project (a billing app) and have Claude follow it there. Decisions: delivery as an installable tarball; Claude instructions included; **core only**, nothing Discovery-specific.

## What you get
`release/proshore-ui-0.1.0.tgz` (about 310 kB). Build it again after any change to `packages/ui`:
```bash
npm run pack -w @proshore/ui
```
Pipeline (`packages/ui/scripts/pack.mjs`): library build of `src/core.ts` with Vite (JS plus one stylesheet), TypeScript declarations for the core files only, fonts moved out of the stylesheet into real files, CSS of the left-out Discovery components removed, a distribution `package.json`, README, tokens, the Claude instructions and a generated component and token reference, then `npm pack`.

## In the package (core)
Tokens in light and dark (standard dark grey), layout primitives, forms, `DataTable` (TanStack state), charts (visx), `SlideOver`, tabs, breadcrumbs, stepper, timeline, notes, toasts, the header family (`AppHeader`, `WorkspaceSwitcher`, `UserMenu`), 32 icons, Proshore brand marks, `Avatar`, `ClientMark`, `Ridgeline` and `PrayerFlags`, Geist fonts. Peer dependencies: React and React DOM 19.
## Not in the package (stay in Discovery)
Evidence, coverage and severity badges, `ProcessFlow`, the app launcher and the Sherpa suite icons, the Sherpa guide, and everything in `apps/discovery`. The entry list is `packages/ui/src/core.ts`; `src/index.ts` (the full set) is what Discovery uses. Keep both in step when adding components.
Wording changed to be generic in the core: chart no-data text is "No data" (was "No evidence"); examples in comments are about invoices and revenue. Charts: the second series colour is now teal (it was saffron orange). Token names still start with `--sherpa-`.

## Use in another project
```bash
npm install /path/to/proshore-ui-0.1.0.tgz
npx proshore-ui-init
```
`proshore-ui-init` copies the skill to `.claude/skills/proshore-ui/` and adds a marked section to `CLAUDE.md` (run again after upgrades; it replaces only its own section). Then start a new Claude session in that project. The skill (`claude/skills/proshore-ui/SKILL.md`) covers set-up, page patterns, components, visual rules, accessibility testing, money and table suggestions, and what to do when a component is missing, with generated `reference/components.md` and `reference/tokens.md`.

## Verified
Built a clean consumer project in `/tmp` (React 19, Vite, TypeScript) and installed the tarball: `npx proshore-ui-init` created the skill and the CLAUDE.md section, and running it twice leaves one section; `tsc` and `vite build` pass against the shipped types; a billing page built only from the package (stat cards, bar chart with legend and table view, invoices table with filters and paging, a form, a detail drawer, light and dark toggle) renders correctly with the Geist fonts loaded, the dark canvas at rgb(18,18,18), and axe (WCAG 2.2 AA and best practice) reports no violations in light, dark and with the drawer open. Repo gate still passes (`npm run check`, 52 browser tests). Two real bugs were found and fixed by that consumer test: chart styles were dropped from the library build, and some Discovery-only CSS leaked in.
## Not verified
Installing from a registry or Git (only the file tarball); consumers on Webpack, Next.js or other bundlers (only Vite); React Server Components; the Claude skill in a real billing session (it was installed but not exercised by a fresh Claude session); versioning and upgrade notes beyond "reinstall and rerun init"; licence terms (marked UNLICENSED, internal); how the billing app's own routing and shell should look (no shell is shipped: Jeroen did not select the app-shell starter).
## Known weaknesses
Prototype quality (0.1.0). Chart components still have a "coverage" concept (none, partial) with the strings "No data" and "at least", which is a Discovery heritage but works generically. The package pulls in React Aria, TanStack Table and visx as dependencies (about 200 kB gzipped in a full-page consumer bundle).

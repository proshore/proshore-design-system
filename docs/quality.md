# Quality gates and performance (29 Sep 2026)

## One command
`npm run check` runs, in order: typecheck (all workspaces), production build, unused-code check (knip, `knip.json`), and the browser tests (Playwright driving the installed Chrome against the production build, `apps/discovery/e2e/quality.spec.ts`). Individual: `npm run typecheck`, `npm run build`, `npm run unused`, `npm run test:e2e`. Needs Google Chrome installed; no browser download.

## What the 46 browser tests guard
- Accessibility (axe-core, WCAG 2.0 A/AA, 2.1 AA, 2.2 AA and best practice): 13 screens x light and dark = 26 tests. Screens: Overview, Landscape, Findings, Evidence, Decision, Setup, Design, both labs, four app placeholder pages.
- Overlays (finding drawer, command palette, Ask Sherpa) accessible in light and dark; drawer closes on navigation; the app rail marks the current app and switches apps.
- No horizontal overflow at 390px on each of the 13 screens; no console errors while browsing all screens.
- Dark theme is the standard dark grey (canvas rgb(18,18,18)); the saved theme is applied before the app code runs (no light flash).
The accessibility gate was checked with a deliberate low-contrast canary and failed as it should (canary removed). Three consecutive full runs passed; one earlier run failed because a single test visited 13 pages within the 30s limit, so it was split per screen.
Not covered by tests: visual appearance (no screenshot comparison, on purpose: it is brittle and needs a baseline you approve), keyboard focus order, screen readers, real touch, other browsers, performance budgets in CI.

## Performance (production build, gzip)
| | Before | After |
| --- | --- | --- |
| JavaScript needed for the first screen | 308 kB (one file of 1,014 kB) | **157 kB** |
| All JavaScript, all screens | 308 kB | 312 kB in 19 chunks, the rest loads on demand or in idle time |
| CSS | 18 kB | 17 kB (15 kB main, 2 kB table, loaded with Findings) |
| Fonts | 51 kB (latin sans and mono) | unchanged |
Measured in the browser on the production build: first screen pulls about 159 kB of JavaScript; Findings, the table and the drawer are fetched quietly when the browser is idle (about 112 kB more) so navigating feels instant.
What changed: Findings (TanStack table), Setup, Design library, both labs, the finding drawer, Ask Sherpa and the command palette now load on demand (`React.lazy`, prefetch on idle for Findings and the drawer); a "Loading…" status shows while a screen loads; the Radix icon package was replaced by the 32 icons we use (`packages/ui/src/icons.tsx`, MIT, Radix Icons); the theme is set by a tiny inline script in `index.html` before first paint.
Not measured: real-network load times (pilot is a local demo, so network tuning such as caching headers and preloads was skipped on purpose), interaction smoothness of tables with many rows (only 40 demo rows exist), memory, Lighthouse scores.
Where the remaining weight is: React DOM about 140 kB min, React Aria (menus, popovers, forms) about 40% of the rest. Cutting further would mean replacing React Aria pieces, which is not worth the accessibility risk.

## Cleanup done
Removed about 3.5 kB of dead CSS (an old sidebar shell, drawer, hero, bento and lift classes, old header classes), unused exports and fixtures, an undeclared dependency now declared (`react-aria-components` in Discovery), the unused Radix icons dependency. Bake-off and chart-spike apps are excluded from the unused-code check and still build.

## Small fixes from the UX and consistency review
Tap targets: logo link in the rail (was 22px wide, now 40px), evidence links on Decision (21px tall, now 24px), rows-per-page selector (now the larger size). Text: nothing below 12px any more (11px labels raised; the smallest text token is `max(12px, .75rem)`). Audit: after these, no visible interactive element on Overview, Findings, Decision or Setup is under 24px (React Aria's hidden Dismiss buttons and its hidden native select excluded).

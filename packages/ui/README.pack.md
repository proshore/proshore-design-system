# @proshore/ui (core)

The Proshore design system for internal tools and customer portals: design tokens (light and dark), layout primitives, forms, tables with search, filters and sorting, charts, drawers, toasts, icons and the Proshore brand marks. Product-neutral: it contains none of the Sherpa Discovery specifics (evidence, coverage and severity badges, journey flow, app launcher, Ask Sherpa).

Built on React 19, React Aria Components (accessibility and behaviour), TanStack Table (table state) and visx (chart scales and axes). Fonts (Geist, Geist Mono) are included.

## Install
```bash
echo "@proshore:registry=https://npm.pkg.github.com" >> .npmrc   # once per project
npm install @proshore/ui                                         # needs a GitHub token with read:packages
npx proshore-ui-init          # installs the Claude skill and CLAUDE.md section into this project
```
Needs React and React DOM 19 (peer dependencies). The package is ES modules with TypeScript types.

## Use
```tsx
import "@proshore/ui/styles.css";                       // once, at the app root
import { ProshoreTheme, Page, PageHeader, Section, DataTable } from "@proshore/ui";
```
Wrap the app in `ProshoreTheme appearance="light" | "dark"`. See `claude/skills/proshore-ui/SKILL.md` for the full set-up, page patterns and rules, and `claude/skills/proshore-ui/reference/` for every component and token.

## What is inside
Theme and tokens; layout (`Page`, `PageHeader`, `Section`, `Grid`, `Stack`, `Cluster`, `Panel`, `StatCard`, `KeyValue`); forms; `DataTable`; charts (`ChartCard`, `BarChart`, `TrendLine`, `StackedBar`, `Sparkline`); `SlideOver`, `Tabs`, `Breadcrumbs`, `Stepper`, `Timeline`, `Note`, `toast`; the header family (`AppHeader`, `WorkspaceSwitcher`, `UserMenu` with sign out and switch account) and `SignInScreen` (Google Workspace sign-in, Proshore staff only); 32 icons; `ProshoreIcon`, `ProshoreWordmark`, `Avatar`, `ClientMark`; brand motifs `Ridgeline` and `PrayerFlags`.

## Using it with Claude
`npx proshore-ui-init` copies the skill to `.claude/skills/proshore-ui/` and adds a marked section to `CLAUDE.md`. Run it again after upgrading the package to refresh both. Start a new Claude session afterwards.

## Upgrading
Update the version, run `npx proshore-ui-init`, run your tests. The component and token reference is regenerated for every build.

## Known limits
Pre-1.0: minor versions may break (see the changelog). Published to GitHub Packages (private). Visual regression tests run in the source repository. English only (no translations), chart wording for missing data is "No data" and "at least". Design tokens are CSS variables starting with `--pr-` (the old `--sherpa-` names still work in 0.4.x and are removed in 0.5.0; migrate by replacing `--sherpa-` with `--pr-`). Accessibility target is WCAG 2.2 AA, checked with axe in light and dark on the source application; check your own screens too.

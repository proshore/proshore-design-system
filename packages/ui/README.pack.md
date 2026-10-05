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
Wrap the app in `ProshoreTheme appearance="light" | "dark"`. See `claude/skills/proshore-ui/SKILL.md` for the full set-up, page patterns and rules, and `claude/skills/proshore-ui/reference/` for every component and token. The gallery also has an **API reference** page (`#/api`) with every export, its props, defaults, types, description and a usage snippet, generated from the same source. Write an `@example` tag in a component's JSDoc to control its snippet.

## What is inside
Theme and tokens; layout (`Page`, `PageHeader`, `Section`, `Grid`, `Stack`, `Cluster`, `Panel`, `StatCard`, `KeyValue`); forms; `DataTable`; charts (`ChartCard`, `BarChart`, `TrendLine`, `StackedBar`, `Sparkline`); `SlideOver`, `Tabs`, `Breadcrumbs`, `Stepper`, `Timeline`, `Note`, `toast`; the header family (`AppHeader`, `WorkspaceSwitcher`, `UserMenu` with sign out and switch account) and `SignInScreen` (Google Workspace sign-in, Proshore staff only); 32 icons; `ProshoreIcon`, `ProshoreWordmark`, `Avatar`, `ClientMark`; brand motifs `Ridgeline` and `PrayerFlags`.

## Language (English and Dutch)
The built-in text (pagination, table toolbar, sign-in, status pages, dialog buttons, aria labels, chart wording) comes from a message catalogue in English (`en`, the default) and Dutch (`nl`). Without a provider everything is English, so existing apps do not change.
```tsx
import { I18nProvider, useMessages } from "@proshore/ui";

<I18nProvider locale="nl">                       {/* strings in Dutch; dates and numbers follow nl too */}
  <App />
</I18nProvider>

// Change single strings for one app (partial; define the object outside the component so it stays stable):
const wording = { pagination: { label: "Pages" }, table: { exportCsv: "Download CSV" } };
<I18nProvider locale="nl" messages={wording}>...</I18nProvider>

// Inside your own components:
const { t, locale } = useMessages();
t("pagination.page", { page: 2, pageCount: 8 });   // "Pagina 2 van 8"
```
`locale` is a BCP 47 tag ("nl", "nl-NL", "en-GB"); the language is the part before the dash, anything without a catalogue shows English. `LocaleProvider` is the same component under its old name. Props you pass (`label`, `placeholder`, `confirmLabel`, `title` ...) still win over the catalogue. Text your app passes in (column headers, `noun`, titles, chart series labels, `SEVERITY_SERIES` labels) is yours to translate. `barTable` and `trendTable` take the translator as last argument: `barTable(series, data, false, t)`. `UserMenu` has an optional `language` prop (value, options, onChange) for a language switch; the app keeps the state. Keys: see `src/i18n/messages.ts`; `npm run test:i18n` checks that every language has the same keys and placeholders.

## Using it with Claude
`npx proshore-ui-init` copies the skill to `.claude/skills/proshore-ui/` and adds a marked section to `CLAUDE.md`. Run it again after upgrading the package to refresh both. Start a new Claude session afterwards.

## Upgrading
Update the version, run `npx proshore-ui-init`, run your tests. The component and token reference is regenerated for every build.

## Known limits
Pre-1.0: minor versions may break (see the changelog). Published to GitHub Packages (private). Visual regression tests run in the source repository. Built-in text is English and Dutch only (see Language); number formatting inside charts is still `en`. Design tokens are CSS variables starting with `--pr-` (the old `--sherpa-` names still work in 0.4.x and are removed in 0.5.0; migrate by replacing `--sherpa-` with `--pr-`). Accessibility target is WCAG 2.2 AA, checked with axe in light and dark on the source application; check your own screens too.

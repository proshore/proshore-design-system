# Build vs buy: libraries for a long-lived shared design system

Written 29 Sep 2026. Facts (latest version, last publish, React peer range, licence) were read from the npm registry on that date. Judgements on accessibility and fit are mine and have **not** been tested in this codebase yet; each recommendation names the spike that would test it.

**Policy:** before hand-building anything non-trivial, propose 2 to 3 libraries with the criteria below and let Jeroen choose. Hand-build only the layer that carries Proshore's design decisions (tokens, wrappers, rules, states), never the commodity engine underneath.

Criteria: actively maintained (last publish), React 19 compatible, licence, accessibility support, theming through CSS variables, bundle size and tree-shaking, escape hatches, lock-in (can we swap it behind our own wrapper).

## Charts

| Option | Version / last publish | React 19 | Licence | Notes |
| --- | --- | --- | --- | --- |
| **Recharts** | 3.10.1 / 21 Sep 2026 | Yes | MIT | React-native components, biggest community, easy theming with CSS variables, good for standard business charts. Weaker for exotic charts and very large data. Verify keyboard and screen-reader behaviour in a spike. |
| **visx** | 4.0.0 / 11 Jun 2026 | Yes | MIT | Low-level primitives on D3. Full design control, best fit if we want charts that look exactly like Proshore. More code to write per chart. |
| **Apache ECharts** (+ echarts-for-react 3.0.6) | 6.1.0 / 19 May 2026 | Wrapper: yes | Apache-2.0 | Most powerful: heatmaps, treemaps, maps, huge data, canvas or SVG, built-in aria and decal patterns. Larger bundle, own styling system (theme JSON), less "React". |
| Nivo | 0.99.0 / 23 May 2025 | Yes | MIT | Nice defaults but no release in over a year at the time of checking. Not recommended for a long-lived base. |
| Observable Plot | 0.6.17 / 6 Apr 2026 | n/a | ISC | Excellent for analysis, not a React component model. |
| Hand-written SVG (what the prototype has now) | n/a | n/a | n/a | Fine for a prototype, not for a shared system: every new chart type, tooltip and edge case is ours to maintain. |

**Superseded by the spike (`docs/chart-spike.md`, 29 Sep 2026): recommendation is now visx primitives under our wrappers, pending Jeroen.** Earlier text: Recharts for the standard set (bar, stacked, line, area), behind our own `Chart*` wrappers so the engine can change. Keep what is ours: `ChartCard`, legend rules, the mandatory "view as table", the data-honesty states (partial, no evidence), and the colour tokens. Escalate to ECharts if an app needs heatmaps, maps or very large data. Choose visx instead if the team wants pixel-level custom charts and accepts more code.
**Spike to decide (about a day):** the same three charts (severity by application, scan trend, coverage split) in Recharts and visx; compare keyboard access, screen-reader output, token theming in light and dark, bundle size, and lines of code.

## Other areas where the prototype hand-rolled or hacked something

| Need | Prototype today | Suggested library | Version / last publish | Note |
| --- | --- | --- | --- | --- |
| Table logic (sort, filter, paginate, columns, selection) | hand-written hook, replaced 29 Sep 2026 (filter, facet, sort, visibility; paging and selection stay in-house) | **TanStack Table** | 9.2.4 / 28 Aug 2026, MIT | Headless: we keep our UI, they own the logic and edge cases. |
| Large lists | none | **TanStack Virtual** | 3.14.13 / 14 Sep 2026, MIT | Only needed past about 1,000 rows. |
| Forms and validation | none | **React Hook Form + Zod** | 7.89.0 (26 Sep 2026) / 4.6.5 (25 Sep 2026), MIT | Shared validation between forms and API types. |
| Combobox, command palette | none | **cmdk** | 1.1.1 / 27 Aug 2025, MIT | Last release is a year old but the library is small and stable; alternatives: Radix-based combobox, React Aria. Spike before committing. |
| Toasts | none | **sonner** or Radix Toast | sonner 2.0.8 / 9 Aug 2026 | Radix Toast keeps us on one vendor. |
| Dependency and architecture maps | none | **React Flow (@xyflow/react)** | 12.12.0 / 24 Sep 2026, MIT | Sherpa needs application dependency maps. |
| Drag and drop | none | dnd-kit | 6.3.1 / 5 Dec 2024, MIT | No release in 9 months at time of checking; check maintenance again before adopting. |
| Routing | hand-made hash router (prototype shortcut) | **React Router** | 8.4.0 / 15 Sep 2026, MIT (needs React 19.2.7+) | Replace before any real app. |
| Server data | fixtures | **TanStack Query** | 5.104.0 / 26 Sep 2026, MIT | Caching, loading and error states for the empty/loading patterns. |
| Dates | none | **date-fns** (or Temporal when stable) | 4.4.0 / 29 May 2026, MIT | Use `Intl` for formatting. |
| Translations | none | **i18next** | 26.4.2 / 3 Sep 2026, MIT | Needed if Dutch and English ship together. |
| Docs and visual tests | in-app library page | Storybook, Playwright, axe | not checked | Adopt when a second app consumes the system. |

Not checked and worth a look before deciding: Radix Themes' own long-term roadmap and theming limits, React Aria Components as an alternative to Radix for complex widgets, Style Dictionary for token export, Shiki or CodeMirror for code viewing.

## Base layer candidates (added 29 Sep 2026)

Facts from the npm registry on 29 Sep 2026 (version, last publish, licence, weekly downloads as a rough adoption signal). Fit and accessibility judgements are not tested here.

| Option | Kind | Version / last publish | Licence | Weekly downloads |
| --- | --- | --- | --- | --- |
| React Aria Components (Adobe) | Headless, strongest accessibility focus | 1.21.1 / 29 Sep 2026 | Apache-2.0 | 5.3M |
| Base UI (`@base-ui/react`) | Headless, successor-style to Radix/MUI base | 1.8.0 / 4 Sep 2026 | MIT | 16.8M |
| Ark UI (`@ark-ui/react`) | Headless on Zag state machines | 5.39.2 / 13 Sep 2026 | MIT | 1.1M |
| Radix Themes (current) | Styled | 3.3.0 / 31 Jan 2026 | MIT | 1.0M |
| Radix Primitives (dialog as sample) | Headless | 1.1.23 / 31 Jul 2026 | MIT | 84.6M |
| Mantine | Complete system (components, charts, dates, forms, notifications, spotlight) | 9.6.3 / 26 Sep 2026 | MIT | 2.8M |
| Ant Design | Complete, enterprise admin | 6.6.5 / 20 Sep 2026 | MIT | 4.1M |
| Carbon (IBM) | Complete, data-dense enterprise, has charts package | 1.117.0 / 23 Sep 2026 | Apache-2.0 | 0.17M |
| Primer (GitHub) | Complete, developer tools look | 38.40.0 / 28 Sep 2026 | MIT | 0.07M |
| MUI (Material UI) | Complete, Material look | 9.4.0 / 27 Aug 2026 | MIT | 11.5M |
| Chakra UI v3 | Styled on Ark | 3.37.0 / 28 Aug 2026 | MIT | 1.8M |
| HeroUI | Styled | 3.2.6 / 17 Sep 2026 | MIT | 0.7M |
| AG Grid Community | Data grid (Enterprise edition is paid) | 36.2.0 / 16 Sep 2026 | MIT | 3.8M |

Two ways to be future-ready: (1) own the look, use a headless layer (React Aria Components or Base UI) under our own components and tokens, most work, least lock-in; (2) adopt a complete system and theme it (Mantine or Carbon), fastest, but its look and release cadence become ours to live with. Radix Themes is the least active of the styled options.

## Headless layer rating: React Aria Components vs Base UI vs Radix Primitives (29 Sep 2026)

Ratings are Claude's judgement for Proshore's purpose (business apps, customer portals, WCAG 2.2 AA, English and Dutch), 1 to 5. Component inventories were read from the published packages on 29 Sep 2026; nothing has been built or tested with them yet, so accessibility and effort ratings are unproven until the bake-off.

Verified inventory:
- **React Aria Components 1.21.1:** Calendar, RangeCalendar, DatePicker, DateRangePicker, DateField, TimeField, ComboBox, Autocomplete, Table, Tree, GridList, TagGroup, ColorPicker, Breadcrumbs, Disclosure, FileTrigger, DropZone, Form, Toolbar, Virtualizer, I18nProvider. Toast is exported as `UNSTABLE_Toast` (API may change).
- **Base UI 1.8.0:** Combobox, Autocomplete, Drawer, Toast, NumberField, OTP field, Field/Form, NavigationMenu, ScrollArea, Menu/Menubar, Select, Slider, Tabs, Dialog/AlertDialog and more. No calendar or date picker export (date adapters exist internally), no table, tree, tag group or breadcrumbs.
- **Radix Primitives (64 packages, dialog 1.1.23):** no combobox, date picker, drawer or table.

| Criterion | React Aria | Base UI | Radix Primitives |
| --- | --- | --- | --- |
| Breadth for business apps (dates, combobox, table, tree) | 5 | 3 | 2 |
| Accessibility depth and internationalisation | 5 | 4 | 4 |
| Momentum and backing | 5 (Adobe, release 29 Sep, 5.3M/wk) | 5 (16.8M/wk, 1.8.0) | 3 (primitives active, Themes slow) |
| Freedom to style with our tokens | 4 | 5 | 5 |
| Effort to move from today's Radix Themes | 2 | 3 | 5 |
| Stability of API | 4 (toast still unstable) | 4 (young 1.x) | 5 |

Recommendation: React Aria Components as the primary layer, Base UI as the close second (revisit if its date and table coverage grows), Radix Primitives last for a long-lived system. Caveats: heavier learning curve (collections, keys, slots), Table is accessible markup and behaviour, not a full data grid (pair with TanStack Table for state), and the bundle size is not measured.

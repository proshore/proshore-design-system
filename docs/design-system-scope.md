# Design system scope: what an internal business application needs

Status: proposal for Jeroen to choose from. Written 29 Sep 2026 because this system will serve other Proshore internal applications, not only Sherpa Discovery.

Legend. **Now** = built in the prototype. **WIP** = being built. **Must** = every business app needs it, build before a second app adopts the system. **Should** = most apps need it. **Later** = build when a real app asks. Each row ends with a choice for you.

## 1. Platform decisions (make these first, they shape everything)

| # | Decision | Options | Recommendation |
| --- | --- | --- | --- |
| P1 | Packaging | (a) Copy files per app. (b) Internal package `@proshore/ui` in a monorepo. (c) Published private npm package. | (b), then (c) when a second team consumes it. Copying diverges within weeks. |
| P2 | Base library | Radix Themes + Primitives (now), or headless only (Radix Primitives + own CSS), or Tailwind + shadcn/ui. | Keep Radix Themes for speed, hide it behind our own component names so it can be swapped. Not Tailwind/shadcn (you excluded them). |
| P3 | Tokens source of truth | Webflow/Relume variables, Figma variables, or a token file in code (Style Dictionary / W3C tokens JSON). | Token file in code, exported to CSS variables and to Figma. Webflow stays the marketing source; import from it once, then own it. Reason: apps need semantic tokens Relume lacks (status, density, elevation). |
| P4 | Documentation | This in-app library page, or Storybook. | Storybook once there are more than about 30 components or two consuming apps. Until then the library page plus tests. |
| P5 | Versioning and governance | None, changelog, or semver with an owner and review. | Semver, a named owner, a changelog and a short RFC for new components. |
| P6 | Per-app theming | One look everywhere, or a product accent per app (Discovery, Build, Pulse). | One brand palette, one product accent slot per app. Orange stays "Proshore's hand". |
| P7 | Accessibility target | WCAG 2.1 AA, 2.2 AA, or none stated. | WCAG 2.2 AA, checked in CI with axe plus a manual keyboard and screen-reader pass per component. |
| P8 | Languages and formats | English only, or English + Dutch (+ Nepali). | English and Dutch text ready from day one (no text in images, no concatenated strings), `Intl` for dates, numbers, currency (nl-NL, en-GB). Nepali script and date needs to be checked with the team before promising it. |
| P9 | Browser and device support | Evergreen desktop only, or tablet and phone. | Evergreen browsers, fully usable from 360px wide, designed desktop-first for dense screens. |
| P10 | Quality gates | Manual review only, or automated. | Visual regression (Playwright screenshots), axe, and a token contrast check in CI. |

## 2. Foundations

| Item | Status | Recommendation |
| --- | --- | --- |
| Colour (brand, semantic, evidence, status, chart) | Now (provisional red added) | Must. Add a written contrast table generated from tokens. |
| Typography (Geist, Geist Mono, scale) | Now | Must. Add Relume Mobile sizes and a line-length rule (max 70ch prose). |
| Spacing, grid, breakpoints | Now (layout primitives) | Must. Fix breakpoints at 360 / 720 / 960 / 1240. |
| Radius, borders, elevation | Radius and border now | Must. Define 3 elevation levels (flat, raised, overlay). |
| Icons | Radix icons (partial) | Must. Pick one set and one size scale, and rules for icon-only buttons (always aria-label). Question: keep Radix icons, or Lucide, or a Proshore set? |
| Motion | Slide-over only | Should. Durations 100/200/300ms, easing, reduced-motion rule, no decorative motion. |
| Density (comfortable / compact) | WIP in tables | Should. One global density token, not per component. |
| Dark mode | Now | Must. Keep parity tests. |
| Illustration and imagery | None | Later. The site uses photography and hand-drawn orange marks; define 3 empty-state illustrations and the hand-mark rule. |
| Content and voice | Informal in copy | Must. One page: plain language, no pitch, sentence case, how to word uncertainty ("not yet known", "at least"), error message pattern. Ask for Proshore's tone guide. |

## 3. Layout and navigation

| Item | Status | Recommendation |
| --- | --- | --- |
| App shell (top bar, side nav, content) | Now | Must. Add collapsible nav, nested groups, and a compact icon-rail mode. |
| Page, PageHeader, Section, Grid, Aside, Stack, Cluster, Panel | Now | Must. |
| Breadcrumbs | No | Must for anything deeper than two levels. |
| Tabs (page-level and in-panel) | Radix Tabs in use | Must. Rule: tabs switch views of the same item, links go to other items. |
| Command palette (Ctrl/Cmd+K) and global search | No | Should. High value in internal tools. Question: include? |
| Keyboard shortcuts map | No | Later. |
| Workspace / tenant switcher | Simple select | Should. Needs a real pattern (recent, search, roles). |
| User menu, profile, sign-out | No | Must. Google sign-in exists in the reference app. |
| Responsive nav (drawer on phone) | Partial | Must. |
| Error and system pages (403, 404, 500, maintenance, session expired) | No | Must. |

## 4. Inputs and forms

| Item | Status | Recommendation |
| --- | --- | --- |
| Text, textarea, number, password, search | Radix | Must. One field wrapper: label, hint, error, required, character count. |
| Select, combobox with search, multi-select, tags | Select only | Must. Combobox is the big gap. |
| Checkbox, radio, switch, segmented control | Radix | Must. |
| Date, date range, time | No | Must for business apps. Uses `Intl`, week starts Monday. |
| File upload (drag and drop, progress, limits) | No | Should. |
| Form layout patterns (single column, sections, sticky action bar) | Partial (setup wizard) | Must. |
| Validation pattern (inline on blur, summary on submit, server errors) | Partial | Must. Write the rules once. |
| Autosave and unsaved-changes guard | No | Should. |
| Rich text / markdown editor | No | Later. |
| Wizard (multi-step form) | Now (Stepper) | Must. |
| Inline edit | No | Later. |

## 5. Data display

| Item | Status | Recommendation |
| --- | --- | --- |
| Data table (sort, search, filter, paginate, select, density, columns, export) | WIP | Must. Add virtualisation past ~1,000 rows and saved views. |
| Filter bar and saved filters/views | WIP (filters), saved views no | Must / Should. |
| Charts (bar, stacked, trend, sparkline) | WIP | Must. Later: heatmap, timeline chart, treemap. |
| Stat / KPI card | Now | Must. Always with scope or caveat. |
| Cards, lists, key-value lists | Now | Must. |
| Badges and status (evidence, coverage, severity) | Now | Must. Generalise to a small status system every app can extend. |
| Steps, process flow, timeline / activity log | Now | Must. |
| Tree / hierarchy view, org or dependency graph | No | Should. Sherpa needs a dependency map. Question: build a graph component or use a library? |
| Code and diff viewer | No | Should for engineering tools. |
| Avatar, user chip, presence | No | Should. |
| Empty, loading (skeleton), error, partial-data states | WIP | Must. |
| Kanban / board | No | Later. |
| Calendar / schedule | No | Later. |

## 6. Feedback and overlays

| Item | Status | Recommendation |
| --- | --- | --- |
| Toast, inline alert, banner, callout | Callout only | Must. Rules for which to use when. |
| Dialog (confirm, destructive confirm with typed name) | Partial | Must. |
| Slide-over (detail, prev/next) | WIP | Must. |
| Popover, tooltip, dropdown menu, context menu | Radix | Must. |
| Progress (bar, ring), long-running job pattern | No | Should. Scans take minutes: needs progress, cancel, and background notice. |
| Notifications centre and inbox | No | Should. |
| Onboarding, tour, first-run checklist | Setup checklist | Later. |
| Help, feedback, support entry | No | Should. |

## 7. Business-application patterns

| Pattern | Status | Recommendation |
| --- | --- | --- |
| Roles and permissions in the UI (disabled vs hidden, "why can't I?") | No | Must. UI hiding is never access control; show a reason. |
| Audit trail and change history | Timeline component | Must for advisory and review products. |
| Comments and mentions | No | Should. |
| Approval / review workflow (states, reviewer, date) | Sherpa review states | Must. Generalise the Observed / Inferred / Confirmed / Unknown states to "provenance". |
| Export and print (CSV, PDF, print stylesheet) | CSV in table | Should. |
| Settings and admin pages | No | Must. |
| Data-entry-heavy screens, bulk actions | Table selection | Should. |
| Search results page | No | Later. |
| Sign-in, session expiry, account | No | Must. |
| Notifications by email | No | Later. |

## 8. What I suggest you decide now (six choices)

1. **P1 and P3:** package the system in a monorepo now, with tokens in code. (Yes / no / later)
2. **P2:** keep Radix Themes behind our own component names. (Yes / no)
3. **P4:** in-app library page now, Storybook after the second app. (Agree / Storybook now)
4. **P8:** English and Dutch from day one. (Yes / English only) Nepali: ask the team.
5. **Scope of the first shared release:** Must items only, in this order: forms and combobox, breadcrumbs, toast and alert rules, dialogs, error pages, user menu, roles-in-UI. (Agree / change order)
6. **Sherpa-specific vs shared:** keep the evidence and coverage components in the shared system, generalised as "provenance" and "coverage", or keep them Sherpa-only. My recommendation: shared.

Questions for other Proshore teams: which apps come next, who owns the system, whether Figma is used, and Proshore's tone guide.


## Progress log

- 29 Sep 2026: decisions P1 (monorepo package), P3 (tokens in code), P7 (WCAG 2.2 AA), P8 (English and Dutch), P6 (Proshore brand only) confirmed. Step 1 done: `packages/ui` and `apps/discovery` split, all nine routes verified. Next: TanStack Table under `DataTable`, then the Recharts vs visx spike.

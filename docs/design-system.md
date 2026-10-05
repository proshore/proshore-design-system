# Design-system preview: tokens and components

Status: **provisional mapping of real Proshore values**. Colours, type, radius and spacing come from the Proshore website's Relume variables (Primitives, Color Schemes, Typography, UI Styles, Spacing & Sizing, supplied as screenshots on 29 Sep 2026; not yet cross-checked against Webflow). All content is fictional demo data (Brightfield Foods). Run with `npm run dev` (port 5174) or `npm run build`.

## Stack

- **Radix Themes** 3.3: base components, colour scales, spacing, typography, light/dark. `src/theme/theme.tsx` passes valid Radix scale names (indigo/gray); `src/theme/tokens.css` overrides every scale with Relume values.
- **Radix Primitives**: `@radix-ui/react-dialog` for the finding side panel (focus trap, Esc, focus return). Icons from `@radix-ui/react-icons`.
- Not used: shadcn/ui, Relume, Tailwind.

## Tokens (`src/theme/tokens.css`)

Three layers. Components use only layer 3.

1. **`--pr-*` primitives**: Relume colours copied exactly (Neutral, Saffron, Marigold, Clear Blue, Lapis Blue, Terai Green, each Lightest to Darkest).
2. **Scheme mapping** on `.radix-themes.light` / `.dark` into Radix `--accent-*`, `--gray-*`, `--color-*`.
   - Light follows Relume "Base mode": canvas Clear Blue Lightest, surface White, text Lapis Blue Darker, primary button Lapis Blue Light (#5147ff), accent Saffron.
   - Dark follows the "Alternate / Deep Blue" logic: canvas Clear Blue Darkest, surface Clear Blue Darker, text White, primary button White with Lapis Blue Darker text, borders White 15%.
   - Relume defines few steps per scale, so in-between steps are interpolated (marked in the CSS). Muted text uses Neutral Dark, not Lapis Blue Dark, to keep hierarchy readable (decision to confirm).
3. **`--pr-*` semantic tokens** (named `--sherpa-*` before 0.4.0): evidence states (Observed = Clear Blue, Inferred = Marigold, Confirmed = Terai Green, Unknown = Neutral with dashed border), danger (Saffron), coverage complete/partial/failed, surfaces, review accent (Saffron bar on the Proshore decision).

Typography: Geist (headings and body) and Geist Mono (code, secondary), self-hosted via `@fontsource-variable`. Sizes follow Relume: tiny .75, small .875, regular 1, medium 1.125, large 1.25 rem; heading steps 1.5 to 3 rem. Mobile size mode not implemented yet.
Shape and spacing: radius 8px (Relume small/medium/large), full 9999px, 1px borders; 4/8/16/24/32 spacing; container 1280px; page padding 64px, 20px under 720px.

Rules: colour is never the only signal (icon, text, border style also change). Unknown is dashed. Failed coverage is a double border. Contrast pairs were chosen from the palette's dark and light ends but are not yet measured with a tool.

## Components (`src/components/`)

| File | Responsibility |
| --- | --- |
| `status.tsx` | `EvidenceBadge`, `CoverageBadge`, `SeverityBadge` and their label/hint/icon metadata. Single source for state wording. |
| `DemoTag.tsx` | Marks invented content. |
| `Actions.tsx` | Primary (solid), secondary (outline), quiet (ghost), disabled. One primary per view. |
| `AppShell.tsx` | Workspace selector, engagement question and scope, left nav, coverage badge, contextual Ask Sherpa entry (entry point only; no chat). |
| `ApplicationCard.tsx` | An application with its repos as evidence sources, coverage, mapping review status. Repo is not application. |
| `InsightCard.tsx` | Statement with state, source and reviewer. |
| `CoverageStatus.tsx` | Complete, partial, failed. Never says "no issues" unless complete; partial counts read "at least". |
| `EvidenceTrail.tsx` | Finding, application, capability, potential impact, each with state and reviewer. Unknown links are dashed. |
| `DecisionCard.tsx` | Proshore-reviewed decision: recommendation, alternatives, assumptions, open questions, owner, next action. Accent bar separates advice from generated suggestions. |
| `FindingPanel.tsx` | One finding, Business / Security / Technical tabs on the same record. |
| `FindingDrawer.tsx` | Dialog primitive wrapper that shows the panel as a side drawer; portal is placed inside the themed container so light/dark applies. |
| `Specimen.tsx` | Composes every pattern in one theme; rendered twice (light, dark). |


## Verified vs not

Verified: `npm run build` (tsc + vite) passes; page renders in light and dark; the drawer opens, focus moves into it, Esc closes it and focus returns to the trigger. Not verified: contrast ratios with a tool, screen-reader pass, phone widths beyond a quick look, Ask Sherpa behaviour (not built).


## Critique of the Relume style guide, and what the app does instead (29 Sep 2026)

Sources: the Relume variable screenshots and a visit to proshore.eu (Geist / Geist Mono, periwinkle `#ced5f6` page, pill buttons in `#5147ff`, mono uppercase eyebrow chips, hand-drawn orange annotations, alternating white / periwinkle / navy `#111e5f` bands).

| Issue in the guide | Decision in the app |
| --- | --- |
| Built for marketing pages: 56px headings, weight 400, section paddings up to 112px. | Keep the voice (bold lead phrase, light remainder) only on each page's hero. Dense UI uses the 12 to 20px text steps and 24px gaps. |
| Two oranges: logo `#ff5102`, Saffron `#fa602d`. | Logo orange is the one brand orange (`--pr-brand-orange`). Saffron ramps stay for tints only. |
| Orange fails text contrast on white (about 3.3:1). | Orange is never small text. It is for marks: logo, review accent bar, hand-drawn underline. Text-safe variants `#b82f00` (light) and `#ff9b73` (dark). |
| Orange is both the brand accent and the only red-ish colour, so "critical" would look like "Proshore". | Orange means "Proshore's hand" (reviewed, marked). Danger uses a separate true red, `#9e1027` on `#fdecef` (dark: `#ff9aa8` on `#3d0a14`). The red is a proposed addition, not in Relume. |
| Muted text = Lapis Blue Dark, barely lighter than base text. | Muted text is a navy-tinted gray `#55547f` (light) and `#b8bee3` (dark) so hierarchy is visible. |
| Whole page on `#ced5f6` periwinkle: too saturated for long reading. | Periwinkle is used for the hero band only. The canvas is Clear Blue Lightest, cards are white. |
| No status colours defined. | Evidence and coverage states map to Clear Blue, Marigold, Terai Green, Neutral (dashed) and the danger red. Always icon + label. |
| No dark-mode or elevation guidance. | Dark follows Alternate/Deep Blue: navy canvas, white primary button, 15% white borders. |
| Interaction states, focus and motion undefined. | 2px focus ring, `prefers-reduced-motion` respected, hover lift only on cards. |

Kept from the website because it is distinctive: pill buttons, 8px cards and 4px tags, Geist Mono uppercase labels (used for eyebrows), mixed-weight display heading, the hand-drawn underline (one per view), plain warm copy ("No pitch deck").

Trend choices, used with restraint: calm tinted canvas with one hero band, bento fact cards, side sheets instead of page changes for detail and Ask, source and confidence shown next to every AI-style statement, keyboard-first (skip link, focus return, real links for every screen), full dark parity. Not used: gradients everywhere, glassmorphism, chat-as-homepage.

## App screens (clickable concept)

Routes (`#/overview`, `#/landscape`, `#/findings`, `#/evidence`, `#/decision`, `#/design`). Overview, journey landscape, findings table with side sheet, evidence and coverage, decision, contextual Ask Sherpa (canned demo answers, no live model), theme toggle (saved locally, defaults to the system setting). Also `#/setup` (Proshore-only wizard, see below). Not built yet: comments, export, real data.


## Verified against Webflow (29 Sep 2026)

Read-only check of the Proshore Webflow site (`proshore`, "Style Guide Copy" and Home page): all 60 colour primitives (neutrals, opacities, Saffron, Marigold, Clear Blue, Lapis Blue, Terai Green) match `--pr-*` in `src/theme/tokens.css` exactly. Collections found: Primitives, Color Schemes (Base mode, Lighter, Alternate, Accent, Full Orange, Deep Blue), Typography (Base, Mobile), UI Styles, Spacing & Sizing. The live palette contains no red, which confirms the danger red is an addition. Color Scheme mode values, typography and spacing were not re-read from Webflow; those still rest on the screenshots.


## Proshore setup screen (`#/setup`)

Six steps with a live "Ready to share?" checklist: question and scope, sources, applications, business context, people and access, scan readiness.

- **Sources:** accepts only `owner/repository`. Tokens are refused on purpose (the field rejects anything else with an explanation), matching the rule that credentials stay out of the prototype.
- **Applications:** each repository is assigned to an application. Assignments are labelled "Proposed" until a customer Technical lead confirms them. An unassigned repository blocks publishing.
- **Business context:** every item shows its source (confirmed by customer, Proshore assumption, code-derived and unconfirmed). Read-only in this prototype.
- **People and access:** roster with role, starting screen and permissions. No invitations are sent. The screen states that real access control belongs in the backend.
- **Scan readiness:** lists each check with its true state, including the Semgrep, Gitleaks and Billing gaps. Publishing needs the reviewer to tick that the gaps were reviewed. Publish is a demo: it sends nothing.

Verified in the browser: repository validation, the unassigned-repository block, application assignment through the select, the review checkbox and the publish demo message. Not verified: a full keyboard-only run through every step, screen-reader announcements for the checklist, and phone widths.


## Restructure of 29 Sep 2026 (layout, steps, process, slide-over)

Problem: elements were placed ad hoc, so cards, headers and actions did not share edges. Fix: one layout layer, and every screen is built from it.

| Layer | Components | Rule |
| --- | --- | --- |
| Layout | `Page`, `PageHeader`, `Section`, `Grid`, `WithAside`, `Stack`, `Cluster`, `Panel`, `KeyValue`, `StatCard` (`src/components/layout.tsx`) | Screens set no margins or widths. 24px between blocks in a grid, 32px between sections, 8px inside clusters, 20px card padding. Title left, actions right. |
| Steps | `Stepper` | Progress through ONE task. State by icon, label and marker shape. Buttons when selectable. |
| Process | `ProcessFlow`, `Timeline` | ProcessFlow = steps as columns, applications as swimlanes. Timeline = history (review, scans). |
| Overlay | `SlideOver` (+ `SlideGroup`), `FindingSlideOver`, `AskSherpa` | Fixed anatomy: sticky header with identity, status chips, prev/next, wider, close; scrolling body of groups; sticky footer actions. Modal with focus trap and focus return. |
| Library | `#/design` (`src/app/Library.tsx`) | Each pattern has usage, Do and Don't, and a light/dark compare toggle. |

Ask Sherpa is now a thread: suggested questions, keyword-matched demo answers, a confidence meter with words, clickable sources (findings open in the slide-over), a "cannot see" callout, and an honest "no grounded answer" reply. Tables, filters and charts are in `docs/tables.md` and `docs/charts.md`. What a shared internal design system still needs, with choices to make: `docs/design-system-scope.md`.


## Workspace shell and identity (29 Sep 2026, decisions 48 to 57)

Two layers in the header. **Proshore layer** always: icon and wordmark left, avatar menu right. **Client layer** in an optional slot: a chip with the client logo, client name and engagement name that opens a two-level switcher (client, then engagement). Proshore-only screens add an orange top line and a "Proshore only" tag. Internal apps that are not client-scoped omit the slot.

| Piece | Behaviour |
| --- | --- |
| `ClientMark` | Logo on a white plate so any logo is legible in dark mode; initials fallback; client colours never enter the UI |
| `Avatar` | Profile photo (Google Workspace) with initials fallback, also when the image fails; staff get a small Proshore badge |
| `UserMenu` | Name, email, role and organisation, appearance (system, light, dark). In the prototype also a "Demo: view as" switch between a Proshore consultant and three client roles |
| `useDocumentIdentity` | Title `Client · Sherpa Discovery`; favicon is the client logo with a small Proshore badge, drawn on a canvas |

In the prototype a client user does not see Setup or the design library; opening them directly shows an access page. This is illustration only: real access is enforced by the backend. The overview highlights the entry card for the user's role ("Suggested for you") but never hides evidence.

Built on React Aria `MenuTrigger`, `Menu`, `Popover`. Verified 29 Sep: the menu portals to the page body outside the Radix wrapper and renders fully styled in light and dark, which confirms the page-level tokens (decision 44). Verified: persona switch changes nav, welcome text and highlighted card; direct navigation to Setup as a client shows the access page; favicon renders the client logo with the Proshore badge at 128 and 32 px. Not verified: axe scan of the new header, keyboard use with real key events, a real Google profile photo, the favicon in a real browser tab strip, narrow-phone layout beyond the CSS.


## Pilot polish (29 Sep 2026)

Scope: the four pilot screens (decision 55): Overview, Landscape, Findings with detail, Decision.

- **One dataset behind every number.** The overview counts, the severity bar, the per-application counts, the journey "N to review" links and the nav badge all derive from the same 40 demo findings (`fixtures/derived.ts`). Before this, the overview said "at least 4" while the table showed 40. No findings are attributed to Billing, because its scan failed: unknown, not zero.
- **Findings page** now uses the shared `DataTable`: search with highlight, sort (shift-click for a second key), filters with counts per option, filter chips, paging, column visibility, density, CSV export, and an honest "list is incomplete" banner. The slide-over's previous/next follows the exact filtered and sorted list on screen (`onRowOpen(row, visibleRows)`).
- **Overview** gains a severity split (`StackedBar`) with its partial-coverage caveat and a view-as-table alternative. The headline is computed from the data.
- **`Note`** component replaces Radix amber and green callouts, which failed contrast; the table's partial-scan banner uses it.
- **Fixes found by the scans:** skipped heading level on Decision; unlabeled generic element with `aria-label` on the application card (now a list); overlapping ghost icon buttons in the slide-over toolbar (target size); Radix alpha colour steps 9 to 12 leaking into outline buttons (now mapped to our scales); a grid bug that pushed page content down about 380px below 900px width.

### Verification (29 Sep 2026, dev server, Chrome in the Browser pane)
- axe-core (WCAG 2 A/AA, 2.1 AA, 2.2 AA, best practice) on Overview, Landscape, Findings, Decision in light and dark: 0 violations after the fixes above. Findings light and dark with the slide-over open: 0 violations in light; in dark, axe still reports the table text behind the modal overlay (dimmed by the overlay), which I judge a false positive but did not prove.
- My own contrast pass over all visible text on the four screens, both themes: no pair below 4.5:1 (3:1 for large text). It approximates display-p3 colours as sRGB.
- Search, filter chip, result count, and slide-over 1-of-N following the filtered list confirmed.
- **Not verified:** screen readers, keyboard use with real key events, phone widths (only a 893px window and the CSS), Safari and Firefox, contrast of everything axe leaves "incomplete" beyond my own pass, and the Ask Sherpa panel in dark beyond the axe run.


## Visual system v2 (29 Sep 2026): Concept C with Concept A's table

Chosen by Jeroen after three static concepts (`docs/concepts/a.html`, `b.html`, `c.html`, open the files locally). His critique of v1: too many boxes, borders and empty padding; colour and contrast; typography and hierarchy. Bar: Linear and Stripe. Customer screens editorial, tables compact.

What changed:
- **Shell:** navy sticky header (Proshore mark, client chip, top navigation, Proshore menu for staff, Ask Sherpa, avatar). No sidebar. Proshore-only screens keep the orange top line. Partial-scan status left the header (it lives in the page, once).
- **Hero band:** every page starts with a navy band (`PageHeader` for working screens, `PageHero` for landing screens). Content can overlap the band (`Page pull`). Inverse surfaces flip tokens (`data-surface="inverse"`), so components inside need no overrides.
- **Cards:** soft shadow, 16px radius, no borders. Canvas `#f4f5fc` (dark `#0b1340`).
- **Type:** display heading light with a bold lead phrase; section titles 30px semibold with a mono eyebrow above; stat numbers 46px bold.
- **Proshore's view:** one periwinkle band with the orange bar, used on Overview and Decision.
- **Severity:** one sequence (red, orange, amber, blue, grey) as `--sev-*` tokens with matching text colours, flat bar with counts inside plus a text legend. Partial coverage is stated in words, not by hatching the data.
- **Findings table (Concept A):** hairline rows, semibold titles, mono uppercase headers, dot and short label for severity, dashed pill filters, one export button, partial-scan strip inside the card. Density and column controls are off for the pilot.
- **Fixes:** desktop layout scramble after the header change; header overflow on Proshore-only pages; nav row stretch on phones; table no longer scrolls inside itself.

Verified 29 Sep at 1440 px, light and dark, and 390 px: all nine routes render without console errors and without horizontal page scroll; axe-core reports 0 violations on Overview, Landscape, Findings and Decision in both themes; my own contrast pass reports only the hero eyebrow measured against the brightest gradient stop (changed to a lighter colour). Not verified: real devices, Safari and Firefox, screen readers, keyboard-only use with real key events, phone layouts of Setup and the design library, and the slide-over and Ask Sherpa panel on the new look beyond one dark screenshot.


## Core primitives on React Aria (29 Sep 2026)

`Button` (solid, soft, outline, ghost; sizes 1 to 3; `href` renders a real link), `IconButton` (aria-label required), `Tooltip`, `Text`, `Heading`, `Code`, `Skeleton`, `Card`, `Badge`, `Flex`, `PopoverPanel`. Buttons use React Aria for press, keyboard and focus, and expose state as data attributes. Apps import these from `@proshore/ui`, never from React Aria or Radix.

Found and fixed during the migration: buttons, the client chip and nav links were not actually pills. The pill radius token `--radius-full` is zeroed inside the Radix wrapper, so my earlier statement that buttons were pills was wrong for the app. They now use our own `--pr-radius-pill`. Also fixed: the "Proshore only" eyebrow chip on the navy hero failed contrast.

Verified 29 Sep (dev server): typecheck and build pass; link buttons navigate; Ask Sherpa opens and closes; the filter popover opens, filters (40 to 25 findings) and is styled in dark; slide-over previous, next and close work; the columns menu toggles columns and stays open; compact rows toggles. axe-core: 0 violations on Overview, Landscape, Findings, Decision in light and dark; the filter popover shows one moderate best-practice item (content outside a landmark region), not yet fixed. Not verified: screenshots this round (the Browser pane was hidden, so checks were DOM, computed-style and axe only), real keyboard use, screen readers, other browsers.


## Form primitives on React Aria (29 Sep 2026)

`TextField`, `TextArea`, `SearchField` (clear button, Esc clears), `Checkbox` (with indeterminate), `Switch`, `RadioGroup`, `Select`, `MultiSelect` (ComboBox plus removable tags, because React Aria has no multiple mode), `DateRangePicker` (segmented fields plus range calendar, ISO string values) and `LocaleProvider`. Every field has a visible label (or a hidden one for search), an optional description and an error with icon and text. The demo is in the library under Forms.

Verified 29 Sep in the running app: Setup flow (typing, select, invalid then corrected repository entry adds a row, assigning an application clears the checklist item, review checkbox enables publish); findings search, clear button, Esc, checkbox and radio facets (40 to 25 and 9), page size 10 to 25; multi-select adds and removes tags; date range picked from the calendar (8 to 15 Sep, stored as ISO); English and Dutch (`dd / mm / yyyy` versus `8 - 9 - 2026`, `september 2026`, Monday-first weekday initials). axe-core: 0 violations on all six Setup steps in light and dark. Not verified: real key-by-key typing and date segment entry, screen readers, other browsers, and appearance (no screenshots this round, the Browser pane was hidden).

Bugs found by testing and fixed: a field with an error blocked its own form from submitting (React Aria's native validation); a scrollable process flow was not keyboard focusable (now `tabIndex=0` with a focus ring). Known best-practice note: popover content rendered into `<body>` is reported by axe as outside a landmark region.


## Overlays and navigation on React Aria (29 Sep 2026)

- **SlideOver** on React Aria `ModalOverlay`, `Modal` and `Dialog`: focus trap, Esc, click outside, focus returns to the opener, dialog named by its heading, entering and exiting animations that respect reduced motion. Renders into `<body>` and uses the page-level tokens.
- **Tabs** (views of the same item), **Breadcrumbs** (`PageHeader breadcrumbs`, used on Findings when arriving from a journey step), **Toast** (`toast.show`, region "Notifications", 5 s, dismissible, tones info, success, warning, danger; used when a finding is marked reviewed), **SimpleTable** (short static tables), **Note** (replaces callouts).

Verified 29 Sep in the running app: slide-over opens, is named, focus starts inside, Close button, Esc and click outside close it and focus returns to the row that opened it; tabs switch by click and arrow key with the panel linked; previous and next move through the filtered list and reset the tab; Mark as reviewed shows a success toast that can be dismissed. axe-core: 0 violations in light and dark on findings with breadcrumbs, the open slide-over, Ask Sherpa, the library and Setup sources (the earlier dark-mode overlay report disappeared with the React Aria modal). Testing note: React Aria waits for the exit animation before unmounting, so with the Browser pane hidden (page not painting) the closing animation never finished; I re-tested with animations disabled. Not verified: keyboard-only use with real key events, screen readers, other browsers, and appearance (no screenshots this round).


## Simplification and motion (v3, 29 Sep 2026)

Jeroen: the design felt complex, too much information; make it sleeker, smooth (sorting and other functions), with animation where it makes sense, so it feels floating.

### What was cut (veto any of these)
| Screen | Removed | Why |
| --- | --- | --- |
| Overview | The three "Pick the view that fits your role" cards | Duplicated the navigation; the role hint still shows in the welcome text |
| Overview | Four bordered verification cards, replaced by one plain list (state, statement, source) | Fewer boxes, easier to scan |
| Overview | Section eyebrows, long descriptions, the legend-plus-chart caveat pair | One short line per section |
| Landscape | Application cards and the dependency panel | The swimlane already shows each application and its coverage; dependencies are one line of text |
| Findings | "Journey step" column, the Evidence filter, the review sub-line, the Export button | Five columns and three filters; step and note are in the detail panel |
| Decision | "The evidence behind it" section | The evidence trail is one click away in the finding panel |
| Finding panel | The three summary boxes; evidence trail and review history now sit in one collapsed "Evidence trail and review history" section | One summary sentence, tabs, and detail on demand |
| Everywhere | Duplicate "Demo data" tags and repeated partial-scan messages | Said once per screen |

### Motion (all off with reduced motion; one easing family; 120 to 500 ms)
- Pages: hero text and content blocks rise in with a light stagger.
- Header floats over the hero as a rounded blurred bar; its shadow deepens once you scroll.
- Tables: rows slide to their new position when sorting or filtering (FLIP), new rows fade up with a stagger, page changes animate the same way.
- Numbers: the three overview figures count up once (screen readers get the final value only).
- Severity bar reveals left to right; tabs have a sliding underline; the finding panel's detail section expands smoothly.
- Buttons lift on hover and press in; inputs, chips and menu items ease their colours; menus and popovers pop in; the slide-over eases in with a soft blurred backdrop.

Verified in the running app (no screenshots: Browser pane hidden): the removed content is gone and the rest renders; the header is floating (20 px radius, reserved space under it, scrolled state toggles); the severity bar, page entry and table rows create real animations (sorting reordered rows, page and filter changes produced row animations); the tab indicator moved from x 0, width 65 to x 154, width 68 with a 0.32 s transition; the disclosure went from hidden to visible with its grid rows animating; axe-core reports 0 violations on Overview, Landscape, Findings, Decision, Setup and the library in light and dark; my contrast pass reports nothing real (its light-mode flags on the header came from my script not reading `color(srgb ...)` backgrounds). Not verified: how any of it looks or feels, frame rate on slower machines, the count-up (needs a visible page to run), real keyboard use, other browsers.

## Layout v4: glass header, light title, full width (29 Sep 2026)

Changes: frosted floating header (no inverse surface), light compact `PageHeader`/`PageHero`, fluid `.l-body`, prose-only max widths, `Grid cap`, `.l-cols`, `DataTable` `hideBelow`.

Verified (Browser pane emulation, DOM and axe, not by eye): axe-core (WCAG 2 A/AA, 2.1/2.2 AA, best practice) reports 0 violations on Overview, Landscape, Findings, Decision and Setup in light and dark at 1440px. It found and I fixed three real contrast failures: nav count opacity, the "Proshore only" chip colour in the title area, and the chip in dark mode. No horizontal page overflow at 390px, 1440px and 2400px on all routes (the journey rail scrolls inside its own region by design). Header content fits at 1440px.
Not verified: no screenshots (pane hidden, so the visual result, dark glass appearance and animations were not looked at), real phones, other browsers, screen readers, keyboard pass on the new layout. My custom contrast script flags the disabled "Back" button; axe correctly exempts disabled controls.

## Table engine: TanStack Table v9 (29 Sep 2026)

`useTableState` keeps the same return shape, `DataTable` and `FilterBar` are untouched. Registered features: column and global filtering with filtered row model, column faceting (faceted row model and unique values), row sorting (custom comparator, empties last in both directions via `sortUndefined: "last"`), column visibility.

Verified in the browser (dev server restarted after the install, animations off for popover tests): before/after comparison on the Findings table against a baseline recorded from the previous engine. Identical row order for ascending, descending and cleared sort on all 5 visible columns, identical multi-sort (Application then Finding, with priority numbers), identical search results for "sql", "CVE" and "zzzz" (no results state), and "lodash" once the same sort state was applied (my first comparison differed only because the sort state differed). Facet counts identical (Ordering 25, Inventory 15; with Ordering applied, review status 9/9/4/3, which sums to the 25 rows). Lab table: hide and show column, select rows, select page, clear selection, next page all work. axe: 0 violations. No console errors after the restart. Build and typecheck pass.
Not verified: default order of the "none" state was compared only on Findings; the Evidence and other DataTable instances; large data sets (no performance test); keyboard use and screen readers after the swap; the export CSV was not re-run (unchanged code, reads `sorted` and visible columns).

## Charts rebuilt on visx (29 Sep 2026)

`BarChart` is now one SVG (was HTML and CSS): visx `scaleLinear`, `AxisBottom/AxisLeft`, `GridRows/GridColumns`, our `SeriesPatterns` (SVG twin of the CSS `Fill`, incl. hatched partial variant), value labels, "No evidence" box, rounded ends, wrapped or truncated labels with full text in `<title>`. `TrendLine` keeps its own markers, dashes, end labels, roving-arrow keyboard and tooltip and takes only its scales, grid and tick labels from visx. New shared helpers in `charts/shared.tsx`: `usePatternIds`, `SeriesPatterns`, `roundedEnd`, `fit`, `wrapLabel`. Removed the old `.ch-hbar*`, `.ch-vbar*`, `.ch-val` CSS.

Verified (Browser pane, DOM, axe; compared against a baseline recorded from the old charts on the 6 cards of `#/lab/charts`): trend chart identical in aria summary, 16 tab stops, keyboard sequence, tooltip text and table view. The 3 bar cards have identical aria summaries and tables, and the same visible words (only DOM order changed, axes now come first, and hover titles add "≥" text). No page overflow at 390px and desktop; SVG content stays inside its box (after fixing two problems found by this check: trend x labels sat a few px below the SVG, and at phone width the long "No evidence" sentence overflowed and vertical-bar labels were truncated instead of wrapped). axe (WCAG 2.2 AA, best practice): 0 violations in light and dark; contrast on SVG text is reported "incomplete" by axe as before (tokens unchanged; tick colour computed 85,84,127 light and 184,190,227 dark). Typecheck and build pass. Discovery bundle: 935.9 kB to 995.7 kB minified (+60 kB, +21 kB gzip); chart code is still in the main bundle, and lazy-loading the chart module would cut it for pages without charts.
Not verified: no screenshots (pane hidden), so spacing, bar proportions, label positions and the look of hatch patterns are not seen by eye; hover tooltips on bars (native `<title>` only, as before); very long labels and 8+ categories; large series; print; touch; Safari and Firefox; screen readers. Bars have no animation now (the HTML bars had none either).

## Screen review, true-black dark mode and header toggle (29 Sep 2026)

- **Dark theme is now true black** (Jeroen: "really black, not navy"): canvas #000, surfaces #0c0c0c and #161616, neutral grey scale, hairlines instead of shadows (override block at the end of `tokens.css`). Status tints and brand accents unchanged.
- **Theme switch**: sun/moon button in the header (one click, light or dark); "System" remains in the avatar menu. I could not reproduce "the switch stopped working": system, light and dark all switched on every route with real clicks and by script. The earlier see-through menu in a screenshot was a mid-animation frame, not a bug.
- **Bug fixed:** the finding drawer stayed open when navigating to another page; it now closes on navigation.
- **Drawer:** the evidence trail (source, application, capability, impact) is now visible, built from each finding's own record (before: one demo chain, collapsed), plus an explicit "Not known yet" note for unconfirmed items. Review history stays collapsed.
- **Decision:** reasoning left, status right. Every reason has an evidence state and links (finding drawer, coverage, landscape); a review stepper shows drafted, reviewed by Proshore, customer comments (current), signed off.
- **Evidence:** one coverage list instead of two mostly empty cards; page title no longer wraps to three lines.
- **Landscape:** a dependency graph and an applications table (stack, evidence sources, scan state, mapping state) above the journey swimlane, so it no longer repeats the Overview map.
- **Not changed:** Setup (Proshore-only wizard; small mono step labels remain).
Verified: screenshots at 1440px (Decision, drawer, Landscape in dark; Evidence in light), axe 0 violations on Overview, Landscape, Findings, Evidence, Decision, Setup and the open drawer in light and dark, no horizontal overflow, toggle flips light and dark and the dark canvas computes to rgb(0,0,0), drawer closes on navigation, typecheck and build pass.
Not verified: phone widths for the new Decision, Landscape and Evidence layouts, Overview and Findings in true black by eye at full size (screenshots were scaled), keyboard-only walk-through, screen readers, Safari and Firefox, and the user's own browser state (their stored theme preference could differ from mine).

## Colour alternatives: restrained palettes and an orange replacement (29 Sep 2026)

Jeroen: everything is still too colourful for a business app; orange, status colours and severity colours are the problem; keep the Proshore logo and one accent; references Stripe Dashboard and Notion; status and severity as text and shapes first, colour only for what needs action. Then: "Maybe the current one, but find an alternative for all the orange stuff."
Prototype switch at the bottom of the screen (Proshore staff persona), stored per browser, source in `packages/ui/src/theme/palettes.css`:
- **Palette** (`<html data-palette>`): Current, **Notion** (warm neutral, flat hairlines), **Stripe** (cool slate, soft depth), **Ink** (Proshore navy text on cool near-white). The three restrained palettes share: neutral status badges (words and icons, no fills), grey severity ramp with red only for critical, red only for failures, amber only for partial-coverage caution, neutral tinted bands, a single blue accent.
- **Accent** (`<html data-accent>`), independent of the palette: Orange (today), **Blue** (Proshore accent), **Navy** (ink; white in dark), **Grey**. It replaces every use of the brand orange: recommendation bar, review rules, "Start here" pin, current-step dot, headline underline, Proshore-only line and tag, nav dot. The logo keeps its own orange.
Verified: axe (WCAG 2.2 AA, best practice) clean on Overview, Findings and Decision for Current+Blue (light, dark), Current+Navy (light, dark), Current+Grey (light, dark), Notion+Blue, Stripe+Blue (light, dark), Ink+Blue (light); Notion and Stripe on all five routes in light showed only my own switch as a landmark issue, fixed. Screenshots at 1440px of Stripe, Notion (light), Current+Blue (dark), Current+Navy (light). Typecheck and build pass.
Not verified: every remaining combination (e.g. Ink dark, Grey with the restrained palettes), Landscape, Evidence and Setup in every combination, charts (chart series colours are unchanged), the drawer under the restrained palettes, by-eye check of grey severity dots on small screens, and printing.

## Colour decision: current palette with a blue accent (29 Sep 2026)
Jeroen chose "current and blue accent". Done: the brand orange is no longer used inside the product. Tokens were renamed to say what they are: `--sherpa-accent-mark` (was `--sherpa-brand-orange`; now `var(--accent-11)`, Proshore blue), `--sherpa-accent-text`, `--sherpa-on-mark` (white on blue in light, black in dark). They drive the recommendation bar, review rules, "Start here" pin, current-step dot in Decision, headline underline, Proshore-only line and tag, and the nav dot. The logo keeps its own orange (`Brand.tsx`, do not recolour). The palette and accent switch and `palettes.css` (Notion, Stripe, Ink, Grey, Navy) were removed; the alternatives are described in the previous section and can be rebuilt from git-less notes here if the direction changes (status and severity going neutral was not chosen).
Verified: no orange left on Overview, Landscape, Findings and Decision in light and dark apart from the Proshore logo mark (computed-colour scan); axe clean on all six routes in dark and on Overview, Landscape, Findings and Decision in light (Evidence and Setup in light were clean in the earlier palette sweep, not re-run after the rename); typecheck and build pass. A first dark sweep reported 8 contrast nodes per route, which was a frozen theme transition in the hidden pane; re-run with the state settled it was clean.
Not verified: Evidence and Setup in light after the rename, Library page swatches by eye, phone widths, printing.

## App launcher and the Sherpa suite (29 Sep 2026)

Jeroen: apps inside Discovery (Legacy scan, Scenario planner), Build (**Seeder**, not Cedar) and Pulse (monitoring tools), each with its own icon, easy to move between. His answers: three products each with tools; an app launcher in the header; fully distinct coloured icons; a switcher plus a simple landing page per app.
Built: `AppLauncher`, `AppIcon`, `AppTitle` in `@proshore/ui` (`components/AppLauncher.tsx`; `AppHeader` takes a `launcher` prop). One shared tile (rounded square, gradient, glossy edge, one white glyph) with a distinct hue and glyph per app: Discovery blue compass, Legacy scan teal magnifier, Scenario planner violet branch, Seeder green sprout, Monitoring graphite pulse line. The header shows the current app (icon and name, name hidden below 1320px); the panel groups apps by product with the tagline from Proshore's site copy, marks the current app, and every entry is a real link. Suite data lives in `apps/discovery/src/fixtures/suite.ts`; `#/apps/<id>` shows an honest placeholder page (what it is, status in this prototype, proposed link to Discovery). Only Discovery has real screens; outside Discovery the engagement tabs are hidden.
Facts vs proposals on the placeholder pages: Legacy scan is Babish's existing MVP (not embedded); Scenario planner is a later phase per the product brief; Seeder and Monitoring purposes are still to be defined and the pages say so. The Launch product from the site copy is not in the launcher (open question 32).
Verified: screenshots at 1440px (launcher open, Seeder page) and 390px (launcher open, dark, true black); axe clean on Overview and the app pages in light and dark with the launcher closed; header nav fits at 1440px, and is within 5px at 1280px (fixed after with a narrower chip, not re-measured); launcher opens on click and lists five links with the current one marked; the existing user-menu and filter popovers still pass axe.
Not verified / known: with the launcher open axe reports one best-practice "region" advisory on the popover host div (the user menu and filter popovers do not; I could not isolate the cause; not a WCAG failure); keyboard focus into the panel could not be verified because the hidden pane does not hold focus; screen readers; other browsers; icons at small sizes in dark by eye beyond the 390px view; how a customer without access to an app sees it (permissions and availability states are not designed).

## Header alternatives, fresh approach (29 Sep 2026)

Jeroen: "Come with new head menu designs, approach it fresh." Problem with the current header: one row carries logo, app launcher, client chip, five page tabs, the Proshore menu, theme, Ask and account, so it overflows below 1300px and mixes suite-level and page-level navigation.
Three structures, built on the real app, switch at the bottom of the screen ("Header", Proshore staff persona; choice stored in this browser). Code: `apps/discovery/src/app/headers/` (`Headers.tsx`, `CommandPalette.tsx`, `headers.css`); the current header is untouched.
- **A · Two tiers.** Top bar = the suite: logo, app launcher, client chip, search, Ask, theme, account. Second bar = this app's pages as underlined tabs. Global and local navigation never mix; pages are always visible.
- **B · Rail.** A slim left rail shows all five apps as icons, always one click away, with tooltips; the top bar only says where you are (app, client, page tabs, search, Ask). On phones the rail becomes a bottom app bar. This reverses the earlier "top navigation only, no left rail" answer for app switching, so it needs an explicit yes.
- **C · Location bar.** One thin bar reading as a path: logo, app, client, page (a menu). Pages also live in the command palette; least visible chrome, least discoverable.
Shared new piece: **command palette** (Ctrl or Cmd+K, or the search button): jump to pages, apps, Proshore tools and findings; ARIA combobox (input keeps focus, arrows, Enter, Esc, aria-activedescendant).
Verified (Browser pane): screenshots of A, B, C at 1440px and of A, B, C at 390px; axe (WCAG 2.2 AA and best practice) clean for A, B and C on Overview, Findings, Decision and the Seeder page in light and dark, and with the palette open and C's page menu open; rows fit without clipping at 1280px, 1024px and 390px for A, B and C (after fixes: B tabs at 1024px, avatar hidden by B's phone bottom bar, C clipping at 390px); palette opens with Ctrl+K, filters, Enter navigates and closes; typecheck and build pass. An early sweep tested "Current" instead of C because of a selector slip; C was re-tested separately.
Not verified: keyboard focus order and focus return (the hidden pane does not hold focus), screen readers, Safari and Firefox, real touch on the phone bottom bar, tooltips on the rail by keyboard beyond CSS focus styles, Setup and Design pages in A, B and C, the launcher popover inside B's rail (opens from the header, not the rail).
Not built: notifications, help menu, breadcrumbs deeper than the page, saved views, recent items in the palette.

## Header decided: B (rail), with thin-line Nepal and mountaineering icons (29 Sep 2026)

Jeroen chose B. His direction: icons in thin lines only, themed on mountaineering and Nepal; "jetty" was confirmed to mean a **Yeti** for the metaphysical side; the mountain goes on Build; theme beyond icons: small touches only; one ink colour, accent on the current app.
- **Shell** (`apps/discovery/src/app/headers/AppShell.tsx`, `headers.css`): left rail with every app, tooltips, current app in the accent with an accent bar; top bar with app name, client chip, page tabs, search (command palette, Ctrl or Cmd+K), Ask; bottom app bar on phones with theme and account moved to the top bar. Removed: concepts A and C, the old floating header in Discovery (`AppHeader` and `AppLauncher` stay in `@proshore/ui` for other apps) and the header switch.
- **Icons** (`AppIcon` in `components/AppLauncher.tsx`): 24px thin line drawings, 1.4px non-scaling stroke, `currentColor`, no filled tile. Discovery = compass, Legacy scan = binoculars, Scenario planner = Yeti (shaggy crown, brow, fangs), Build/Seeder = mountain with a flag, Pulse/Monitoring = barometer. Ink is grey; the app you are in is Proshore blue; landing pages use a hairline frame.
- **Small touches** (`components/Motifs.tsx`): `Ridgeline` (two ridge lines and a snow cap) in every page header on screens wider than 820px, and `PrayerFlags` (monochrome line flags) in table empty and no-result states. Both decorative and aria-hidden.
Verified (Browser pane): screenshots of the rail at 1440px light and dark, the Scenario planner page (large Yeti), no-results state in dark, and 390px with the bottom bar; the first Yeti read as a friendly face and was redrawn until it read as a Yeti; axe clean on Overview, Landscape, Findings, Evidence, Decision, Setup and the Seeder page in light and dark; no overflow at 390px and the avatar stays visible; typecheck and build pass.
Not verified: the icons at their smallest sizes on a real phone and on non-retina screens; contrast of the thin grey icon lines against the WCAG 3:1 non-text rule (axe does not check icon strokes; grey ink on the canvas should be around 4:1 but was not measured); the ridgeline behind long page titles at 900 to 1100px; screen readers and keyboard focus order in the rail; Safari and Firefox; whether the Nepal framing feels right to Nepalese colleagues and customers (worth asking Proshore's Nepal team about the Yeti and any religious motifs before shipping).
Not built: illustrations, ridgeline backgrounds, mountaineering vocabulary in the interface copy (Jeroen chose small touches only).

## Dark theme follows the standard (29 Sep 2026, Jeroen)
Jeroen: pure black is not what most apps use; follow the standards. The dark theme is now the Material Design dark baseline: canvas #121212, cards #1e1e1e, raised #272727, hairlines 12% white, primary text #ececec (about 87% white, never pure white), secondary text #b5b5b5. This supersedes "True black dark theme" and "Dark mode is true black" above. Verified: axe clean on 10 screens in dark, screenshot of the Overview, and an automated test that the dark canvas is rgb(18,18,18). Not verified: every screen by eye in the new dark, elevation steps for stacked overlays (drawer over a card over the canvas may need a fourth step), print.

## App icons refined (29 Sep 2026)
Jeroen: the icons did not look good yet; too small and faint in the rail, and the Yeti. Direction chosen: refine the thin-line set.
Changes (`AppIcon` in `components/AppLauncher.tsx`): all five redrawn on one 24 grid with a 2px safe margin and round caps and joins; the glyph now fills 80% of the tile in the rail (was 68% of a smaller area); ink is the full text colour at 82% (100% on hover or when current) instead of a dim grey; the stroke is adaptive, about 1.8px in the rail and never above 2px at any size, so large sizes stay thin; the Yeti is a shaggy bust (fur-tufted crown, zigzag fur hem, flat face with brow, eyes and mouth) instead of a face, which reads as a Yeti at rail size. A specimen page shows all sizes: `#/lab/icons` (Proshore only).
Verified: rendered with headless Chrome at 1x in dark and light (the Browser pane was hidden): rail icons, framed 72px icons and the 160px specimen; typecheck, build, unused-code check and all browser tests pass (now 48 with the icons lab).
Not verified: the Monitoring icon in the last review render (it was unchanged in structure, only its size and weight changed), the smallest 24px inline size (16px glyph, intentionally not used in the product), Jeroen's own view of the new set.

## Proshore Fixer icon, real customers and the Sherpa guide (29 Sep 2026)
Jeroen: the Yeti is for Proshore Fixer (bug finder and bug fixer), drawn much thinner than the other icons, and the other icons are fine.
- **Proshore Fixer** is a new app (`fixer`, "Proshore Fixer") with the Yeti bust, stroked at 55% of the other icons' weight. Placed under **Pulse** as an assumption (a bug finder and fixer keeps software healthy); the product is one field in `apps/discovery/src/fixtures/suite.ts`. Scenario planner got its route glyph back (three nodes and a branch). The rail now has six apps.
*(Customer-specific note removed when the design system moved to its own repository; it belongs to Sherpa Discovery.)*
- **Sherpa guide** (`SherpaGuide` in `components/Motifs.tsx`): a thin-line mountain guide (knit beanie with bobble and summit emblem, snow goggles, smile, scarf) used on the Ask Sherpa button, in the Ask Sherpa panel header and as the avatar on every answer, on the starter questions and on "Ask Sherpa about this" in the finding drawer. It replaces the speech-bubble icon.
Verified: rendered at 1x with headless Chrome: icon specimen (light), Ask Sherpa panel with an answer (light), workspace switcher with both customers (dark); typecheck, build, unused-code check and all 52 browser tests pass (accessibility on the Fixer page and the icons lab included).
Not verified: the guide at 20px inside the blue Ask button by eye (only at larger sizes and in the panel), the marks on real phones, dark mode of the Ask panel and the Fixer page by eye, brand accuracy of my crops against the customers' own brand guidelines.

**Update (29 Sep 2026, later):** Jeroen confirmed the Yeti's thin weight is right and asked for the other icons in the same style. All app icons now use the fine weight (55% of the earlier stroke: about 1.0px in the rail, never above 1.1px at any size). The Sherpa guide keeps its own slightly heavier stroke (1.1 to 1.7px) so it stays readable at 20px. Verified by render at 1440px in light; not by eye in dark or on a phone, where thin lines may need a check.

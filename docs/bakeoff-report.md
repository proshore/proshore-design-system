# Bake-off report: React Aria Components vs Base UI (29 Sep 2026)

Same "Findings" screen built twice from one spec (`apps/bakeoff/SPEC.md`), same shared data and query logic, same design tokens, by two Sonnet agents in parallel. Code: `apps/bakeoff/src/rac/` and `apps/bakeoff/src/baseui/`, each with agent-written `NOTES.md`. Run: `npm run dev -w bakeoff`, then `#/rac` and `#/base` on port 5175.

## Measured by Claude (not agent claims)

| Measure | React Aria Components 1.21.1 | Base UI 1.8.0 |
| --- | --- | --- |
| Variant chunk, production build | 539 KB raw, **161 KB gzip** | 294 KB raw, **95 KB gzip** |
| Lines (Page.tsx + CSS) | 564 | 688 |
| axe-core scan (WCAG 2 A/AA, 2.1 AA, 2.2 AA, best practice): page at rest light | 0 violations, 1 incomplete | 0 violations, 1 incomplete |
| axe: dark at rest | 0 violations | 0 violations |
| axe: slide-over open, light | 0 violations, 1 incomplete | 0 violations, 2 incomplete |
| Renders, slide-over opens, Esc closes and focus returns | yes (seen in screenshots) | yes (Esc verified, focus returned to the row button) |

The shared chunk (React, Radix Themes CSS and theme scope) is 74 KB gzip in both and is not counted. The size gap is mostly RAC's calendar, date and i18n code, which Base UI does not have. "Incomplete" axe results (probably contrast checks) need a manual check.

## Reported by the agents (not re-verified by Claude)

| Area | React Aria Components | Base UI |
| --- | --- | --- |
| Effort | 3 to 4 hours | about 3 hours |
| Whole spec covered by real components | **Yes** | **No**: no calendar or date range, no table |
| Date range with calendar | DateRangePicker + RangeCalendar, works | two native date inputs; a proper accessible range calendar estimated at 800 to 1500 lines, 2 to 4 weeks |
| Table | RAC Table (real table, aria-sort, grid keyboard model); tab stop is the row, sortable headers are not buttons; needed `dependencies` on TableBody to refresh rows | plain accessible `<table>` built by hand; a full data grid would be weeks |
| Multi-select combobox with tags | not built in, composed by hand (about 30 lines) | built in (Combobox, multiple, chips) |
| Slide-over | Modal + Dialog with CSS (no drawer) | Drawer (swipe to dismiss, transitions); focus return wired by hand |
| Toast | works but exported as `UNSTABLE_*` (API may change) | stable |
| nl-NL out of the box | Dutch date segments, calendar (month names, Monday first) and screen-reader strings | nothing from the library; native date inputs follow browser language, not the toggle |
| Tooltip | works | popup lacks role and aria-describedby, must add |
| Portal vs our tokens | popovers, modal and toast rendered unstyled; portalling into the theme root broke focus return; workaround: body-level host mirroring the root's classes (MutationObserver hack) | popups and toast unstyled; fixed by passing a `container` to every Portal |

## The finding that matters most for the design system

Both libraries hit the same problem, and it is ours, not theirs: the design tokens are defined on the Radix Themes root element, but overlays (menus, popovers, modals, toasts) portal to `document.body`, outside it. Fix once in the system: define tokens on `:root` or `<html data-theme="light|dark">` instead of `.radix-themes.light|dark`. Then any library's portals inherit them and the workarounds disappear. This must be done regardless of the library choice.

## Recommendation (Claude's judgement, pending Jeroen's decision)

**React Aria Components as the base layer.** It covered 100 percent of the spec with real components; Base UI covered about 70 percent and would need a date range calendar and a table built by us, which is exactly the accessibility-heavy work we want a library for. Localisation in Dutch works without extra code. Effort to build was similar.

Costs to accept:
- Larger bundle (161 vs 95 KB gzip for this screen, partly because it includes date and i18n code).
- Toast is still marked unstable: wrap it behind our own `Toast` so a change touches one file.
- The Table follows the grid keyboard model (row is the tab stop), and the multi-select combobox is composed, not built in.
- Steeper learning curve (collections, keys, slots).

Base UI stays a valid second choice, and it has two parts RAC lacks that we could borrow if needed (Combobox multiple, Drawer). Avoid running two overlay systems side by side without a reason.

## Not verified by anyone
Real screen readers (VoiceOver, NVDA), typing into date segments with real key events, calendar keyboard navigation, native date picker popup rendering, Safari and Firefox, touch, reduced motion, RTL, colour contrast (axe "incomplete"), production behaviour beyond the build.

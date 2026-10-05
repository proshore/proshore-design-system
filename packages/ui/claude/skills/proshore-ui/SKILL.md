---
name: proshore-ui
description: Build or change any user interface in this project with the Proshore design system (@proshore/ui): pages, layout, tables, forms, charts, navigation, dialogs, drawers, colours, dark mode and icons. Use it before writing UI code and when reviewing UI for consistency, accessibility or colour.
---

# Proshore UI (`@proshore/ui`)

Use this whenever you build or review interface code here. The design system is already installed; do not write new base components, colours, spacing or icons that it already provides. If something is missing, say so and propose it (see "When something is missing").

Reference files next to this one (generated from the installed version, always trust them over memory):
- `reference/components.md`: every exported component, hook and icon with a one-line purpose and the file that holds its exact props.
- `reference/tokens.md`: every design token (CSS custom property) grouped by family.
For exact props of a component, read its declaration file in `node_modules/@proshore/ui/dist/types/` (the path is in the "File" column of `components.md`).

## 1. Set up once
```tsx
// main.tsx
import "@proshore/ui/styles.css";
// App.tsx
import { useState } from "react";
import { PortalHost, SherpaTheme, ToastHost } from "@proshore/ui";

export function App() {
  const [host, setHost] = useState<HTMLElement | null>(null);   // overlays (menus, drawers) render here and inherit light/dark
  const appearance = useSystemAppearance();                        // "light" | "dark"; offer System, Light, Dark to the user
  return (
    <SherpaTheme appearance={appearance}>
      <div ref={setHost} style={{ display: "contents" }} />
      <PortalHost.Provider value={host}>
        {/* shell, routes */}
        <ToastHost />
      </PortalHost.Provider>
    </SherpaTheme>
  );
}
```
Add a favicon (otherwise every page load logs a 404 for `/favicon.ico`). Also set `<html data-theme>` early in `index.html` with a tiny inline script (read the saved choice or `prefers-color-scheme`) so dark-mode users never see a light flash.

## 2. Build a page from the layout primitives, never with custom spacing
```tsx
import { Page, PageHeader, Section, Grid, Panel, StatCard, Stack } from "@proshore/ui";

<Page>
  <PageHeader eyebrow="Billing" title="Invoices" description="What was sent and what is still open." actions={<Button>New invoice</Button>} />
  <Section title="This month">
    <Grid min={240} cap={1180}>
      <StatCard label="Open" value="€ 41.200" caveat="12 invoices" />
    </Grid>
  </Section>
  <Section title="All invoices"><DataTable ... /></Section>
</Page>
```
Rules: screens set no margins, paddings or widths of their own. Use `Page`, `PageHeader`, `Section`, `Grid`, `Stack`, `Cluster`, `WithAside`, `Panel`, `KeyValue`. Full width is the default; only prose is capped (about 60 to 70 characters). Cards (`Panel`, `StatCard`) hold a thing; do not nest cards in cards.

## 3. The components you will use most
- **Tables:** `DataTable` with `ColumnDef[]` (search, filters with counts, sort, column visibility, paging, CSV, bulk actions, empty/loading/error states, row to drawer). Define columns once; give each a `header`, an `accessor` or `cell`, and filters where useful. One-line rows, quiet header. Right-align numbers (`align: "end"`).
- **Forms:** `TextField`, `TextArea`, `SearchField`, `Select`, `MultiSelect`, `Checkbox`, `Switch`, `RadioGroup`, `DateRangePicker` (wrap in `LocaleProvider`). Every field has a visible label (or `hideLabel` with an accessible name). Errors are text next to the field.
- **Navigation and overlays:** `Tabs` (views of the same record), `Breadcrumbs`, `SlideOver` and `SlideGroup` (detail of one item without leaving the list), `PopoverPanel`, `Tooltip`, `toast`. A drawer must close when the user navigates away.
- **Feedback:** `Note` (info, warning, success, danger), `Skeleton`, `Disclosure`. Every list or table needs an empty state, a loading state and an error state; never leave a blank area.
- **Charts:** always inside `ChartCard` (takeaway as the title, description, caveat, legend, source, and the "View as table" alternative). Use `BarChart`, `TrendLine`, `StackedBar`, `Sparkline`. Zero is never used for "unknown": pass `coverage: "none"` (shows "No data") or `"partial"` (shows "at least").
- **Icons:** import from `@proshore/ui` (Radix 15px icons). Do not add another icon library.

## 4. Visual rules
1. **Tokens only.** Never hard-code a colour, font size, radius or spacing. Use the tokens in `reference/tokens.md` (`var(--gray-12)`, `var(--sherpa-surface)`, `var(--space-4)`). Text colours: `--gray-12` primary, `--gray-11` secondary.
2. **Calm colour.** Neutral surfaces, one accent (Proshore blue, `--accent-*`). Colour is for what needs action: critical items, failures, a caution. Status is shown with a word and a shape first. No orange in the product (the Proshore logo keeps its own orange). No decorative gradients.
3. **Light and dark** both ship and both must pass checks. Dark is the standard dark grey (canvas `#121212`, cards `#1e1e1e`, text about 87% white), not black and not navy. Do not add a third theme.
4. **Typography:** Geist and Geist Mono are loaded by the styles. Plain language first, technical detail on demand. Sentence case. Nothing smaller than 12px. Numbers use tabular figures in tables.
5. **Targets and focus:** every interactive element is at least 24 by 24px, has a visible focus ring, and works with the keyboard.
6. **Motion** is subtle and always off with `prefers-reduced-motion`.
7. **Icons and illustration:** thin line style only (about 1px stroke, `currentColor`). `Ridgeline` and `PrayerFlags` are brand motifs: use them rarely.

## 5. Accessibility and testing (the bar is WCAG 2.2 AA)
- Colour is never the only signal. Every control has an accessible name. Headings are in order (one `h1` per page).
- Test every screen in light and dark with axe (`@axe-core/playwright`, tags `wcag2a wcag2aa wcag21aa wcag22aa best-practice`), at 1440px and at 390px with no horizontal scroll, with no console errors. Example:
```ts
const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
expect(violations).toEqual([]);
```
- Do not claim a screen works or looks right without having run it and looked at it. State what you checked and what you did not.

## 6. Money and tables (suggestions for financial screens, not part of the package)
Format with `Intl.NumberFormat` using the user's locale, show the currency code or symbol on every amount, right-align amounts with tabular figures, show negatives with a minus sign and a word ("credit"), and never rely on red and green alone. Show totals in a footer row. Keep rounding rules in one function. Dates: ISO in exports, locale format on screen.

## 7. When something is missing
Do not invent a one-off look. In order: (1) compose it from existing primitives; (2) if it is genuinely new, build it inside this app using tokens and the same rules, keep it small, and tell the user it is a candidate to move into `@proshore/ui`; (3) never edit files in `node_modules`. Do not copy Discovery-specific components (evidence, coverage and severity badges, journey flow, app launcher): they are not part of this package on purpose.

## 8. Naming note
Tokens start with `--sherpa-` (semantic: canvas, surface, line, status) because the design system grew inside the Sherpa product family. They are generic; use them as listed.

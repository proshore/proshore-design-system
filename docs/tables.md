# Data tables and filters

Module: `src/components/table/`. Live preview: `#/lab/table`. Fixture data only.

## Anatomy

1. Partial-data banner (optional): `partialNotice`, e.g. "scan is partial, list is incomplete". Recommended: `<PartialBanner summary="Partial scan S-104: results are incomplete">full text</PartialBanner>` or `<Note tone="warning" summary="...">`: one line with a Details button, the full text always in the page for screen readers.
2. Toolbar, one row: search field (`role="search"`), facet filter buttons (popover with checkboxes and counts), live result count ("12 of 40 findings", `aria-live`), toolbar slot (density, columns, export, custom actions). Below 720px: search on its own row, one **Filters** button (badge with the number of active filters) that opens one popover with all facets, the count on the next line.
3. Chips row, only when something is applied: removable filter chips, search chip, "Reset filters".
4. Bulk-action bar (only while rows are selected).
5. Table: sticky header, optional selection column, first column sticky on horizontal scroll, one row button in the first cell.
6. Footer: rows per page (10/25/50), range ("1-10 of 40"), first/previous/next/last.
7. State replacing the table: skeleton (loading), empty (no data yet), no results, error.

## API

`<DataTable columns rows getRowId caption noun ... />` and `useTableState(rows, columns, opts)`.

Column (`ColumnDef<T>`): `id`, `header` (plain text), `accessor` (raw value, default for sort/search/filter/CSV), `cell(row, {highlight})`, `sortValue` (use for ranks, dates, numbers), `sortable`, `searchText` (or `false`), `csv`, `align`, `width`, `minWidth`, `filter: {kind: "select" | "multi" | "text", options?, value?}`, `hideable`, `sticky`.

Table props: `status` (`ready | loading | error`), `emptyState`, `noResultsHint`, `partialNotice`, `onRowOpen`, `rowLabel`, `selectable`, `bulkActions`, `features` (turn off search, filters, density, columns, export, pagination), `toolbarRight`, `initialSort`, `initialPageSize`, `initialDensity`, `initialHidden`, `onExported`.

## Density and secondary text

`initialDensity` / `useTableState` density is `"compact"` (default) or `"comfortable"`; the toolbar toggle "Compact rows" switches. **Compact is single-line rows** (about 41px): cells never wrap, long text ends in an ellipsis, and on hover a cut cell shows its full text as a `title` tooltip. **Comfortable** keeps the roomy rows: secondary text stacked on a second line, wrapping allowed. Existing tables became single-line when the default changed; pass `initialDensity="comfortable"` to keep the old look.

Put a primary and a secondary text in one cell with `CellSub`:

```tsx
cell: (f) => <><span className="dt-title">{f.title}</span><CellSub>{f.id} · {f.category}</CellSub></>
```

Compact: the secondary text sits inline after the primary text, muted, and is cut off first. Comfortable: it is a second line. Rules: nothing essential only in `CellSub` (it can be truncated; hover shows it, keyboard users get everything in the row detail drawer opened by the row button, and screen readers read the full DOM text); keep status words and severities in their own short column; give the detail view every value shown in the table.

State is held in memory only. Nothing is persisted to storage or the URL.

## Required or optional per table

| Feature | Findings-style list | Short reference list |
|---|---|---|
| Caption, `noun`, `getRowId` | required | required |
| Sortable columns, stable default sort | required | optional |
| Search | required | off |
| Facet filters with counts, chips, reset | required where >1 dimension | off |
| Pagination | required above 10 rows | off |
| Row open button | required when a detail view exists | optional |
| Selection and bulk actions | optional | off |
| Column menu, density, CSV export | optional | off |
| `noResultsHint` | required for scan-derived data | n/a |
| `partialNotice` | required when coverage is partial or failed | n/a |

## Do

- Show the count "x of y noun" and keep it announced politely.
- Give each filter option a count that respects the other active filters.
- Put ranks into `sortValue` (critical > high > medium > low > review), never sort severity labels alphabetically.
- Pair colour with icon and text (badges do this already).
- Keep the first cell short: it holds the button that opens the item.
- Say what filtered lists are filtered by (chips) and offer Reset.

## Don't

- Never present "0 results" as "no issues". For scan data always set `noResultsHint`.
- Never randomise or leave the default order unspecified. Equal values keep their original order.
- No page sizes above 50 and no "show all".
- Don't hide a sort or filter state that changes what a viewer concludes.
- Don't render interactive content (links, buttons) inside the first cell other than the row button.
- Don't use the CSV export for data the viewer may not have. Export is client-side and covers filtered rows in the visible columns.

## Keyboard map

| Key | Action |
|---|---|
| Tab / Shift+Tab | Move through search, filter buttons, toolbar, header sort buttons, row buttons, pager |
| Enter / Space on a header button | Cycle sort: ascending, descending, none |
| Shift+Enter / Shift+click on a header | Add or cycle a secondary sort |
| Enter / Space on a filter button | Open the filter popover. Arrow keys / Tab move between options, Space toggles, Esc closes and returns focus |
| Esc in the search field | Clear the search |
| Enter / Space on a row button | Open the item (`onRowOpen`) |
| Space on a checkbox | Select row, or select all on this page from the header |
| Enter on Columns | Open the column menu. Arrow keys move, Space toggles, Esc closes |
| Enter on pager buttons | First, previous, next, last. At the ends they stay focusable (`aria-disabled`) so focus is not lost |

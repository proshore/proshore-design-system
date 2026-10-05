# Charts (design system module)

Code: `src/components/charts/`. Live specimen: `#/lab/charts`. Hand-written SVG and CSS, no chart library. All data in the specimen is demo data.

## When to use which

| Component | Use for | Do not use for |
|---|---|---|
| `ChartCard` | Wrapping every chart: takeaway title, one-sentence description, caveat, legend, provenance, "View as table" | Charts without a table alternative |
| `BarChart` | Comparing magnitudes across 2 to ~12 categories. Horizontal for long labels, vertical for few short ones. `stacked` only when parts sum to a meaningful total | Time series with many points (TrendLine); one part-to-whole row (StackedBar) |
| `StackedBar` | One total split into 2 to 5 parts (severity split, scan coverage split) | Comparing several totals; replacing a pie or donut |
| `TrendLine` | Change over scans or time: 2 to 4 series, 3+ points, zero baseline | One or two points (use a StatCard); two measures of different scale |
| `Sparkline` | Direction of change inside a stat card or table cell, next to the real number | Comparing magnitudes between rows (not zero-based); anything without a nearby number |
| `Legend` | 2+ series: shape or pattern plus label | A single series (the title names it) |

## Colour tokens (defined in `charts.css`, light and dark)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--chart-1` | clear-blue | clear-blue-light | Series 1 (pattern solid, marker circle) |
| `--chart-2` | saffron-dark | saffron-light | Series 2 (dots, square) |
| `--chart-3` | terai-dark | terai-light | Series 3 (grid, diamond) |
| `--chart-4` | marigold-dark | marigold-light | Series 4 (solid, triangle) |
| `--chart-5` | neutral-dark | neutral-light | Series 5 / "not scanned" |
| `--chart-6` | lapis-light | lapis-lighter | Series 6 |
| `--chart-sev-critical` | `--sherpa-danger-border` | `--sherpa-danger-fg` | Critical (solid, circle) |
| `--chart-sev-high` | `--sherpa-danger-fg` | #ff5c74 (interp) | High (dots, square) |
| `--chart-sev-medium` | marigold-dark | marigold-light | Medium (solid, diamond) |
| `--chart-sev-low` | clear-blue | clear-blue-light | Low (solid, triangle) |
| `--chart-sev-review` | neutral | neutral-light | Review item, hotspot (grid) |
| `--chart-grid`, `--chart-axis` | neutral-lighter, neutral | white 14%, neutral-light | Gridlines, axes (recessive) |

Contrast against `--sherpa-surface` (computed WCAG ratio, non-text 3:1 target): light 3.07 (marigold, lowest) to 8.4; dark 5.1 to 9.8. Marigold in light mode is close to the limit, so it is never used alone: pattern, shape and value labels always accompany it. Colour-blind separation was not run through a simulator; separation relies on pattern and shape.

Fixed order, never cycled. A 7th series folds into "Other" or becomes small multiples. Text never wears a series colour.

## Data-honesty rules

1. `coverage` is "complete", "partial" or "none" on every datum. Partial renders hatched or dashed with a ">=" prefix on values and the card caveat. None renders "No evidence", never a zero bar: unknown is not zero.
2. Counts are "at least" when scan coverage is partial. Say so in the caveat, and do not compare partial scans with complete ones without warning.
3. Sample data is labelled as demo data in the source footer. Generated or inferred values are not presented as verified facts.
4. Bars start at zero. One y axis only. Axis units are always labelled.
5. No composite risk scores, gauges, 3D, donuts, or pies with more than 4 slices. Raw finding counts are not business risk.

## Do

- Title with the takeaway ("Billing is unknown, not clean").
- Direct end labels on lines and value labels on bars; legend as well for 2+ series.
- Provide the table view and a text summary (`aria-label` on the chart, visible summary on StackedBar).
- Keyboard: trend points are one tab stop; arrow keys move between points and series, Escape hides the tooltip. Tooltips appear on hover and focus.

## Do not

- Rely on colour alone, use the series colour for text, or repaint series when a filter changes the series count.
- Draw partial data as if complete, or show zero for missing evidence.
- Add animation (none is used; `prefers-reduced-motion` is respected by default).

# Chart spike: Recharts vs visx vs today's hand-written charts (29 Sep 2026)

Code: `apps/chartspike` (`npm run dev -w chartspike`, port 5176; tabs "Hand-written (today)", "Recharts 3.10.1", "visx 4.0.0"). Same demo fixtures as Discovery, same `ChartCard` (title, caveat, legend, source, View as table) around every chart. Demo data only.

## What each engine had to draw (our honesty rules)

Three charts: (1) scan trend, 4 series, 4 scans, 3 partial; (2) stacked horizontal bars by application, Inventory partial, Billing not scanned; (3) one-row severity split of scan S-104 (partial). Rules: series colour from `--chart-*` tokens in light and dark; a second channel besides colour (bar pattern, marker shape); partial coverage hatched or dashed and hollow, values shown as "≥n"; not scanned shown as "No evidence", never a zero bar; keyboard access to the data; a text summary for screen readers; the table view stays ours.

## Results (measured or observed, in the Browser pane)

| | Hand-written (today) | Recharts 3.10.1 | visx 4.0.0 |
| --- | --- | --- | --- |
| Lazy chunk (min / gzip) | about 3 kB page + our chart code in the main bundle | **355 kB / 100 kB** | **44 kB / 15 kB** (d3 code shared in a small common chunk) |
| Spike page lines | 23 (library code: BarChart 113, TrendLine 104, StackedBar 33, shared 84, CSS 98) | 122 | 140 |
| Tokens light and dark | yes | yes (verified: same computed fills and ticks as visx in both themes) | yes (same) |
| Pattern fills, hatched partial | HTML/CSS | needed a custom `shape` for every bar series and shared SVG `<pattern>` defs | shared SVG `<pattern>` defs, plain `<rect fill=url(#...)>` |
| Dashed partial segments | yes | **no built-in**: dashes apply to a whole line, so we drew segments ourselves from `useXAxisScale`/`useYAxisScale` and used Recharts only for axes, grid and tooltip | plain `<line>` per segment |
| Hollow markers by shape | yes | custom `dot` renderer | plain `<path>` |
| Totals and "No evidence" labels | yes | **workaround**: a zero value renders no label, so a near-zero "carrier" bar was needed | plain `<text>` |
| Keyboard | roving arrows across points and series | one tab stop (`role="application"`), left/right steps through scans, tooltip follows. Not per series. | roving arrows across points and series, as today (16 stops in the trend chart) |
| Screen reader | summary plus per-point labels | `title`/`desc` on the svg. **Tooltip is not announced** (no live region). | summary plus a full label per point |
| axe (WCAG 2.2 AA, best practice) | 0 chart violations | 0 chart violations | 0 chart violations |
| Responsive | own hook | `ResponsiveContainer`, needs a parent with definite height | ResizeObserver hook (visx `ParentSize` sizes through requestAnimationFrame, so nothing rendered in a hidden tab) |
| Chart types beyond ours | none | many out of the box (area, pie, scatter, composed) | primitives for all of them, each drawn by us |

Caveats on the numbers: line counts are not like for like (the spike omits direct end labels and label collision handling that TrendLine has). SVG text contrast cannot be measured by axe (reported as incomplete for all three); tick and series colours are the same tokens as today. Nothing was compared by eye (pane hidden, no screenshots). Animations, print, and touch were not tested. Not spiked: ECharts, Base UI charts.

## What the spike says

1. Recharts gives us axes, grid, responsive sizing and a basic keyboard/tooltip, but our rules that matter most (per-segment dashes, patterns, no-evidence, at-least labels) all needed custom code or workarounds inside it, and it costs about 8 times the bytes of visx. Its screen-reader support is weaker than what we have today.
2. visx needs no workarounds because it only provides scales, axes, grids, tooltips and shapes; the rules are plain SVG. More code per chart than Recharts, but similar to the spike's Recharts page once the workarounds are counted.
3. Our current hand-written engine already meets every rule and has no dependency. Its weakness is scale: every new chart type (area, scatter, heatmap, tooltips near edges, axes with dates) is ours to build.

## Recommendation (needs Jeroen's decision)

Adopt **visx primitives under our existing `Chart*` wrappers** (`ChartCard`, legend rules, table view, data-honesty states stay ours). Replace the hand-written scale, axis, grid, tooltip and responsive code; keep the honesty layer. Do not adopt Recharts: the bundle and the workarounds outweigh what it gives us for this rule set. This changes my earlier recommendation in `docs/libraries.md` (Recharts), which was made before this spike. Reverse it if the product later needs many quick standard charts by non-specialists; then Recharts behind the same wrappers is still possible because apps only import our component names.

Risks: visx 4.0.0 is from June 2026 and I did not check its maintenance history beyond release dates; the maintainers ship rarely. Replacing the hand-written charts is a refactor with regression risk, so do it chart by chart against the same fixtures and the accessibility checks used here.

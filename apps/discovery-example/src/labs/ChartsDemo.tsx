import { Text } from "@proshore/ui";
import { Grid, Page, PageHeader, Panel, Section, Stack, StatCard } from "@proshore/ui";
import { scanTrend, severityByApp } from "../fixtures/moreFindings";
import { BarChart, ChartCard, Legend, SEVERITY_SERIES, Sparkline, StackedBar, TrendLine, barTable, categorical, trendTable, type BarDatum, type LegendItem, type TrendPoint } from "@proshore/ui";

const sev = SEVERITY_SERIES;
const sev4 = sev.slice(0, 4);
const partialItem: LegendItem = { label: "Partial coverage (at least)", color: "var(--chart-axis)", partial: true };
const barLegend = (s = sev): LegendItem[] => s.map((x) => ({ label: x.label, color: x.color, pattern: x.pattern }));
const lineLegend = (s = sev4): LegendItem[] => s.map((x) => ({ label: x.label, color: x.color, shape: x.shape, kind: "line" as const }));

const points: TrendPoint[] = scanTrend.map((s) => ({ x: s.scan, caption: s.date, coverage: s.coverage, values: { critical: s.critical, high: s.high, medium: s.medium, low: s.low } }));
const byApp: BarDatum[] = severityByApp.map((a) => ({
  label: a.app, coverage: a.noEvidence ? "none" : a.app === "Inventory" ? "partial" : "complete",
  values: { critical: a.critical, high: a.high, medium: a.medium, low: a.low, review: a.review },
}));
const perScan: BarDatum[] = scanTrend.map((s) => ({ label: `${s.scan} (${s.date.slice(5)})`, coverage: s.coverage, values: { critical: s.critical, high: s.high, medium: s.medium, low: s.low } }));
const covSeries = categorical([{ key: "a", label: "Owners" }, { key: "b", label: "Teams" }, { key: "c", label: "Regions" }]);
const s104 = scanTrend[3];
const highs = scanTrend.map((s) => s.high), crits = scanTrend.map((s) => s.critical);
const partialFlags = scanTrend.map((s) => s.coverage === "partial");

const RULES = [
  "Colour is never the only channel: every series also has a pattern (bars) or a marker shape (lines), plus a direct label or legend entry.",
  "Incomplete data is never drawn as complete: partial coverage is hatched or dashed with an \"at least\" caveat; no evidence is an explicit empty state, never a zero.",
  "The title states the takeaway in plain language; axis units are always labelled; bars start at zero.",
  "Every chart has a View as table alternative and a text summary for screen readers.",
  "No composite risk scores, gauges, 3D, dual y axes, donuts, or pies with more than 4 slices.",
  "Series colours come from --chart-1..6 in fixed order, never cycled; severity uses the --pr-danger-* family for critical and high.",
];

/** Living specimen of the chart module. Demo data only; nothing here is a verified customer fact. */
export function ChartsDemo() {
  return (
    <Page>
      <PageHeader eyebrow="Design system / lab" title="Charts" description="Hand-written accessible SVG and CSS charts on demo data. Every chart states a takeaway, shows its coverage honestly and has a table view." />
      <Section title="Stat cards with sparklines" description="Sparklines show direction only. The number beside them carries the value.">
        <Grid min={220}>
          <StatCard label="High findings" value={<>{s104.high}</>} caveat="At least: scan S-104 is partial" trend={<Sparkline values={highs} partial={partialFlags} label={`High findings across four scans: ${highs.join(", ")}. Latest scan partial.`} />} />
          <StatCard label="Critical findings" value={<>{s104.critical}</>} caveat="At least: scan S-104 is partial" trend={<Sparkline values={crits} partial={partialFlags} color="var(--chart-sev-critical)" label={`Critical findings across four scans: ${crits.join(", ")}. Latest scan partial.`} />} />
          <StatCard label="Billing findings" value="Unknown" caveat="No evidence yet: not scanned, which is not zero" />
        </Grid>
      </Section>

      <Section title="Charts">
        <Grid min={440} align="start">
          <ChartCard title="High findings fell, but the last scan is incomplete" description="Findings observed per scan by severity. Dashed lines and hollow markers mark partial scans."
            coverage="partial" caveat="S-101, S-102 and S-104 covered only part of the landscape, so counts are at least, and scans are not strictly comparable."
            legend={<Legend items={[...lineLegend(), { label: "Partial scan", color: "var(--chart-axis)", kind: "line", partial: true, hollow: true }]} />}
            source="Scans S-101 to S-104, trivy + osv-scanner, demo data" table={trendTable(sev4, points)}>
            <TrendLine series={sev4} points={points} unit="Findings observed (count)" />
          </ChartCard>

          <ChartCard title="Ordering carries most findings; Billing is unknown, not clean" description="Findings by application and severity, latest scan. Billing has no scan evidence."
            coverage="partial" caveat="Inventory was only partly scanned, so its counts are at least. Billing was not scanned."
            legend={<Legend items={[...barLegend(), partialItem]} />}
            source="Scan S-104, trivy + osv-scanner + semgrep, demo data" table={barTable(sev, byApp, true)}>
            <BarChart series={sev} data={byApp} unit="Findings observed (count)" stacked />
          </ChartCard>

          <ChartCard title="Findings per scan, split by severity" description="Vertical stacked bars: total on top, segments by severity."
            coverage="partial" caveat="Hatched bars are partial scans; compare with care."
            legend={<Legend items={[...barLegend(sev4), partialItem]} />}
            source="Scans S-101 to S-104, demo data" table={barTable(sev4, perScan, true)}>
            <BarChart series={sev4} data={perScan} unit="Findings observed (count)" orientation="vertical" stacked />
          </ChartCard>

          <ChartCard title="High findings outnumber critical in both recent scans" description="Grouped (unstacked) bars compare two severities in the last two scans."
            legend={<Legend items={barLegend(sev.slice(0, 2))} />}
            source="Scans S-103 and S-104, demo data" table={barTable(sev.slice(0, 2), perScan.slice(2).map((d) => ({ ...d, coverage: "complete" })))}>
            <BarChart series={sev.slice(0, 2)} data={perScan.slice(2).map((d) => ({ ...d, coverage: "complete" }))} unit="Findings observed (count)" />
          </ChartCard>

          <ChartCard title="Medium is the largest share of S-104 findings" description="Severity split of the latest scan as one row."
            coverage="partial" caveat="Scan S-104 is partial."
            legend={<Legend items={[...barLegend(sev4), partialItem]} />}
            source="Scan S-104, demo data" table={{ head: ["Severity", "Findings (at least)"], rows: sev4.map((s) => [s.label, `≥${(s104 as Record<string, unknown>)[s.key]}`]) }}>
            <StackedBar subject="Scan S-104" unit="findings observed" coverage="partial" segments={sev4.map((s) => ({ label: s.label, value: (s104 as unknown as Record<string, number>)[s.key], color: s.color, pattern: s.pattern }))} />
          </ChartCard>

          <ChartCard title="Two of four repositories are fully scanned" description="Scan coverage of the bounded landscape, in repositories."
            legend={<Legend items={[{ label: "Fully scanned", color: "var(--chart-3)" }, { label: "Partly scanned", color: "var(--chart-4)", partial: true }, { label: "Not scanned", color: "var(--chart-5)", pattern: "empty" }]} />}
            source="Scan S-104 coverage report, demo data" table={{ head: ["Coverage", "Repositories"], rows: [["Fully scanned", 2], ["Partly scanned", 1], ["Not scanned", 1]] }}>
            <Stack gap={4}>
              <StackedBar subject="Repositories in scope" unit="repositories" segments={[{ label: "Fully scanned", value: 2, color: "var(--chart-3)" }, { label: "Partly scanned", value: 1, color: "var(--chart-4)" }, { label: "Not scanned", value: 1, color: "var(--chart-5)", pattern: "empty" }]} />
              <StackedBar subject="Billing, findings" unit="findings" coverage="none" segments={[]} />
            </Stack>
          </ChartCard>
        </Grid>
      </Section>

      <Section title="Legend and colour tokens" description="Series colours in fixed order. Shape and pattern accompany every colour.">
        <Grid min={320} align="start">
          <Panel title="Categorical series (chart-1..6)"><Stack gap={3}><Legend label="Categorical" items={covSeries.map((s) => ({ label: `${s.label} (${s.color.replace("var(", "").replace(")", "")})`, color: s.color, pattern: s.pattern }))} /><Legend label="Markers" items={covSeries.map((s) => ({ label: s.label, color: s.color, shape: s.shape, kind: "line" }))} /></Stack></Panel>
          <Panel title="Severity"><Stack gap={3}><Legend items={barLegend()} /><Legend label="Severity markers" items={lineLegend(sev)} /></Stack></Panel>
        </Grid>
      </Section>

      <Section title="Rules">
        <Panel><ul style={{ margin: 0, paddingLeft: "var(--space-5)" }}>{RULES.map((r) => <li key={r}><Text size="2">{r}</Text></li>)}</ul></Panel>
      </Section>
    </Page>
  );
}

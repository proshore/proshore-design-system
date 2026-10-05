import { BarChart, ChartCard, Legend, Page, PageHeader, Section, Sparkline, StackedBar, TrendLine, barTable, categorical, trendTable, useMessages } from "@proshore/ui";

const series = categorical([{ key: "paid", label: "Done" }, { key: "open", label: "Open" }]);
const bars = [{ label: "Finance", values: { paid: 40, open: 12 } }, { label: "Operations", values: { paid: 32, open: 9 } }, { label: "IT", values: { paid: 18, open: 14 } }];
const trendSeries = categorical([{ key: "tickets", label: "New requests" }]);
const points = ["Jun", "Jul", "Aug", "Sep", "Oct"].map((x, i) => ({ x, values: { tickets: [12, 18, 15, 22, 19][i] } }));
const legend = (<Legend items={series.map((s) => ({ label: s.label, color: s.color, pattern: s.pattern }))} />);

export function ChartsPage() {
  const { t } = useMessages();
  return (
    <Page>
      <PageHeader eyebrow="Components" title="Charts" description="Every chart has a text title that states the finding, a data table for screen readers, patterns as well as colour, and says where the data comes from." />
      <Section title="Bar chart">
        <ChartCard title="IT has the largest share still open" description="Done and open requests per team." source="Requests, demo data" table={barTable(series, bars, false, t)} legend={legend}>
          <BarChart series={series} data={bars} unit="Requests" stacked />
        </ChartCard>
      </Section>
      <Section title="Trend">
        <ChartCard title="New requests rose after August" description="Requests per month." source="Requests, demo data" table={trendTable(trendSeries, points, t)}>
          <TrendLine series={trendSeries} points={points} unit="Requests" />
        </ChartCard>
      </Section>
      <Section title="Stacked bar and sparkline">
        <StackedBar subject="Requests by status" unit="requests" segments={[{ label: "Done", value: 60, color: "var(--chart-1)" }, { label: "In progress", value: 25, color: "var(--chart-1-tint)" }, { label: "Waiting", value: 15, color: "var(--chart-2)" }]} />
        <Sparkline values={[3, 5, 4, 7, 6, 9]} label="Requests over the last six weeks, rising" />
      </Section>
    </Page>
  );
}

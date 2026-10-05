import { Button, Code, Text } from "@proshore/ui";
import { useState } from "react";
import { applications } from "../fixtures/brightfield";
import type { FindingRecord, ReviewState, Severity } from "../fixtures/brightfield";
import { allFindings } from "../fixtures/moreFindings";
import { DemoTag } from "@proshore/ui";
import { Cluster, Grid, Page, PageHeader, Panel, Section, Stack } from "@proshore/ui";
import { EvidenceBadge, SeverityBadge, evidenceMeta } from "../ui";
import { DataTable, EmptyState, ErrorState, NoResults, PartialBanner, TableSkeleton, type ColumnDef } from "@proshore/ui";

const severityRank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, review: 4 };
const severityLabel: Record<Severity, string> = { critical: "Critical", high: "High", medium: "Medium", low: "Low", review: "Review item" };
const reviewLabel: Record<ReviewState, string> = { unreviewed: "Not reviewed", "needs-review": "Needs review", confirmed: "Confirmed", disputed: "Disputed" };
const appName = (id: string) => applications.find((a) => a.id === id)?.name ?? id;

const findingColumns: ColumnDef<FindingRecord>[] = [
  { id: "finding", header: "Finding", sticky: true, width: 320, accessor: (f) => f.title, searchText: (f) => `${f.title} ${f.id} ${f.category}`,
    cell: (f, { highlight }) => (<><span className="dt-title">{highlight(f.title)}</span><span className="dt-sub">{highlight(f.id)} · {highlight(f.category)}</span></>) },
  { id: "app", header: "Application", accessor: (f) => appName(f.appId), filter: { kind: "multi", value: (f) => f.appId, options: applications.map((a) => ({ value: a.id, label: a.name })) },
    cell: (f) => appName(f.appId) },
  { id: "step", header: "Journey step", accessor: (f) => f.capability, searchText: (f) => f.capability },
  { id: "evidence", header: "Evidence", accessor: (f) => evidenceMeta[f.state].label, searchText: false,
    filter: { kind: "multi", value: (f) => f.state, options: (["observed", "inferred", "confirmed", "unknown"] as const).map((v) => ({ value: v, label: evidenceMeta[v].label })) },
    cell: (f) => <EvidenceBadge state={f.state} /> },
  { id: "severity", header: "Tool severity", sortValue: (f) => severityRank[f.severity], csv: (f) => severityLabel[f.severity] + " (tool-reported)",
    filter: { kind: "multi", value: (f) => f.severity, options: (Object.keys(severityRank) as Severity[]).map((v) => ({ value: v, label: severityLabel[v] })) },
    cell: (f) => <SeverityBadge severity={f.severity} /> },
  { id: "review", header: "Review status", accessor: (f) => reviewLabel[f.reviewState], searchText: (f) => `${reviewLabel[f.reviewState]} ${f.reviewNote}`,
    filter: { kind: "select", value: (f) => f.reviewState, options: (Object.keys(reviewLabel) as ReviewState[]).map((v) => ({ value: v, label: reviewLabel[v] })) },
    cell: (f, { highlight }) => (<><span>{reviewLabel[f.reviewState]}</span><span className="dt-sub">{highlight(f.reviewNote)}</span></>), csv: (f) => `${reviewLabel[f.reviewState]}: ${f.reviewNote}` },
  { id: "tools", header: "Tools", align: "end", sortValue: (f) => f.security.tools.length, accessor: (f) => f.security.tools.length, searchText: false },
];

type Repo = { repo: string; app: string; stack: string; scan: string };
const repos: Repo[] = applications.flatMap((a) => a.repos.map((r) => ({ repo: r, app: a.name, stack: a.stack, scan: a.coverage })));
const repoColumns: ColumnDef<Repo>[] = [
  { id: "repo", header: "Repository", accessor: (r) => r.repo, sticky: true },
  { id: "app", header: "Application", accessor: (r) => r.app },
  { id: "stack", header: "Stack", accessor: (r) => r.stack },
  { id: "scan", header: "Latest scan", accessor: (r) => r.scan },
];

const rules: [string, string][] = [
  ["Zero results is not zero issues", "Whenever a list comes from a scan, set noResultsHint so the empty state reminds people to check coverage."],
  ["Default sort stays stable", "Rows with equal values keep their original order. Set an initial sort when order matters, never randomise."],
  ["Cap page sizes", "10, 25 or 50 rows. No “show all”: long lists need filters, not scrolling."],
  ["Colour is never the only signal", "Badges pair colour with icon and text. Sort state uses arrows plus aria-sort."],
  ["Search box is for text, filters are for facets", "Every filter shows a count per option and appears as a removable chip."],
  ["Every row has one way in", "The first cell holds the button that opens the item. Keep that cell short."],
];

export function TableDemo() {
  const [opened, setOpened] = useState<string>("Nothing opened yet");
  const [exported, setExported] = useState<string>("Nothing exported yet");
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready");
  return (
    <Page>
      <PageHeader eyebrow="Design system" title="Data table and filters" description={<>Sortable, searchable, filterable table with paging, selection and CSV export. Fixture data only. <DemoTag /></>} />
      <Stack gap={6}>
        <Section id="full" title="Findings table (all features)" description="40 demo findings. Click a header to sort, shift-click to add a secondary sort. Try search, filter buttons, Columns, Compact rows and selection.">
          <Stack gap={3}>
            <Cluster gap={3}>
              <Text size="2" role="status" data-testid="opened">{opened}</Text>
              <Text size="2" color="gray" role="status" data-testid="exported">{exported}</Text>
              <Button size="1" variant="ghost" onClick={() => setStatus(status === "loading" ? "ready" : "loading")}>Toggle loading</Button>
              <Button size="1" variant="ghost" onClick={() => setStatus(status === "error" ? "ready" : "error")}>Toggle error</Button>
            </Cluster>
            <DataTable
              caption="Findings" noun="findings" columns={findingColumns} rows={allFindings} getRowId={(f) => f.id} status={status}
              errorMessage="Demo error: the findings endpoint did not answer." onRetry={() => setStatus("ready")}
              selectable noResultsHint rowLabel={(f) => `${f.title} (${f.id})`}
              onRowOpen={(f) => setOpened(`Opened ${f.id}`)}
              onExported={({ count, filename }) => setExported(`Exported ${count} rows to ${filename}`)}
              initialSort={[{ id: "severity", dir: "asc" }]}
              partialNotice={<PartialBanner>Scan S-104 is partial: Semgrep returned nothing, Gitleaks results were not recorded and Billing was not scanned. This list is incomplete.</PartialBanner>}
              bulkActions={(rows) => <Button size="1" variant="soft" onClick={() => setOpened(`Assigned ${rows.length} findings for review (demo)`)}>Assign for review</Button>}
            />
          </Stack>
        </Section>

        <Section id="minimal" title="Minimal variant" description="Compact, no filters, no paging: for short reference lists.">
          <DataTable caption="Repositories" noun="repositories" columns={repoColumns} rows={repos} getRowId={(r) => r.repo} initialDensity="compact"
            features={{ search: false, filters: false, density: false, columns: false, export: false, pagination: false }} />
        </Section>

        <Section id="states" title="States">
          <Grid min={280} gap={4} align="start">
            <Panel title="Loading" tight><TableSkeleton columns={4} rows={4} label="Loading findings" /></Panel>
            <Panel title="Empty (no data yet)" tight><EmptyState title="No findings yet" description="Run a scan on this application to see items that need review." action={<Button variant="soft">Start a scan</Button>} /></Panel>
            <Panel title="No results" tight>
              <NoResults hint onReset={() => undefined} filters={[{ key: "a", columnId: "app", label: "Application", value: "Billing", remove: () => undefined }]} />
            </Panel>
            <Panel title="Error" tight><ErrorState message="Demo error: the findings endpoint did not answer." onRetry={() => undefined} /></Panel>
          </Grid>
        </Section>

        <Section id="rules" title="Rules">
          <Panel>
            <Stack gap={3}>
              {rules.map(([t, d]) => (<div key={t}><Text as="p" size="2" weight="bold">{t}</Text><Text as="p" size="2" color="gray">{d}</Text></div>))}
              <Text as="p" size="2" color="gray">Full guidance: <Code>docs/tables.md</Code></Text>
            </Stack>
          </Panel>
        </Section>
      </Stack>
    </Page>
  );
}

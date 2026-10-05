import { SeverityBadge, evidenceMeta } from "../ui";
import type { ColumnDef } from "@proshore/ui";
import { applications } from "../fixtures/brightfield";
import type { FindingRecord, ReviewState, Severity } from "../fixtures/brightfield";

const severityRank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, review: 4 };
const severityLabel: Record<Severity, string> = { critical: "Critical", high: "High", medium: "Medium", low: "Low", review: "Review item" };
const reviewLabel: Record<ReviewState, string> = { unreviewed: "Not reviewed", "needs-review": "Needs review", confirmed: "Confirmed", disputed: "Disputed" };
const appName = (id: string) => applications.find((a) => a.id === id)?.name ?? id;

/** Column definitions for the findings table. Search, sort, filters and CSV all come from these. */
export const findingColumns: ColumnDef<FindingRecord>[] = [
  { id: "finding", header: "Finding", sticky: true, width: 320, accessor: (f) => f.title, searchText: (f) => `${f.title} ${f.id} ${f.category}`,
    cell: (f, { highlight }) => (<><span className="dt-title" title={f.title}>{highlight(f.title)}</span><span className="dt-sub">{highlight(f.id)} · {highlight(f.category)}</span></>) },
  { id: "app", header: "Application", accessor: (f) => appName(f.appId), filter: { kind: "multi", value: (f) => f.appId, options: applications.filter((a) => a.id !== "billing").map((a) => ({ value: a.id, label: a.name })) }, cell: (f) => appName(f.appId) },
  { id: "step", header: "Journey step", hideBelow: 1000, accessor: (f) => f.capability, searchText: (f) => f.capability },
  { id: "evidence", header: "Evidence", accessor: (f) => evidenceMeta[f.state].label, searchText: false,
    cell: (f) => { const { label, Icon } = evidenceMeta[f.state]; return <span className="dt-quiet" data-tone={f.state === "observed" ? undefined : f.state} title={f.state === "inferred" ? "Generated or inferred, not yet confirmed by a person" : undefined}><Icon aria-hidden /> {label}</span>; } },
  { id: "severity", header: "Tool severity", sortValue: (f) => severityRank[f.severity], csv: (f) => severityLabel[f.severity] + " (tool-reported)",
    filter: { kind: "multi", value: (f) => f.severity, options: (Object.keys(severityRank) as Severity[]).map((v) => ({ value: v, label: severityLabel[v] })) },
    cell: (f) => <SeverityBadge severity={f.severity} compact /> },
  { id: "review", header: "Review status", accessor: (f) => reviewLabel[f.reviewState], searchText: (f) => `${reviewLabel[f.reviewState]} ${f.reviewNote}`,
    filter: { kind: "select", value: (f) => f.reviewState, options: (Object.keys(reviewLabel) as ReviewState[]).map((v) => ({ value: v, label: reviewLabel[v] })) },
    cell: (f) => (<><span className="dt-status" data-state={f.reviewState}>{reviewLabel[f.reviewState]}</span><span className="dt-sub">{f.reviewNote}</span></>), csv: (f) => `${reviewLabel[f.reviewState]}: ${f.reviewNote}` },
];

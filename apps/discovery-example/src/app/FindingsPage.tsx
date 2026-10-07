import { Badge } from "@proshore/ui";
import { useMemo } from "react";
import { DataTable, PageHeader, PartialBanner, Page } from "@proshore/ui";
import { allFindings, applicationsWithStats as applications, journeyWithStats as journey } from "../fixtures/derived";
import { findingColumns } from "./findingColumns";
import type { PageProps } from "./Layout";

export default function Findings({ openFinding, params }: PageProps) {
  const step = params.get("step");
  const stepName = step ? journey.find((j) => j.id === step)?.name : undefined;
  const app = params.get("app");
  const rows = useMemo(() => allFindings.filter((f) => (!stepName || f.capability === stepName) && (!app || f.appId === app)), [stepName, app]);
  return (
    <Page>
      <PageHeader breadcrumbs={stepName ? [{ label: "Landscape", href: "#/landscape" }, { label: "Findings", href: "#/findings" }, { label: stepName }] : undefined} eyebrow="Findings" title="Items that need a person's judgement"
        description="What the scanning tools reported, in plain language. Open an item for the business, security and technical view of the same evidence."
        meta={(stepName || app) ? <Badge variant="soft" size="2">Showing {stepName ? `journey step: ${stepName}` : `application: ${applications.find((a) => a.id === app)?.name}`} <a href="#/findings" style={{ marginLeft: 8 }}>clear</a></Badge> : undefined} />
      <div className="pr-tablecard"><DataTable
        caption="Findings" noun="findings" columns={findingColumns} rows={rows} getRowId={(f) => f.id}
        rowLabel={(f) => `${f.title} (${f.id})`} noResultsHint initialPageSize={25} initialSort={[{ id: "severity", dir: "asc" }]}
        onRowOpen={(f, visible) => openFinding(f, visible)}
        partialNotice={<PartialBanner>Scan S-104 is partial: Semgrep returned nothing, Gitleaks results were not recorded and Billing was not scanned. This list is incomplete, and a review item is not a confirmed vulnerability.</PartialBanner>}
        features={{ columns: false, export: false }}
      /></div>
    </Page>
  );
}


import { DataTable, Page, PageHeader, Section, TableSkeleton, EmptyState, ErrorState, Note, SimpleTable } from "@proshore/ui";
import { requestColumns, requests } from "../data";

export function TablesPage() {
  return (
    <Page>
      <PageHeader eyebrow="Components" title="Tables" description="DataTable sorts, filters, searches, pages and exports. SimpleTable is for short static lists." />
      <Section title="DataTable" description="Click a row or press Enter on it to open the detail. Try sorting, filters and density.">
        <DataTable caption="Requests" noun="requests" columns={requestColumns} rows={requests} getRowId={(r) => r.id} rowLabel={(r) => r.id} />
      </Section>
      <Section title="SimpleTable">
        <SimpleTable caption="Plan" getRowId={(r) => r.plan} rows={[{ plan: "Team", seats: "10", price: "90" }, { plan: "Business", seats: "50", price: "400" }]} columns={[{ id: "plan", header: "Plan", cell: (r) => r.plan }, { id: "seats", header: "Seats", cell: (r) => r.seats }, { id: "price", header: "Price", cell: (r) => r.price }]} />
      </Section>
      <Section title="States" description="Every list needs a loading, empty and error state, not just the happy path.">
        <TableSkeleton columns={4} rows={3} />
        <EmptyState title="No requests yet" description="Create the first request to see it here." />
        <ErrorState message="The server did not answer." onRetry={() => undefined} />
        <Note tone="info">An empty result is not the same as nothing wrong. Say what was and was not covered.</Note>
      </Section>
    </Page>
  );
}

import { Rules } from "../doc/Doc";
import { Badge, Breadcrumbs, Button, Cluster, Disclosure, Grid, KeyValue, Note, Page, PageHeader, Panel, Section, StatCard, Stepper, Tabs, Timeline, toast } from "@proshore/ui";

export function LayoutPage() {
  return (
    <Page>
      <PageHeader eyebrow="Components" title="Layout and feedback" description="Page frame, panels, stats, steps, tabs and the messages that tell people what happened. Built from Page, PageHeader, Section, Grid, WithAside, Stack, Cluster, Panel, KeyValue and StatCard: set no margins or widths on a screen, place things in these." breadcrumbs={[{ label: "Gallery", href: "#/foundations" }, { label: "Layout" }]} actions={<Button onClick={() => toast.show("Saved (demo)", { tone: "success" })}>Show a toast</Button>} />
      <Section>
        <Rules dos={["Put cards in a Grid so columns and gaps come from one place.", "Keep title left and actions right in headers and panels.", "Use KeyValue for label and value pairs so values align."]} donts={["Do not set margin or width on a card.", "Do not nest more than one level of cards.", "Do not show a bare number without scope: use StatCard with a caveat."]} />
      </Section>
      <Section title="Stats">
        <Grid min={220} cap={1100}><StatCard label="Open requests" value="24" caveat="3 older than a week" /><StatCard label="Resolved this month" value="118" /><StatCard label="Average time to resolve" value="2.4 days" caveat="Based on 118 requests" /></Grid>
      </Section>
      <Section title="Notes" description="Use the tone that matches the consequence. Add live only for messages that appear after an action.">
        <div style={{ display: "grid", gap: 8 }}><Note tone="info">Information that helps, nothing is wrong.</Note><Note tone="success">The request was sent.</Note><Note tone="warning">Two accounts have no owner yet.</Note><Note tone="danger">The export failed. Try again or contact support.</Note></div>
      </Section>
      <Section title="Panel, key-value, badges">
        <Panel title="Request REQ-204" eyebrow="Details" actions={<Button variant="outline" size="1">Edit</Button>}>
          <KeyValue items={[{ label: "Requester", value: "Alex Voorbeeld" }, { label: "Status", value: <Badge color="amber">In review</Badge> }, { label: "Updated", value: "5 Oct 2026" }]} />
        </Panel>
        <Cluster gap={2}><Badge>Neutral</Badge><Badge color="green">Done</Badge><Badge color="amber">Waiting</Badge><Badge color="red">Blocked</Badge><Badge color="indigo" variant="outline">New</Badge></Cluster>
      </Section>
      <Section title="Steps, tabs, history" description="Stepper is progress through one task. Timeline is the history of what happened. Tabs switch views of the same item.">
        <Rules dos={["Show state with icon, label and shape, not colour alone.", "Use real links for moving to a different item; tabs are for views of one item."]} donts={["Do not use Stepper for a business process across systems.", "Do not hide something people must read inside a collapsed section."]} />
        <Stepper steps={[{ id: "a", label: "Details", state: "complete" }, { id: "b", label: "Approval", state: "current" }, { id: "c", label: "Payment", state: "upcoming" }]} />
        <Tabs label="Example tabs" items={[{ id: "one", label: "Overview", content: <Panel>Overview content</Panel> }, { id: "two", label: "Activity", content: <Timeline entries={[{ id: "1", when: "Today 09:12", actor: "Sam", text: "Approved the request" }, { id: "2", when: "Yesterday", actor: "System", text: "Reminder sent", kind: "system" }]} /> }]} />
        <Breadcrumbs items={[{ label: "Home", href: "#/foundations" }, { label: "Requests", href: "#/layout" }, { label: "REQ-204" }]} />
        <Disclosure title="Technical detail on demand">Plain language first, detail behind a disclosure.</Disclosure>
      </Section>
    </Page>
  );
}

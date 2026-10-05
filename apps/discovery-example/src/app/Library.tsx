import { Badge, Breadcrumbs, Button, Checkbox, Flex, Heading, IconButton, Note, Tabs, Text, toast } from "@proshore/ui";
import { ArrowRightIcon, CheckCircledIcon, CrossCircledIcon, DownloadIcon } from "@proshore/ui";
import { useState, type ReactNode } from "react";
import { Actions } from "../components/Actions";
import { ApplicationCard } from "../components/ApplicationCard";
import { Eyebrow } from "@proshore/ui";
import { CoverageStatus } from "../components/CoverageStatus";
import { DecisionCard } from "../components/DecisionCard";
import { EvidenceTrail } from "../components/EvidenceTrail";
import { FindingDrawer } from "../components/FindingDrawer";
import { InsightCard } from "../components/InsightCard";
import { Cluster, Grid, KeyValue, Page, PageHeader, Panel, Section, Stack, StatCard, WithAside } from "@proshore/ui";
import { ProcessFlow } from "../ui";
import { Stepper } from "@proshore/ui";
import { Timeline } from "@proshore/ui";
import { CoverageBadge, EvidenceBadge, SeverityBadge } from "../ui";
import { applications, insights, journey } from "../fixtures/brightfield";
import { SherpaTheme } from "@proshore/ui";
import { FormsDemo } from "./FormsDemo";

/** One documented example: preview, usage line, do and don't. `compare` shows light and dark side by side. */
function Demo({ id, title, use, dos, donts, compare, children }: {
  id: string; title: string; use: string; dos?: string[]; donts?: string[]; compare: boolean; children: ReactNode;
}) {
  return (
    <Section id={id} title={title} description={use}>
      {compare ? (
        <div className="l-grid" style={{ "--l-min": "440px" } as React.CSSProperties}>
          {(["light", "dark"] as const).map((a) => (
            <SherpaTheme key={a} appearance={a} root={false}><div className="lib__frame"><Eyebrow>{a}</Eyebrow>{children}</div></SherpaTheme>
          ))}
        </div>
      ) : <Panel><div className="lib__preview">{children}</div></Panel>}
      {(dos || donts) && (
        <div className="l-grid" style={{ "--l-min": "300px", "--l-gap": "var(--space-4)" } as React.CSSProperties}>
          {dos && <ul className="lib__rules" data-kind="do">{dos.map((d) => <li key={d}><CheckCircledIcon aria-hidden /> <Text size="2">{d}</Text></li>)}</ul>}
          {donts && <ul className="lib__rules" data-kind="dont">{donts.map((d) => <li key={d}><CrossCircledIcon aria-hidden /> <Text size="2">{d}</Text></li>)}</ul>}
        </div>
      )}
    </Section>
  );
}

const swatch = (name: string, v: string) => (
  <div key={name} className="lib__swatch"><span style={{ background: `var(${v})` }} /><Text size="1">{name}</Text><code>{v}</code></div>
);

const groups = [
  { id: "foundations", label: "Foundations" }, { id: "layout", label: "Layout" }, { id: "actions", label: "Actions" }, { id: "forms", label: "Forms" },
  { id: "steps", label: "Steps and process" }, { id: "status", label: "Status and provenance" }, { id: "overlays", label: "Overlays" }, { id: "data", label: "Tables and charts" },
];

export function Library({ dataDemos }: { dataDemos?: ReactNode }) {
  const [compare, setCompare] = useState(false);
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  const steps = journey.map((j) => ({ id: j.id, name: j.name, lane: j.appId, state: j.state, note: j.note }));
  const lanes = applications.map((a) => ({ id: a.id, label: a.name }));
  return (
    <Page>
      <PageHeader eyebrow="Design system" title="Component library"
        description="Every pattern used in Sherpa Discovery, with when to use it and what to avoid. Built to be reused by other Proshore applications: nothing here knows about a specific product except the demo data."
        actions={<Checkbox isSelected={compare} onChange={setCompare}>Compare light and dark</Checkbox>} />
      <WithAside asideFirst asideWidth={200} aside={
        <nav aria-label="Library sections"><ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
          {groups.map((g) => (<li key={g.id}><button type="button" className="navlink" style={{ width: "100%", border: 0, background: "none", cursor: "pointer", textAlign: "left" }} onClick={() => go(g.id)}>{g.label}</button></li>))}
        </ul></nav>
      }>
        <Stack gap={6}>
          <Section id="foundations" title="Foundations" description="Tokens, not values. Components read semantic tokens so brand changes happen in one file.">
            <Panel eyebrow="Brand palette (Proshore, Relume)">
              <div className="lib__swatches">{[["Lapis Blue Light", "--pr-lapis-light"], ["Lapis Blue Darker", "--pr-lapis-darker"], ["Clear Blue Lighter", "--pr-clear-blue-lighter"], ["Clear Blue Lightest", "--pr-clear-blue-lightest"], ["Clear Blue Darker", "--pr-clear-blue-darker"], ["Accent mark (Proshore blue)", "--sherpa-accent-mark"], ["Terai Green", "--pr-terai"], ["Marigold", "--pr-marigold"]].map(([n, v]) => swatch(n, v))}</div>
            </Panel>
            <Panel eyebrow="Semantic: evidence, coverage, danger">
              <div className="lib__swatches">{[["Observed", "--sherpa-observed-bg"], ["Inferred", "--sherpa-inferred-bg"], ["Confirmed", "--sherpa-confirmed-bg"], ["Danger", "--sherpa-danger-bg"], ["Surface", "--sherpa-surface"], ["Canvas", "--sherpa-canvas"], ["Line", "--sherpa-line"], ["Review accent", "--sherpa-review-accent"]].map(([n, v]) => swatch(n, v))}</div>
            </Panel>
            <Panel eyebrow="Type: Geist and Geist Mono">
              <Stack gap={2}>
                <Text size="9" weight="bold" style={{ letterSpacing: "-0.02em" }}>Display, 3rem</Text>
                <Heading size="7">Heading, 2rem</Heading><Heading size="5">Section title, 1.25rem</Heading>
                <Text size="3">Body, 1rem. Plain language first, technical detail on demand.</Text>
                <Text size="2" color="gray">Secondary, 0.875rem</Text><span className="sherpa-eyebrow">Eyebrow, Geist Mono uppercase</span>
              </Stack>
            </Panel>
            <Panel eyebrow="Spacing (4, 8, 16, 24, 32) and radius (8, pill)">
              <Cluster gap={4}>{[1, 2, 4, 5, 6].map((n) => (<div key={n} style={{ textAlign: "center" }}><div style={{ width: `var(--space-${n})`, height: `var(--space-${n})`, background: "var(--accent-9)", margin: "0 auto var(--space-1)" }} /><Text size="1">{[4, 8, 16, 24, 32][[1, 2, 4, 5, 6].indexOf(n)]}</Text></div>))}
                <Button size="1">pill</Button><div style={{ width: 64, height: 32, border: "1px solid var(--gray-8)", borderRadius: 8 }} /></Cluster>
            </Panel>
          </Section>

          <Demo id="layout" compare={compare} title="Layout" use="Page, PageHeader, Section, Grid, WithAside, Stack, Cluster, Panel, KeyValue, StatCard. Set no margins or widths on a screen: place things in these."
            dos={["Put cards in a Grid so columns and gaps come from one place.", "Keep title left and actions right in headers and panels.", "Use KeyValue for label/value pairs so values align."]}
            donts={["Do not set margin or width on a card.", "Do not nest more than one level of cards.", "Do not show a bare number without scope: use StatCard with a caveat."]}>
            <Grid min={200} gap={4}><StatCard label="Examined" value="3 apps" caveat="4 repositories" /><StatCard label="Found" value="At least 4" caveat="Scan is partial" />
              <Panel tight eyebrow="Key value"><KeyValue labelWidth={90} items={[{ label: "Scan", value: "S-104" }, { label: "Revision", value: "Not recorded" }]} /></Panel></Grid>
          </Demo>

          <Demo id="actions" compare={compare} title="Actions" use="One primary action per view. Secondary for alternatives, quiet for low emphasis. Pills, sentence case, verbs."
            dos={["Say what happens: “Confirm mapping”, not “OK”.", "Disable with a visible reason, never hide."]} donts={["Do not put two primary buttons in one view.", "Do not use colour alone to mark destructive actions."]}>
            <Stack gap={3}><Actions /><Cluster><IconButton variant="soft" aria-label="Download"><DownloadIcon /></IconButton><Text size="1" color="gray">Icon-only buttons always carry an aria-label.</Text></Cluster></Stack>
          </Demo>

          <Demo id="forms" compare={compare} title="Forms" use="React Aria form primitives with visible labels, descriptions, errors and states. Values are plain strings, so apps never touch library types. Dates are ISO strings; wrap in LocaleProvider for Dutch."
            dos={["Give every field a visible label; hide it only for search boxes.", "Say what is wrong and how to fix it, next to the field.", "Show the same field states everywhere: default, focus, error, disabled."]} donts={["Do not use the placeholder as the label.", "Do not signal errors with colour alone: keep the icon and text.", "Do not ask for credentials or tokens in the prototype."]}>
            <FormsDemo />
          </Demo>

          <Demo id="steps" compare={compare} title="Steps and process" use="Stepper = progress through one task. ProcessFlow = how a business process runs across applications. Timeline = history of what happened."
            dos={["Show state with icon, label and shape, not colour alone.", "Keep ProcessFlow columns as steps and rows as owners."]} donts={["Do not use Stepper for a business process.", "Do not draw links the evidence does not show."]}>
            <Stack gap={5}>
              <Stepper label="Example task" onSelect={() => {}} steps={[{ id: "a", label: "Question", state: "complete" }, { id: "b", label: "Sources", state: "complete" }, { id: "c", label: "Applications", state: "attention" }, { id: "d", label: "People", state: "current" }, { id: "e", label: "Publish", state: "blocked" }]} />
              <ProcessFlow steps={steps} lanes={lanes} label="Example process" />
              <Timeline entries={[{ id: "1", when: "24 Sep", actor: "Sanne de Vries", text: "Confirmed after workshop.", kind: "review" }, { id: "2", when: "22 Sep", actor: "Scan S-104", text: "Reported by trivy, osv-scanner.", kind: "observed" }]} />
            </Stack>
          </Demo>

          <Demo id="status" compare={compare} title="Status and provenance" use="Every material statement carries its state: Observed, Inferred, Confirmed, Unknown; scan coverage: complete, partial, failed. Generalise as provenance and coverage for other apps."
            dos={["Show source and reviewer next to the state.", "Say “at least” when coverage is partial."]} donts={["Never show a partial or failed scan as “no issues”.", "Do not use a composite score as business risk."]}>
            <Stack gap={4}>
              <Cluster><EvidenceBadge state="observed" /><EvidenceBadge state="inferred" /><EvidenceBadge state="confirmed" /><EvidenceBadge state="unknown" /></Cluster>
              <Cluster><CoverageBadge state="complete" /><CoverageBadge state="partial" /><CoverageBadge state="failed" /><SeverityBadge severity="critical" /><SeverityBadge severity="review" /></Cluster>
              <Grid min={240} gap={4}><InsightCard insight={insights[0]} /><InsightCard insight={insights[3]} /><ApplicationCard app={applications[0]} /></Grid>
              <Grid min={320} gap={4}><CoverageStatus state="partial" /><EvidenceTrail /></Grid>
              <DecisionCard openFinding={() => undefined} />
            </Stack>
          </Demo>

          <Demo id="overlays" compare={false} title="Overlays, messages and navigation" use="Slide-over for the detail of one item (fixed anatomy, modal, focus returns). Toast for something that just happened. Note for messages that stay on the page. Tabs for views of the same item. Breadcrumbs for pages deeper than two levels."
            dos={["Give the slide-over prev and next when it opens from a list.", "Use a toast only for events that pass: saved, sent, marked.", "Keep the primary action in the slide-over footer."]}
            donts={["Do not put anything a person must read only in a toast: it disappears.", "Do not stack a second slide-over on top of the first.", "Do not use tabs to move to a different item: use links."]}>
            <Stack gap={4}>
              <Cluster><FindingDrawer /><Button variant="outline" onClick={() => toast.show("Saved (demo)", { tone: "success" })}>Show a toast</Button><Button variant="outline" onClick={() => toast.show("Scan S-104 is partial", { tone: "warning" })}>Warning toast</Button></Cluster>
              <Breadcrumbs items={[{ label: "Landscape", href: "#/landscape" }, { label: "Findings", href: "#/findings" }, { label: "Confirm payment" }]} />
              <Tabs label="Example views" items={[{ id: "a", label: "Business", content: <Text size="2">Plain-language meaning of the item.</Text> }, { id: "b", label: "Security", content: <Text size="2">What the tools reported and did not see.</Text> }, { id: "c", label: "Technical", content: <Text size="2">File, package and version.</Text> }]} />
              <Note tone="warning">A Note stays on the page: partial coverage, a blocked step, something to fix.</Note>
            </Stack>
          </Demo>

          <Section id="data" title="Tables and charts" description="Data tables with search, sorting, filters and pagination, and accessible charts. Each has its own rules page: docs/tables.md and docs/charts.md.">
            {dataDemos ?? <Badge variant="outline">Loading</Badge>}
            <Flex gap="3" wrap="wrap"><Button variant="soft" href="#/lab/table">Open table lab <ArrowRightIcon aria-hidden /></Button><Button variant="soft" href="#/lab/charts">Open charts lab <ArrowRightIcon aria-hidden /></Button></Flex>
          </Section>
        </Stack>
      </WithAside>
    </Page>
  );
}

import { Badge, Button, Card, Flex, Heading, Text } from "@proshore/ui";
import { ArrowRightIcon, InfoCircledIcon } from "@proshore/ui";
import { ApplicationCard } from "../components/ApplicationCard";
import { Eyebrow, HandMark } from "@proshore/ui";
import { CoverageStatus } from "../components/CoverageStatus";
import { DecisionCard } from "../components/DecisionCard";
import { DemoTag } from "@proshore/ui";
import { EvidenceTrail } from "../components/EvidenceTrail";
import { InsightCard } from "../components/InsightCard";
import { Cluster, CountUp, Grid, Note, Page, PageHeader, PageHero, Panel, Section, Stack, StatCard } from "@proshore/ui";
import { ProshoreView } from "../components/ProshoreView";
import { LandscapeMap, MapKey } from "../components/landscape/LandscapeMap";
import { DependencyGraph } from "../components/DependencyGraph";
import { VerifyList } from "../components/VerifyList";
import { SeverityBar } from "../components/SeverityBar";
import { ProcessFlow } from "../ui";
import { CoverageBadge, EvidenceBadge, SeverityBadge } from "../ui";
import { coverageChecks, decision, insights, workspace } from "../fixtures/brightfield";
import { allFindings, applicationsWithStats as applications, awaitingReview, journeyWithStats as journey, stats } from "../fixtures/derived";
import type { PageProps } from "./Layout";

const appName = (id: string) => applications.find((a) => a.id === id)?.name ?? id;

export function Overview({ openAsk, persona }: PageProps) {
  return (
    <Page>
      <PageHero eyebrow={<Cluster><span>Discovery · {workspace.name}</span><DemoTag /></Cluster>}>
        <h1 id="q" className="sherpa-display">
          <strong>Can the current ordering landscape support expansion,</strong> and where should we{" "}
          <HandMark>invest first?</HandMark>
        </h1>
        <p className="pr-hero__desc">Welcome{persona.staff ? "" : `, ${persona.name.split(" ")[0]}`}. Proshore examined three of your applications. Every statement links to its evidence.</p>
        <div style={{ marginTop: "var(--space-5)" }}><Cluster gap={3}>
          <Button size="3" href="#/decision">See the recommended decision <ArrowRightIcon aria-hidden /></Button>
          <Button size="3" variant="outline" onClick={openAsk}>Ask Sherpa</Button>
        </Cluster></div>
      </PageHero>

      <Grid min={260} cap={1180}>
        <StatCard label="Examined" value={<CountUp value={3} />} caveat="applications, 4 repositories" />
        <StatCard label="Found so far" value={<CountUp value={stats.total} prefix="≥ " />} caveat={`items. ${stats.awaiting} need a person to look at them.`} />
        <StatCard label="Not seen" value={<CountUp value={1} />} caveat={<>application: Billing was not scanned. Unknown, not clean. <a href="#/evidence">Coverage</a></>} />
      </Grid>

      <Section id="map" title="Where it stands" description="Your applications in the order a customer meets them. Each step shows how well we can evidence it. Open a step to see its findings.">
        <div><LandscapeMap /><MapKey /></div>
      </Section>

      <ProshoreView statement={decision.recommendation} meta={<>{decision.status} · {decision.owner}</>}
        action={<Button size="3" href="#/decision">Read the reasoning <ArrowRightIcon aria-hidden /></Button>} />

      <div className="l-cols">
        <Section id="sev" title="What the tools reported" description="Tool severity, not business risk. The scan is partial, so counts are at least.">
          <Panel><SeverityBar counts={stats.bySeverity} label="Tool-reported findings by severity" /></Panel>
        </Section>
        <Section id="verify" title="Still to verify">
          <Panel tight><VerifyList items={insights} /></Panel>
        </Section>
      </div>
    </Page>
  );
}

export function Landscape({ params }: PageProps) {
  void params;
  const steps = journey.map((j) => ({ id: j.id, name: j.name, lane: j.appId, state: j.state, note: j.note,
    action: j.toReview ? <Button size="1" variant="soft" href={`#/findings?step=${j.id}`}>{j.toReview} to review</Button> : undefined }));
  const lanes = applications.map((a) => ({ id: a.id, label: a.name, hint: <CoverageBadge state={a.coverage} prefix="" /> }));
  return (
    <Page>
      <PageHeader eyebrow="Landscape" title="One customer journey, three applications"
        description="How an order travels through your software, and where the evidence is strong, weak or missing." />
      <Section id="apps" title="Applications and how they depend on each other" description="What each application is for, what it is built with, where its evidence comes from and how well we could see it. An application is not a repository: repositories are its evidence sources.">
        <div className="lsc">
          <Panel><DependencyGraph /><Text size="1" color="gray" as="p" style={{ margin: "var(--space-2) 0 0" }}>Arrows show which application calls which. Code-derived, so a proposal until your Technical lead confirms it.</Text></Panel>
          <Panel tight>
            <div className="lsc__scroll"><table className="apptable">
              <thead><tr><th scope="col">Application</th><th scope="col">Built with</th><th scope="col">Evidence from</th><th scope="col">Scan</th><th scope="col">Mapping</th></tr></thead>
              <tbody>{applications.map((a) => (
                <tr key={a.id}><th scope="row"><strong>{a.name}</strong><small>{a.role}</small></th><td>{a.stack}</td><td>{a.repos.join(", ")}</td><td><CoverageBadge state={a.coverage} prefix="" /></td><td>{a.review}</td></tr>
              ))}</tbody>
            </table></div>
          </Panel>
        </div>
      </Section>
      <Section id="journey" title="Place and fulfil an order" description="Each column is a step. Each row is the application that carries it.">
        <Panel tight><ProcessFlow steps={steps} lanes={lanes} label="Place and fulfil an order" /></Panel>
      </Section>
    </Page>
  );
}

export function Evidence() {
  return (
    <Page>
      <PageHeader eyebrow="Evidence and coverage" title="What we looked at, and what we could not see"
        description="A finished scan is not the same as full coverage. Each check is listed with what it actually returned." />
      <Section id="cov" title="Scan coverage" description="Some checks are missing or not trusted, so counts are at least what is shown. Absence of results is not a clean bill.">
        <Panel tight>
          <ul className="cov">
            {coverageChecks.map((c) => (
              <li key={c.tool}><span><strong>{c.tool}</strong><small>{c.detail}</small></span><CoverageBadge state={c.state} prefix="" /></li>
            ))}
            <li data-gap><span><strong>Billing (application)</strong><small>Clone failed. There is no current evidence for this application.</small></span><CoverageBadge state="failed" prefix="" /></li>
          </ul>
        </Panel>
      </Section>
      <Section id="per" title="Per application"><Grid min={280}>{applications.map((a) => <ApplicationCard key={a.id} app={a} />)}</Grid></Section>
      <Section id="trail" title="Evidence trail for the open finding"><EvidenceTrail /></Section>
      <Panel eyebrow="Scan record (demo)" tight>
        <Text as="p" size="2" style={{ margin: 0 }}>Scan S-104 · Source revision: <strong>not recorded</strong> (the scanner does not store a commit SHA yet). Later scans can only be compared reliably once it does.</Text>
      </Panel>
    </Page>
  );
}

export function Decision({ openFinding }: PageProps) {
  return (
    <Page>
      <PageHeader eyebrow="Decision" title="Proshore's recommended next step"
        description="Written by a Proshore consultant from the evidence, with assumptions and open questions stated. Your team can comment before it is final." />
      <DecisionCard openFinding={openFinding} />
    </Page>
  );
}

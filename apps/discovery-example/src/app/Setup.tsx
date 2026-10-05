import { CheckCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@proshore/ui";
import { useState } from "react";
import { Badge, Button, Card, Checkbox, Flex, Heading, Note, Select, SimpleTable, Text, TextArea, TextField } from "@proshore/ui";
import { Eyebrow } from "@proshore/ui";
import { Page, PageHeader, Panel, Stack, WithAside, Cluster } from "@proshore/ui";
import { Stepper } from "@proshore/ui";
import type { StepState } from "@proshore/ui";
import { DemoTag } from "@proshore/ui";
import { CoverageBadge, evidenceMeta } from "../ui";
import { applications, coverageChecks, setupContext, setupPeople, setupRepos, workspace } from "../fixtures/brightfield";
import type { RepoRow } from "../fixtures/brightfield";

const steps = [
  { id: "scope", label: "Question and scope" },
  { id: "sources", label: "Sources" },
  { id: "apps", label: "Applications" },
  { id: "context", label: "Business context" },
  { id: "people", label: "People and access" },
  { id: "ready", label: "Scan readiness" },
] as const;
type StepId = (typeof steps)[number]["id"];

const sourceLabel = { confirmed: "Confirmed by customer", proshore: "Proshore assumption", code: "Code-derived, unconfirmed" } as const;

export function Setup() {
  const [step, setStep] = useState<StepId>("scope");
  const [question, setQuestion] = useState(workspace.question);
  const [outOfScope, setOutOfScope] = useState("Payments provider, warehouse hardware, the corporate website.");
  const [repos, setRepos] = useState<RepoRow[]>(setupRepos);
  const [newRepo, setNewRepo] = useState("");
  const [repoError, setRepoError] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [period, setPeriod] = useState("4w");
  const [published, setPublished] = useState(false);

  const unassigned = repos.filter((r) => r.appId === "none").length;
  const gaps = repos.filter((r) => r.scan !== "complete");
  const questionOk = question.trim().length > 20;
  const checklist = [
    { ok: questionOk, text: "Question is stated" },
    { ok: repos.length > 0, text: `${repos.length} repositories connected` },
    { ok: unassigned === 0, text: unassigned ? `${unassigned} repositories without an application` : "Every repository belongs to an application" },
    { ok: gaps.length === 0 || reviewed, text: gaps.length === 0 ? "All scans complete" : reviewed ? `${gaps.length} coverage gaps reviewed by Proshore` : `${gaps.length} repositories have coverage gaps to review` },
  ];
  const canPublish = checklist.every((c) => c.ok);

  const addRepo = () => {
    if (!/^[\w.-]+\/[\w.-]+$/.test(newRepo.trim())) { setRepoError("Use the form owner/repository. No access tokens or credentials here."); return; }
    setRepoError("");
    setRepos((r) => [...r, { id: `r${r.length + 1}`, name: newRepo.trim(), provider: "github", branch: "main", appId: "none", scan: "none", scanNote: "Not scanned yet" }]);
    setNewRepo("");
  };
  const idx = steps.findIndex((s) => s.id === step);
  const stateOf = (id: StepId): StepState => {
    if (id === step) return "current";
    if (id === "apps" && unassigned > 0) return "attention";
    if (id === "ready" && !checklist[3].ok) return "attention";
    return steps.findIndex((x) => x.id === id) < idx ? "complete" : "upcoming";
  };
  const stepItems = steps.map((x) => ({ id: x.id, label: x.label, state: stateOf(x.id) }));
  return (
    <Page>
      <PageHeader eyebrow={<Cluster><Eyebrow chip>Proshore only</Eyebrow><DemoTag /></Cluster>} title="Prepare the engagement"
        description="Set the question and the boundary, connect sources, group repositories into applications and invite people. Customers see none of this until you publish. Nothing here connects to real repositories in this prototype." />
      <Stepper steps={stepItems} label="Setup steps" onSelect={(id) => setStep(id as StepId)} />
      <WithAside asideWidth={280} aside={
        <Panel eyebrow="Ready to share?" tight>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--space-3)" }}>
            {checklist.map((c) => (
              <li key={c.text}><Text size="2" style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                {c.ok ? <CheckCircledIcon aria-hidden style={{ marginTop: 3, flex: "none", color: "var(--pr-coverage-complete)" }} /> : <ExclamationTriangleIcon aria-hidden style={{ marginTop: 3, flex: "none", color: "var(--pr-coverage-partial)" }} />}
                <span><span className="sherpa-eyebrow" style={{ display: "block" }}>{c.ok ? "Done" : "Needs attention"}</span>{c.text}</span></Text></li>))}
          </ul>
        </Panel>
      }>
        <Stack gap={4}>

          {step === "scope" && (
            <Card><Flex direction="column" gap="4">
              <Heading as="h2" size="4">Question and scope</Heading>
              <TextArea label="What does the customer want to know?" description="One concrete business question. It is the first thing every stakeholder sees." value={question} onChange={setQuestion} rows={3} />
              <Flex direction="column" gap="2"><Text size="2" weight="medium">In scope</Text>
                <Flex gap="2" wrap="wrap">{applications.map((a) => <Badge key={a.id} size="2" variant="soft">{a.name}</Badge>)}</Flex></Flex>
              <TextArea label="Explicitly out of scope" description="Shown to the customer so nobody assumes the whole IT estate was examined." value={outOfScope} onChange={setOutOfScope} rows={2} />
              <Select label="Assessment period" value={period} onChange={setPeriod} options={[{ value: "2w", label: "2 weeks" }, { value: "4w", label: "4 weeks" }, { value: "8w", label: "8 weeks" }]} className="setup-narrow" />
            </Flex></Card>
          )}

          {step === "sources" && (
            <Card><Flex direction="column" gap="4">
              <Heading as="h2" size="4">Sources</Heading>
              <Note tone="info">Repository access tokens are used only to clone and are never stored or shown. The prototype does not accept tokens.</Note>
              <SimpleTable caption="Connected repositories" rows={repos} getRowId={(r) => r.id} columns={[
                { id: "repo", header: "Repository", cell: (r) => r.name }, { id: "branch", header: "Branch", cell: (r) => r.branch },
                { id: "scan", header: "Last scan", cell: (r) => r.scan === "none" ? <Text size="2" color="gray">Not scanned yet</Text> : <Flex direction="column" gap="1"><CoverageBadge state={r.scan} /><Text size="1" color="gray">{r.scanNote}</Text></Flex> },
              ]} />
              <form onSubmit={(e) => { e.preventDefault(); addRepo(); }} style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 260px" }}><TextField label="Add repository" placeholder="owner/repository" value={newRepo} onChange={setNewRepo} error={repoError} /></div>
                <Button variant="outline" type="submit" style={{ marginTop: 26 }}>Add</Button>
              </form>
            </Flex></Card>
          )}

          {step === "apps" && (
            <Card><Flex direction="column" gap="4">
              <Heading as="h2" size="4">Applications</Heading>
              <Text size="2" color="gray">A repository is not an application. One application can span several repositories, and one repository can hold several deployable parts. These groupings are <strong>proposals</strong> until the customer's Technical lead confirms them.</Text>
              {repos.map((r) => (
                <Flex key={r.id} justify="between" align="center" gap="3" wrap="wrap" style={{ borderTop: "1px solid var(--pr-line)", paddingTop: "var(--space-3)" }}>
                  <Text size="2">{r.name}</Text>
                  <Flex gap="2" align="center"><Text size="1" color="gray" aria-hidden>Belongs to</Text>
                    <Select label={`Application for ${r.name}`} hideLabel value={r.appId} onChange={(v) => setRepos((rs) => rs.map((x) => (x.id === r.id ? { ...x, appId: v } : x)))}
                      options={[{ value: "none", label: "Not assigned" }, ...applications.map((a) => ({ value: a.id, label: a.name }))]} />
                    <Badge variant="outline" color="gray">Proposed</Badge></Flex>
                </Flex>))}
              {unassigned > 0 && <Note tone="warning">{unassigned} repositories are not assigned. Findings from them cannot be shown on an application.</Note>}
            </Flex></Card>
          )}

          {step === "context" && (
            <Card><Flex direction="column" gap="4">
              <Heading as="h2" size="4">Business context</Heading>
              <Text size="2" color="gray">Goals, processes and constraints the evidence will be read against. Each item keeps its source, so a guess is never shown as a fact.</Text>
              {setupContext.map((c) => { const M = evidenceMeta[c.source === "confirmed" ? "confirmed" : c.source === "code" ? "inferred" : "observed"]; return (
                <Flex key={c.id} direction="column" gap="1" style={{ borderTop: "1px solid var(--pr-line)", paddingTop: "var(--space-3)" }}>
                  <Flex gap="2" align="center" wrap="wrap"><Eyebrow>{c.label}</Eyebrow><Badge variant="soft" color={c.source === "confirmed" ? "green" : c.source === "code" ? "amber" : "indigo"}><M.Icon aria-hidden /> {sourceLabel[c.source]}</Badge></Flex>
                  <Text size="3">{c.text}</Text></Flex>); })}
              <Text size="1" color="gray">Editing and adding context is not built in this prototype.</Text>
            </Flex></Card>
          )}

          {step === "people" && (
            <Card><Flex direction="column" gap="4">
              <Heading as="h2" size="4">People and access</Heading>
              <Note tone="info">Invitations are not sent in this prototype. In the real product, access must be enforced by the backend per engagement, not by hiding screens.</Note>
              <SimpleTable caption="People and access" rows={setupPeople} getRowId={(p) => p.id} columns={[
                { id: "person", header: "Person", cell: (p) => <>{p.name}<br /><Text size="1" color="gray">{p.org}</Text></> }, { id: "role", header: "Role", cell: (p) => p.role },
                { id: "start", header: "Starts at", cell: (p) => p.start }, { id: "access", header: "Can", cell: (p) => p.access },
              ]} />
            </Flex></Card>
          )}

          {step === "ready" && (
            <Card><Flex direction="column" gap="4">
              <Heading as="h2" size="4">Scan readiness</Heading>
              <Text size="2" color="gray">A finished scan is not full coverage. Review what the customer will not see before publishing.</Text>
              <Flex direction="column" gap="2">{coverageChecks.map((c) => (
                <Flex key={c.tool} justify="between" gap="3" wrap="wrap" style={{ borderTop: "1px solid var(--pr-line)", paddingTop: "var(--space-2)" }}>
                  <Text size="2"><strong>{c.tool}</strong>: {c.detail}</Text><CoverageBadge state={c.state} prefix="" /></Flex>))}
                <Flex justify="between" gap="3" wrap="wrap" style={{ borderTop: "1px solid var(--pr-line)", paddingTop: "var(--space-2)" }}>
                  <Text size="2"><strong>billing-legacy</strong>: clone failed, no current evidence</Text><CoverageBadge state="failed" prefix="" /></Flex></Flex>
              <Checkbox isSelected={reviewed} onChange={setReviewed}>I reviewed these gaps. The customer will be told the scan is partial and that Billing is unknown, not clean.</Checkbox>
              {published && <Note tone="success" live>Demo only: nothing was sent. In the real product this would open the workspace to the invited people, with the coverage statement shown on every page.</Note>}
              <Flex gap="3" align="center" wrap="wrap"><Button size="3" disabled={!canPublish} onClick={() => setPublished(true)}>Publish to customer</Button>
                {!canPublish && <Text size="2" color="gray">Complete the checklist first.</Text>}</Flex>
            </Flex></Card>
          )}

          <Flex justify="between">
            <Button variant="ghost" disabled={idx === 0} onClick={() => setStep(steps[idx - 1].id)}>Back</Button>
            <Button variant="soft" disabled={idx === steps.length - 1} onClick={() => setStep(steps[idx + 1].id)}>Next: {steps[Math.min(idx + 1, steps.length - 1)].label}</Button>
          </Flex>
        </Stack>
      </WithAside>
    </Page>
  );
}

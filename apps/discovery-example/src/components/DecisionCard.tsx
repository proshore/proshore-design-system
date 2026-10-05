import { Button, Text } from "@proshore/ui";
import { Cluster, DemoTag, Grid, Panel } from "@proshore/ui";
import { EvidenceBadge } from "../ui";
import { CheckIcon } from "@proshore/ui";
import { decision } from "../fixtures/brightfield";
import { allFindings } from "../fixtures/derived";
import type { FindingRecord } from "../fixtures/brightfield";
import { ProshoreView } from "./ProshoreView";

/**
 * A reviewed advisory artifact. Left: the statement (set apart from generated suggestions), why it is recommended with each reason linked to its
 * evidence and state, then alternatives, assumptions and open questions. Right: where the decision is in review, and what happens next.
 */
export function DecisionCard({ openFinding }: { openFinding: (f: FindingRecord) => void }) {
  const list = (items: string[]) => (<ul style={{ margin: 0, paddingLeft: "var(--space-4)", display: "grid", gap: "var(--space-2)" }}>{items.map((i) => <li key={i}><Text size="3">{i}</Text></li>)}</ul>);
  return (
    <div className="dec">
      <div className="dec__main">
        <ProshoreView statement={decision.recommendation} meta={<Cluster><span>{decision.status}</span><DemoTag /><span>{decision.owner}</span></Cluster>} />
        <section aria-labelledby="why">
          <h2 className="dec__h" id="why">Why Proshore recommends this</h2>
          <ol className="dec__why">
            {decision.reasons.map((r, i) => (
              <li key={r.text}>
                <span className="dec__num" aria-hidden>{i + 1}</span>
                <div>
                  <p className="dec__reason">{r.text}</p>
                  <div className="dec__ev">
                    <EvidenceBadge state={r.state} />
                    {r.evidence.map((e) => {
                      const f = e.finding ? allFindings.find((x) => x.id === e.finding) : undefined;
                      return f ? <button key={e.label} type="button" className="dec__link" onClick={() => openFinding(f)}>{e.label}</button> : <a key={e.label} className="dec__link" href={e.href}>{e.label}</a>;
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <Grid min={260}>
          <Panel eyebrow="Alternatives considered">{list(decision.alternatives)}</Panel>
          <Panel eyebrow="Assumptions">{list(decision.assumptions)}</Panel>
          <Panel eyebrow="Still open">{list(decision.openQuestions)}</Panel>
        </Grid>
      </div>
      <aside className="dec__side" aria-label="Decision status">
        <Panel eyebrow="Where this stands">
          <ol className="dec__steps">
            {decision.steps.map((s) => (
              <li key={s.label} data-state={s.state} aria-current={s.state === "current" ? "step" : undefined}>
                <span className="dec__dot" aria-hidden>{s.state === "done" && <CheckIcon />}</span>
                <span><strong>{s.label}</strong><small>{s.detail}</small></span>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel eyebrow="What happens next" footer={<Cluster gap={3}><Button size="3">Confirm decision</Button><Button size="3" variant="outline">Comment</Button></Cluster>}>
          <Text as="p" size="4" weight="medium" style={{ margin: 0 }}>{decision.nextAction}</Text>
          <Text as="p" size="2" color="gray" style={{ margin: "var(--space-2) 0 0" }}>Owner: {decision.owner}</Text>
        </Panel>
      </aside>
    </div>
  );
}

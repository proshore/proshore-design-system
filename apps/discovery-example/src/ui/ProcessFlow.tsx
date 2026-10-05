import type { ReactNode } from "react";
import type { EvidenceState } from "./types";
import { EvidenceBadge } from "./status";

export type FlowStep = { id: string; name: string; lane: string; state: EvidenceState; note?: ReactNode; action?: ReactNode };
export type FlowLane = { id: string; label: string; hint?: ReactNode };

/**
 * ProcessFlow: how a business process runs across applications. Columns are steps in order,
 * rows are swimlanes (applications). The numbered step rail on top is the connector, so every card
 * sits under its own step number and lane label. Unknown steps are dashed. Use Stepper for task progress instead.
 * Dependencies between lanes are listed under the flow by the caller (the flow itself never invents links).
 */
export function ProcessFlow({ steps, lanes, label = "Process flow" }: { steps: FlowStep[]; lanes: FlowLane[]; label?: string }) {
  return (
    <div className="flow" role="group" aria-label={label} tabIndex={0} style={{ "--flow-cols": steps.length } as React.CSSProperties}>
      <div className="flow__corner" aria-hidden />
      <ol className="flow__rail">
        {steps.map((s, i) => (<li key={s.id} className="flow__rail-item"><span className="flow__num">{i + 1}</span><span className="flow__rail-name">{s.name}</span></li>))}
      </ol>
      {lanes.map((lane) => (
        <div key={lane.id} className="flow__lane">
          <div className="flow__lane-label"><span className="sherpa-eyebrow">Application</span><strong>{lane.label}</strong>{lane.hint && <span className="flow__hint">{lane.hint}</span>}</div>
          <div className="flow__cells">
            {steps.map((s) => (
              <div key={s.id} className="flow__cell">
                {s.lane === lane.id && (
                  <div className="flow__card" data-state={s.state}>
                    <EvidenceBadge state={s.state} />
                    {s.note && <span className="flow__note">{s.note}</span>}
                    {s.action}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

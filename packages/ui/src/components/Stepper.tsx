import { CheckIcon, ExclamationTriangleIcon, LockClosedIcon } from "../icons";
import type { ReactNode } from "react";

export type StepState = "complete" | "current" | "upcoming" | "attention" | "blocked";
export type StepItem = { id: string; label: string; description?: ReactNode; state: StepState };

const stateText: Record<StepState, string> = { complete: "Complete", current: "Current step", upcoming: "Not started", attention: "Needs attention", blocked: "Blocked" };

/**
 * Stepper: ordered steps of ONE task (setup, review, publish). Use for progress through a task;
 * use ProcessFlow for how a business process runs. State is shown by icon, label and shape, never colour alone.
 * Steps are real buttons when `onSelect` is given (keyboard reachable), plain text otherwise.
 *
 * @example
 * <Stepper steps={[{ id: "scope", label: "Scope", state: "complete" }, { id: "scan", label: "Scan", state: "current" }, { id: "review", label: "Review", state: "upcoming" }]} />
 */
export function Stepper({ steps, orientation = "horizontal", onSelect, label = "Progress" }: {
  steps: StepItem[]; orientation?: "horizontal" | "vertical"; onSelect?: (id: string) => void; label?: string;
}) {
  return (
    <ol className="stepper" data-orientation={orientation} aria-label={label}>
      {steps.map((s, i) => {
        const inner = (
          <>
            <span className="stepper__marker" aria-hidden>
              {s.state === "complete" ? <CheckIcon /> : s.state === "attention" ? <ExclamationTriangleIcon /> : s.state === "blocked" ? <LockClosedIcon /> : i + 1}
            </span>
            <span className="stepper__text">
              <span className="stepper__label">{s.label}</span>
              <span className="stepper__state">{stateText[s.state]}</span>
              {s.description && <span className="stepper__desc">{s.description}</span>}
            </span>
          </>
        );
        return (
          <li key={s.id} className="stepper__item" data-state={s.state} aria-current={s.state === "current" ? "step" : undefined}>
            {onSelect && s.state !== "blocked"
              ? <button type="button" className="stepper__btn" onClick={() => onSelect(s.id)}>{inner}</button>
              : <div className="stepper__btn" aria-disabled={s.state === "blocked" || undefined}>{inner}</div>}
          </li>
        );
      })}
    </ol>
  );
}

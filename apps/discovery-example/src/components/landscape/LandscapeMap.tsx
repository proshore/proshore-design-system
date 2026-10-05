import { Fragment } from "react";
import { CoverageBadge } from "../../ui";
import type { EvidenceState } from "../../fixtures/brightfield";
import { mapApps, recommendedStepId, stateLabel } from "./mapData";
import "./map.css";

/** One glyph per evidence state, so the state never depends on colour: filled, half, check, dashed. */
function Glyph({ state }: { state: EvidenceState }) {
  return (
    <svg className="lm__glyph" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false" data-state={state}>
      {state === "observed" && <circle cx="8" cy="8" r="5.5" fill="currentColor" />}
      {state === "inferred" && <><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 2.5a5.5 5.5 0 0 0 0 11z" fill="currentColor" /></>}
      {state === "confirmed" && <><circle cx="8" cy="8" r="7" fill="currentColor" /><path d="M5 8.2l2 2 4-4.4" fill="none" stroke="var(--lm-glyph-ink, #fff)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></>}
      {state === "unknown" && <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.6 2.2" />}
    </svg>
  );
}

/**
 * The landscape as one picture: each application is a territory that carries the steps of the customer journey (numbered in order),
 * every step shows how well it is evidenced and how many findings await a person, and an application that could not be scanned is drawn as
 * unknown rather than empty. Steps are real links into the findings list. Proshore's recommendation is pinned where it applies.
 */
export function LandscapeMap({ base = "", variant = "roomy" }: { base?: string; variant?: "roomy" | "compact" }) {
  return (
    <div className="lm" data-variant={variant}>
      <ol className="lm__apps" aria-label="Applications, in the order a customer meets them">
        {mapApps.map((a) => (
          <li key={a.id} className="lm__app" data-coverage={a.coverage}>
            <div className="lm__head">
              <h3 className="lm__name">{a.name}</h3>
              <CoverageBadge state={a.coverage} prefix="" />
            </div>
            <p className="lm__role">{a.role}</p>
            {a.steps.length > 0 && (
              <ul className="lm__steps">
                {a.steps.map((s) => (
                  <Fragment key={s.id}>
                    <li>
                      <a className="lm__step" data-state={s.state} data-pinned={s.id === recommendedStepId || undefined} href={`#${base}/findings?step=${s.id}`}
                        aria-label={`Step ${s.number}, ${s.name}. ${stateLabel[s.state]}. ${s.findings.length ? `${s.findings.length} findings, ${s.toReview} awaiting review.` : "No findings recorded."}${s.id === recommendedStepId ? " Proshore recommends starting here." : ""}`}>
                        <span className="lm__num" aria-hidden="true">{s.number}</span>
                        <span className="lm__stepbody">
                          <span className="lm__stepname">{s.name}</span>
                          <span className="lm__stepmeta"><Glyph state={s.state} />{stateLabel[s.state]}</span>
                        </span>
                        <span className="lm__marks" aria-hidden="true" title={s.findings.length ? `${s.findings.length} findings, worst tool severity: ${s.top}` : "No findings recorded"}>
                          {s.top ? <><i className="lm__dot" style={{ background: `var(--sev-${s.top})` }} /><span className="lm__n">{s.findings.length}</span></> : <span className="lm__n lm__n--none">no findings</span>}
                        </span>
                        {s.id === recommendedStepId && <span className="lm__pin" aria-hidden="true">Start here</span>}
                      </a>
                    </li>
                  </Fragment>
                ))}
              </ul>
            )}
            {a.coverage === "failed" && (
              <p className="lm__gap"><strong>Not seen.</strong> {a.coverageNote} Unknown, not clean.</p>
            )}
            <p className="lm__foot">
              {a.calls.length > 0 && <span>Calls {a.calls.map((c) => `${c.to} (${c.label})`).join(" and ")}. </span>}
              <span>{a.repos.join(", ")}</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** What the glyphs and the pin mean. Shown once under the map. */
export function MapKey() {
  return (
    <ul className="lm-key" aria-label="How to read the map">
      {(["observed", "inferred", "confirmed", "unknown"] as const).map((k) => (
        <li key={k}><Glyph state={k} />{k === "observed" ? "Observed: seen by a tool" : k === "inferred" ? "Inferred: generated, nobody has checked" : k === "confirmed" ? "Confirmed: a person checked" : "Unknown: no evidence"}</li>
      ))}
      <li><span className="lm-key__pin">Start here</span>Proshore’s recommendation</li>
    </ul>
  );
}

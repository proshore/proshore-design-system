import type { Severity } from "../fixtures/brightfield";

const order: { key: Severity; label: string }[] = [
  { key: "critical", label: "Critical" }, { key: "high", label: "High" }, { key: "medium", label: "Medium" }, { key: "low", label: "Low" }, { key: "review", label: "Review item" },
];

/**
 * One row of tool-reported severity, ordered from most to least severe. Flat segments with the count inside;
 * the legend repeats every count as text, so meaning never depends on colour. Partial coverage is stated in words
 * next to it (a Note), not by hatching the data.
 */
export function SeverityBar({ counts, label }: { counts: Record<Severity, number>; label: string }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div className="sevbar-wrap">
      <div className="sevbar" aria-hidden>
        {order.map((s, i) => counts[s.key] > 0 && (<span key={s.key} style={{ flex: counts[s.key], background: `var(--sev-${s.key})`, color: `var(--sev-${s.key}-fg)`, "--i": i } as React.CSSProperties}>{counts[s.key]}</span>))}
      </div>
      <ul className="sevlegend" aria-label={`${label}, ${total} in total`}>
        {order.map((s) => (<li key={s.key}><i style={{ background: `var(--sev-${s.key})` }} aria-hidden />{s.label} <b>{counts[s.key]}</b></li>))}
      </ul>
    </div>
  );
}

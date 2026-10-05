import { applicationsWithStats } from "../fixtures/derived";
import { dependencies } from "../fixtures/brightfield";
import type { CoverageState } from "../fixtures/brightfield";

const pos: Record<string, { x: number; y: number }> = { Ordering: { x: 20, y: 75 }, Inventory: { x: 420, y: 14 }, Billing: { x: 420, y: 136 } };
const W = 190, H = 66;
const covText: Record<CoverageState, string> = { complete: "Scan complete", partial: "Scan partial", failed: "Scan failed, unknown" };

/** Which application calls which. Drawn from the code-derived dependency list, so it is a proposal until the Technical lead confirms it. */
export function DependencyGraph() {
  const summary = dependencies.map((d) => `${d.from} calls ${d.to} (${d.label})`).join(". ") + ".";
  return (
    <svg className="dg" viewBox="0 0 640 216" role="img" aria-label={`Application dependencies. ${summary}`}>
      <defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--gray-10)" /></marker></defs>
      {dependencies.map((d) => {
        const a = pos[d.from], b = pos[d.to]; if (!a || !b) return null;
        const x1 = a.x + W, y1 = a.y + H / 2, x2 = b.x, y2 = b.y + H / 2; const mx = (x1 + x2) / 2;
        return (
          <g key={d.to}>
            <path d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2 - 2},${y2}`} className="dg__edge" markerEnd="url(#dg-arrow)" />
            <text x={mx} y={(y1 + y2) / 2 + (d.to === "Inventory" ? -8 : 16)} textAnchor="middle" className="dg__label">{d.label}</text>
          </g>
        );
      })}
      {applicationsWithStats.map((a) => {
        const p = pos[a.name]; if (!p) return null;
        return (
          <g key={a.id} className="dg__node" data-coverage={a.coverage}>
            <rect x={p.x} y={p.y} width={W} height={H} rx="12" />
            <text x={p.x + 16} y={p.y + 28} className="dg__name">{a.name}</text>
            <text x={p.x + 16} y={p.y + 48} className="dg__meta">{covText[a.coverage]}</text>
          </g>
        );
      })}
    </svg>
  );
}

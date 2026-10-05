import { useId } from "react";
import { markerPath, monotone } from "./shared";

/**
 * Tiny trend for stat cards and table cells. Use only to show direction; the exact number must sit next to it.
 * Not zero-based by design, so never use it to compare magnitudes between rows. Partial points render hollow and the
 * segment into them dashed. No axes: always give `label` a text summary.
 */
export interface SparklineProps {
  values: number[]; /** Same length as values; true where data quality is reduced. */ partial?: boolean[];
  label: string; color?: string; width?: number; height?: number;
}

export function Sparkline({ values, partial = [], label, color = "var(--chart-1)", width = 96, height = 28 }: SparklineProps) {
  if (!values.length) return null;
  const pad = 5; const lo = Math.min(...values), hi = Math.max(...values), span = hi - lo || 1;
  const x = (i: number) => pad + (values.length === 1 ? (width - 2 * pad) / 2 : (i * (width - 2 * pad)) / (values.length - 1));
  const y = (v: number) => height - pad - ((v - lo) / span) * (height - 2 * pad);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const pts = values.map((v, i) => ({ x: x(i), y: y(v) }));
  const segs = monotone(pts);
  const area = pts.length > 1 ? `${segs.map((d, k) => (k === 0 ? d : d.replace(/^M[^C]*/, ""))).join("")}L${pts[pts.length - 1].x},${height}L${pts[0].x},${height}Z` : "";
  const lastI = values.length - 1;
  return (
    <svg className="ch-spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <defs><linearGradient id={`sp${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".25" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {area && <path d={area} fill={`url(#sp${uid})`} />}
      {segs.map((d, i) => <path key={i} d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray={partial[i] || partial[i + 1] ? "3 3" : undefined} />)}
      {values.map((v, i) => { const last = i === lastI; const hollow = !!partial[i]; if (!last && !hollow) return null;
        return <g key={i}>{last && <circle cx={x(i)} cy={y(v)} r={6} fill={color} opacity=".18" />}<path d={markerPath("circle", x(i), y(v), last ? 3.5 : 2.5)} fill={hollow || last ? "var(--sherpa-surface)" : color} stroke={color} strokeWidth="1.75" /></g>; })}
    </svg>
  );
}

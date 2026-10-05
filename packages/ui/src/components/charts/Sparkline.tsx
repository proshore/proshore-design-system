import { markerPath } from "./shared";

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
  return (
    <svg className="ch-spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      {values.slice(1).map((v, i) => <line key={i} x1={x(i)} y1={y(values[i])} x2={x(i + 1)} y2={y(v)} stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray={partial[i] || partial[i + 1] ? "3 3" : undefined} />)}
      {values.map((v, i) => { const last = i === values.length - 1; const hollow = !!partial[i];
        return <path key={i} d={markerPath("circle", x(i), y(v), last ? 3.5 : 2)} fill={hollow ? "var(--sherpa-surface)" : color} stroke={last || hollow ? color : "none"} strokeWidth={hollow ? 1.5 : 0} />; })}
    </svg>
  );
}

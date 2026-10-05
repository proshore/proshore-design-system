import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { scaleLinear, scalePoint } from "@visx/scale";
import { atLeast, markerPath, monotone, niceScale, nf, useWidth, type Coverage, type Series, type TableData, type MarkerShape } from "./shared";

export interface TrendPoint { x: string; /** Extra line in the tooltip, e.g. a date. */ caption?: string; values: Record<string, number | null>; coverage?: Coverage }

/**
 * Multi-series line chart for change over scans/time (2 to 4 series, 3+ points). Zero baseline, one y axis.
 * Points from partial scans are hollow with dashed segments; null values leave a gap (unknown, not zero).
 * Points are keyboard reachable (Tab in, arrow keys move, Escape closes); the tooltip shows on hover and on focus.
 * Do not use with one or two points (use a StatCard) or with a second y axis (use two charts).
 * Scales, axes and grid come from visx; markers, dashes, direct labels, keyboard and the text summary are ours.
 */
export interface TrendLineProps { series: Series[]; points: TrendPoint[]; unit: string; height?: number }

export function trendTable(series: Series[], points: TrendPoint[]): TableData {
  return {
    head: ["Period", ...series.map((s) => s.label), "Coverage"],
    rows: points.map((p) => [p.caption ? `${p.x} (${p.caption})` : p.x, ...series.map((s) => { const v = p.values[s.key]; return v == null ? "No data" : atLeast(p.coverage, nf(v)); }), p.coverage === "partial" ? "Partial (at least)" : p.coverage === "none" ? "None" : "Complete"]),
  };
}

const DEFAULT_SHAPES: MarkerShape[] = ["circle", "square", "diamond", "triangle"];

export function TrendLine({ series, points, unit, height = 260 }: TrendLineProps) {
  const [ref, W] = useWidth(640);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const wide = W >= 480;
  const M = { t: 16, r: wide ? 112 : 40, b: 30, l: 40 };
  const pw = Math.max(40, W - M.l - M.r), ph = height - M.t - M.b;
  const maxV = Math.max(0, ...points.flatMap((p) => series.map((s) => p.values[s.key] ?? 0)));
  const { max, ticks } = niceScale(maxV);
  const n = points.length;
  const xs = useMemo(() => scalePoint<number>({ domain: points.map((_, i) => i), range: [M.l, M.l + pw], padding: 0 }), [points, M.l, pw]);
  const ys = useMemo(() => scaleLinear<number>({ domain: [0, max], range: [M.t + ph, M.t] }), [max, M.t, ph]);
  const x = (i: number) => (n === 1 ? M.l + pw / 2 : (xs(i) as number));
  const y = (v: number) => ys(v) as number;
  const [active, setActive] = useState<{ s: number; i: number } | null>(null);
  const [cur, setCur] = useState({ s: 0, i: n - 1 });
  const svgRef = useRef<SVGSVGElement>(null);
  const focusPt = (s: number, i: number) => { setCur({ s, i }); svgRef.current?.querySelector<SVGGElement>(`[data-pt="${s}-${i}"]`)?.focus(); };
  const shapeOf = (s: Series, si: number) => s.shape ?? DEFAULT_SHAPES[si % 4];

  const onKey = (e: KeyboardEvent, si: number, i: number) => {
    let ns = si, ni = i;
    if (e.key === "ArrowRight") ni = Math.min(n - 1, i + 1); else if (e.key === "ArrowLeft") ni = Math.max(0, i - 1);
    else if (e.key === "ArrowDown") ns = Math.min(series.length - 1, si + 1); else if (e.key === "ArrowUp") ns = Math.max(0, si - 1);
    else if (e.key === "Home") ni = 0; else if (e.key === "End") ni = n - 1;
    else if (e.key === "Escape") { e.stopPropagation(); setActive(null); return; } else return;
    e.preventDefault(); e.stopPropagation(); focusPt(ns, ni);
  };

  const endLabels = useMemo(() => {
    const raw = series.map((s, si) => { let li = -1; points.forEach((p, i) => { if (p.values[s.key] != null) li = i; }); return li < 0 ? null : { si, li, y: y(points[li].values[s.key] as number), v: points[li].values[s.key] as number, cov: points[li].coverage }; }).filter(Boolean) as { si: number; li: number; y: number; v: number; cov?: Coverage; ly?: number }[];
    const sorted = [...raw].sort((a, b) => a.y - b.y);
    sorted.forEach((l, k) => { l.ly = k === 0 ? l.y : Math.max(l.y, (sorted[k - 1].ly as number) + 14); });
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, points, W, height, max]);

  const summary = `${unit}. ` + series.map((s) => `${s.label}: ` + points.map((p) => `${p.x} ${p.values[s.key] == null ? "no data" : atLeast(p.coverage, p.values[s.key] as number)}`).join(", ")).join(". ") + ".";
  const tip = active && points[active.i];
  const tipX = active ? Math.min(Math.max(x(active.i), 90), W - 90) : 0;
  const tipY = active && tip ? y((tip.values[series[active.s].key] ?? 0) as number) - 12 : 0;

  return (
    <div className="ch-svg-wrap" ref={ref}>
      <div className="ch-unit">{unit}</div>
      <svg ref={svgRef} width={W} height={height} viewBox={`0 0 ${W} ${height}`} role="group" aria-label={summary}>
        <defs><linearGradient id={`tl${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={series[0]?.color} stopOpacity=".26" /><stop offset="1" stopColor={series[0]?.color} stopOpacity="0" /></linearGradient></defs>
        <g aria-hidden="true">
          <GridRows scale={ys} left={M.l} width={pw} tickValues={ticks.filter((v) => v > 0)} stroke="var(--chart-gridline)" strokeDasharray="3 5" />
          <line x1={M.l} x2={M.l + pw} y1={y(0)} y2={y(0)} stroke="var(--chart-gridline)" />
          <AxisLeft left={M.l} scale={ys} tickValues={ticks} hideAxisLine hideTicks tickLabelProps={{ className: "ch-svg-text", textAnchor: "end", dy: "0.33em", dx: -8 }} />
          <AxisBottom top={M.t + ph} scale={xs} tickValues={points.map((_, i) => i)} tickFormat={(i) => `${points[i as number].x}${points[i as number].coverage === "partial" ? " ◐" : ""}`} hideAxisLine hideTicks
            tickLabelProps={(_v, i) => ({ className: "ch-svg-text", textAnchor: i === 0 && n > 1 ? "start" : i === n - 1 && n > 1 ? "end" : "middle", dy: "0.3em" })} tickLength={8} />
        </g>
        {active && <line x1={x(active.i)} x2={x(active.i)} y1={M.t} y2={M.t + ph} stroke="var(--chart-axis)" strokeDasharray="2 3" aria-hidden="true" />}
        {series.map((s, si) => (
          <g key={s.key}>
            {(() => {
              // contiguous runs of known values: a null leaves a gap (unknown, not zero)
              const runs: number[][] = []; let cur2: number[] = [];
              points.forEach((p, i) => { if (p.values[s.key] != null) cur2.push(i); else { if (cur2.length) runs.push(cur2); cur2 = []; } }); if (cur2.length) runs.push(cur2);
              return runs.map((run, ri) => {
                const rp = run.map((i) => ({ x: x(i), y: y(points[i].values[s.key] as number) }));
                const segs = monotone(rp);
                return (
                  <g key={ri} aria-hidden="true">
                    {series.length === 1 && rp.length > 1 && <path d={`${segs.map((d, k) => (k === 0 ? d : d.replace(/^M[^C]*/, ""))).join("")}L${rp[rp.length - 1].x},${y(0)}L${rp[0].x},${y(0)}Z`} fill={`url(#tl${uid})`} />}
                    {segs.map((d, k) => { const dashed = points[run[k]].coverage === "partial" || points[run[k + 1]].coverage === "partial";
                      return <path key={k} d={d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={dashed ? "5 4" : undefined} />; })}
                  </g>
                );
              });
            })()}
            {points.map((p, i) => { const v = p.values[s.key]; if (v == null) return null;
              const last = endLabels.some((l) => l.si === si && l.li === i); const hollow = p.coverage === "partial"; const r = last ? 6 : 4.5;
              const isCur = cur.s === si && cur.i === i;
              return (
                <g key={i} className="ch-pt" role="img" tabIndex={isCur ? 0 : -1} data-pt={`${si}-${i}`} data-active={active?.s === si && active.i === i ? "" : undefined}
                  aria-label={`${s.label}, ${p.x}${p.caption ? `, ${p.caption}` : ""}: ${atLeast(p.coverage, nf(v))} ${unit.toLowerCase()}${hollow ? ", partial scan, count is at least" : ""}`}
                  onPointerEnter={() => setActive({ s: si, i })} onPointerLeave={() => setActive(null)}
                  onFocus={() => { setCur({ s: si, i }); setActive({ s: si, i }); }} onBlur={() => setActive(null)} onKeyDown={(e) => onKey(e, si, i)}>
                  <circle cx={x(i)} cy={y(v)} r="12" fill="transparent" />
                  <circle className="ch-pt__ring" cx={x(i)} cy={y(v)} r={r + 5} />
                  {(last || hollow || (active?.s === si && active.i === i)) && <>{last && <circle cx={x(i)} cy={y(v)} r={r + 5} fill={s.color} opacity=".16" />}<path d={markerPath(shapeOf(s, si), x(i), y(v), r)} fill={hollow ? "var(--sherpa-surface)" : last ? "var(--sherpa-surface)" : s.color} stroke={hollow || last ? s.color : "var(--sherpa-surface)"} strokeWidth={last ? 2.5 : 2} /></>}
                </g>
              ); })}
          </g>
        ))}
        {endLabels.map((l) => <text key={l.si} className="ch-svg-end" data-last="" aria-hidden="true" x={x(l.li) + 14} y={l.ly} dominantBaseline="middle">{wide ? `${series[l.si].label} ` : ""}{atLeast(l.cov, nf(l.v))}</text>)}
      </svg>
      {tip && active && (
        <div className="ch-tip" aria-hidden="true" style={{ left: tipX, top: tipY }}>
          <div className="ch-tip__head">{tip.x}{tip.caption ? `, ${tip.caption}` : ""}</div>
          {series.map((s) => <div className="ch-tip__row" key={s.key}><span>{s.label}</span><strong>{tip.values[s.key] == null ? "No data" : atLeast(tip.coverage, nf(tip.values[s.key] as number))}</strong></div>)}
          {tip.coverage === "partial" && <div className="ch-tip__note">Partial scan: counts are at least.</div>}
        </div>
      )}
    </div>
  );
}

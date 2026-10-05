import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridColumns, GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { useMessages } from "../../i18n/I18nProvider";
import { englishT, type Translate } from "../../i18n/translate";
import { SeriesPatterns, atLeast, fit, niceScale, nf, roundedEnd, useWidth, usePatternIds, wrapLabel, type Coverage, type Series, type TableData } from "./shared";

export interface BarDatum { label: string; values: Record<string, number>; coverage?: Coverage }

/**
 * Bar chart for comparing magnitudes across a few to ~12 categories. Horizontal when labels are long, vertical for
 * few short categories or ordered steps. `stacked` only when the parts sum to a meaningful total.
 * Do not use for change over time with many points (use TrendLine) or for a single part-to-whole row (use StackedBar).
 * A datum with coverage "none" renders "No data", never a zero bar; "partial" renders hatched with a ">=" label.
 * Drawn as SVG with visx scales, axes and grid; patterns, coverage rules, labels and the text summary are ours.
 */
export interface BarChartProps {
  series: Series[]; data: BarDatum[]; unit: string;
  orientation?: "horizontal" | "vertical"; stacked?: boolean;
  /** Plot height in px, vertical only. */
  height?: number;
}

const total = (d: BarDatum, series: Series[]) => series.reduce((a, s) => a + (d.values[s.key] ?? 0), 0);

/** Table view of the same data. Pass `t` from `useMessages()` to get it in the current language (English by default). */
export function barTable(series: Series[], data: BarDatum[], stacked = false, t: Translate = englishT): TableData {
  return {
    head: [t("charts.category"), ...series.map((s) => s.label), ...(stacked ? [t("charts.total")] : []), t("charts.coverage")],
    rows: data.map((d) => {
      const cov = d.coverage ?? "complete";
      if (cov === "none") return [d.label, ...series.map(() => t("charts.noData")), ...(stacked ? [t("charts.noData")] : []), t("charts.none")];
      return [d.label, ...series.map((s) => atLeast(cov, d.values[s.key] ?? 0)), ...(stacked ? [atLeast(cov, total(d, series))] : []), cov === "partial" ? t("charts.partialAtLeast") : t("charts.complete")];
    }),
  };
}

function summary(series: Series[], data: BarDatum[], unit: string, stacked: boolean, t: Translate) {
  return `${unit}. ` + data.map((d) => {
    const cov = d.coverage ?? "complete";
    if (cov === "none") return t("charts.barNoData", { label: d.label });
    const parts = series.map((s) => `${s.label} ${atLeast(cov, d.values[s.key] ?? 0)}`).join(", ");
    return `${d.label}: ${parts}${stacked ? t("charts.barTotal", { value: atLeast(cov, total(d, series)) }) : ""}${cov === "partial" ? t("charts.barPartial") : ""}.`;
  }).join(" ");
}

const GAP = 2;             // px between stacked segments
const tick = { fill: "var(--gray-11)", fontSize: "var(--font-size-1)", fontFamily: "inherit" } as const;

/**
 * Bar chart for comparing magnitudes across categories; see BarChartProps.
 *
 * @example
 * <BarChart unit="findings" series={[{ key: "open", label: "Open", color: "var(--chart-1)" }]}
 *   data={[{ label: "Billing", values: { open: 12 } }, { label: "Portal", values: { open: 7 } }]} />
 */
export function BarChart({ series, data, unit, orientation = "horizontal", stacked = false, height = 220 }: BarChartProps) {
  const { t } = useMessages();
  const [ref, W] = useWidth(640);
  const idOf = usePatternIds();
  const maxV = Math.max(0, ...data.filter((d) => d.coverage !== "none").map((d) => (stacked ? total(d, series) : Math.max(0, ...series.map((s) => d.values[s.key] ?? 0)))));
  const { max, ticks } = niceScale(maxV);
  const label = summary(series, data, unit, stacked, t);
  const val = (d: BarDatum, k: number) => d.values[series[k].key] ?? 0;

  const wrap = (h: number, children: React.ReactNode) => (
    <div className="ch-svg-wrap" ref={ref} role="img" aria-label={label}>
      <div className="ch-unit">{unit}</div>
      <svg width={W} height={h} viewBox={`0 0 ${W} ${h}`} aria-hidden="true" focusable="false">
        <SeriesPatterns series={series} idOf={idOf} />
        {children}
      </svg>
    </div>
  );

  if (orientation === "vertical") {
    const pw = Math.max(40, W - 48), ph = height;
    const nLines = Math.max(1, ...data.map((d) => wrapLabel(d.label, pw / Math.max(1, data.length) - 8).length));
    const M = { t: 22, r: 8, b: 14 + 15 * nLines, l: 40 };
    const y = scaleLinear<number>({ domain: [0, max], range: [ph, 0] });
    const band = pw / Math.max(1, data.length);
    const k = series.length;
    const bw = stacked ? Math.min(44, band - 16) : Math.max(6, Math.min(44, (band - 16 - (k - 1) * GAP) / k));
    return wrap(M.t + ph + M.b, (
        <Group left={M.l} top={M.t}>
          <g aria-hidden="true">
            <GridRows scale={y} width={pw} tickValues={ticks} stroke="var(--chart-gridline)" strokeDasharray="3 5" />
            <line x1={0} x2={pw} y1={ph} y2={ph} stroke="var(--chart-gridline)" />
            <AxisLeft scale={y} tickValues={ticks} hideAxisLine hideTicks tickLabelProps={{ ...tick, textAnchor: "end", dy: "0.33em", dx: -8 }} />
          </g>
          {data.map((d, i) => {
            const cov = d.coverage ?? "complete"; const cx = i * band + band / 2;
            const text = (x: number, yy: number, t: string) => <text x={x} y={yy} textAnchor="middle" className="ch-val-svg">{t}</text>;
            let bars: React.ReactNode;
            if (cov === "none") {
              bars = <g><rect x={cx - Math.min(band - 16, 96) / 2} y={ph - 56} width={Math.min(band - 16, 96)} height={56} rx={4} className="ch-none-svg" /><text x={cx} y={ph - 28} textAnchor="middle" dominantBaseline="middle" className="ch-none-text">{t("charts.noData")}</text></g>;
            } else if (stacked) {
              let acc = 0; const t = total(d, series); const segs = series.map((s, si) => ({ s, v: val(d, si) })).filter((x) => x.v > 0);
              bars = <g>{segs.map(({ s, v }, si) => {
                const y1 = y(acc + v), y0 = y(acc); acc += v; const last = si === segs.length - 1;
                const h = Math.max(2, y0 - y1 - (si > 0 ? GAP : 0));
                return <path key={s.key} d={last ? roundedEnd(cx - bw / 2, y0 - h, bw, h, Math.min(10, bw / 2), "top") : `M${cx - bw / 2},${y0 - h}h${bw}v${h}h${-bw}z`} fill={`url(#${idOf(s.key, cov === "partial")})`} stroke={cov === "partial" ? s.color : undefined} strokeDasharray={cov === "partial" ? "4 3" : undefined} strokeWidth={cov === "partial" ? 1.5 : undefined}><title>{`${s.label}: ${atLeast(cov, v)}`}</title></path>;
              })}{text(cx, y(t) - 5, atLeast(cov, nf(t)))}</g>;
            } else {
              bars = <g>{series.map((s, si) => {
                const v = val(d, si); const x0 = cx - (k * bw + (k - 1) * GAP) / 2 + si * (bw + GAP); const h = Math.max(0, ph - y(v));
                return <g key={s.key}><path d={roundedEnd(x0, ph - h, bw, h, Math.min(10, bw / 2), "top")} fill={`url(#${idOf(s.key, cov === "partial")})`} stroke={cov === "partial" ? s.color : undefined} strokeDasharray={cov === "partial" ? "4 3" : undefined} strokeWidth={cov === "partial" ? 1.5 : undefined}><title>{`${s.label}: ${atLeast(cov, v)}`}</title></path>{text(x0 + bw / 2, y(v) - 5, atLeast(cov, nf(v)))}</g>;
              })}</g>;
            }
            return <g key={d.label}>{bars}<text x={cx} y={ph + 18} textAnchor="middle" className="ch-svg-label ch-svg-label--sm" aria-hidden="true"><title>{d.label}</title>{wrapLabel(d.label, band - 8).map((l, li) => <tspan key={li} x={cx} dy={li ? 15 : 0}>{l}</tspan>)}</text></g>;
          })}
        </Group>
    ));
  }

  // horizontal: soft pills on a faint track, value at the end
  const lw = Math.min(160, Math.max(72, Math.round(W * 0.28))), rw = 56;
  const iw = Math.max(40, W - lw - rw);
  const x = scaleLinear<number>({ domain: [0, max], range: [0, iw] });
  const k = series.length; const LH = 16, SH = 22;
  const rowH = (d: BarDatum) => (d.coverage === "none" || stacked ? SH : k * LH + (k - 1) * 6);
  const ROW_GAP = 18;
  const tops: number[] = []; let yy = 6; data.forEach((d) => { tops.push(yy); yy += rowH(d) + ROW_GAP; });
  const ph = yy - ROW_GAP + 6;
  const partialStyle = (s: Series, cov: Coverage) => (cov === "partial" ? { stroke: s.color, strokeDasharray: "4 3", strokeWidth: 1.5 } : {});
  return wrap(ph + 30, (
      <Group left={lw} top={0}>
        <g aria-hidden="true">
          <GridColumns scale={x} height={ph} tickValues={ticks} stroke="var(--chart-gridline)" strokeDasharray="3 5" />
          <AxisBottom top={ph} scale={x} tickValues={ticks} hideAxisLine hideTicks tickLabelProps={{ ...tick, textAnchor: "middle", dy: "0.4em" }} />
        </g>
        {data.map((d, i) => {
          const cov = d.coverage ?? "complete"; const top = tops[i]; const h = rowH(d);
          const valText = (px: number, py: number, t: string) => <text x={px + 8} y={py} dominantBaseline="middle" className="ch-val-svg ch-val-svg--strong">{t}</text>;
          const pill = (id: string, w: number, y0: number, hh: number) => <clipPath id={id}><rect x={0} y={y0} width={w} height={hh} rx={Math.min(hh / 2, w / 2)} /></clipPath>;
          let mark: React.ReactNode;
          if (cov === "none") mark = <g><rect x={1} y={top} width={Math.max(40, iw + rw - 8)} height={h} rx={h / 2} className="ch-none-svg" /><text x={(iw + rw - 8) / 2} y={top + h / 2} textAnchor="middle" dominantBaseline="middle" className="ch-none-text">{iw + rw < 380 ? t("charts.barNoDataShort") : t("charts.barNoDataLong")}</text></g>;
          else if (stacked) {
            const t = total(d, series); let acc = 0; const segs = series.map((s, si) => ({ s, v: val(d, si) })).filter((z) => z.v > 0);
            const clip = idOf(`clip${i}`); const w = Math.max(3, x(t));
            mark = <g>
              <rect x={0} y={top} width={iw} height={h} rx={h / 2} fill="var(--chart-track)" />
              {pill(clip, w, top, h)}
              <g clipPath={`url(#${clip})`}>{segs.map(({ s, v }) => { const x0 = x(acc); const sw = Math.max(0, x(acc + v) - x(acc)); acc += v; return <rect key={s.key} x={x0} y={top} width={sw} height={h} fill={`url(#${idOf(s.key, cov === "partial")})`}><title>{`${s.label}: ${atLeast(cov, v)}`}</title></rect>; })}</g>
              {cov === "partial" && <rect x={0.75} y={top + 0.75} width={w - 1.5} height={h - 1.5} rx={h / 2} fill="none" stroke="var(--gray-11)" strokeDasharray="4 3" strokeWidth={1.5} />}
              {valText(x(t), top + h / 2, atLeast(cov, nf(t)))}
            </g>;
          } else mark = <g>{series.map((s, si) => { const v = val(d, si); const w = Math.max(3, x(v)); const y0 = top + si * (LH + 6); return <g key={s.key}><rect x={0} y={y0} width={iw} height={LH} rx={LH / 2} fill="var(--chart-track)" /><rect x={0} y={y0} width={w} height={LH} rx={Math.min(LH / 2, w / 2)} fill={`url(#${idOf(s.key, cov === "partial")})`} {...partialStyle(s, cov)}><title>{`${s.label}: ${atLeast(cov, v)}`}</title></rect>{valText(x(v), y0 + LH / 2, atLeast(cov, nf(v)))}</g>; })}</g>;
          return (
            <g key={d.label}>
              <text x={-12} y={top + h / 2} textAnchor="end" dominantBaseline="middle" className="ch-svg-label" aria-hidden="true"><title>{d.label}</title>{fit(d.label, lw - 16)}</text>
              {mark}
            </g>
          );
        })}
      </Group>
  ));
}

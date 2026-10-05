import type { CSSProperties } from "react";
import { useEffect, useId, useRef, useState } from "react";

export type Coverage = "complete" | "partial" | "none";
export type Pattern = "solid" | "dots" | "grid" | "empty";
export type MarkerShape = "circle" | "square" | "diamond" | "triangle";

export interface Series { key: string; label: string; color: string; pattern?: Pattern; shape?: MarkerShape }

const SHAPES: MarkerShape[] = ["circle", "square", "diamond", "triangle"];
/**
 * Fixed series order. The first series is the strong blue, the second a light tint of the same blue (so "done" and "open" read
 * as one total split in two), then teal, green, amber. Never cycle: fold extra series into "Other" or use small multiples.
 * Bars are flat fills now; a pattern is only used to mark partial coverage (hatched) and by SEVERITY_SERIES.
 */
export function categorical(keys: { key: string; label: string }[]): Series[] {
  const colors = ["var(--chart-1)", "var(--chart-1-tint)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  return keys.slice(0, 6).map((k, i) => ({ ...k, color: colors[i], shape: SHAPES[i % 4], pattern: "solid" as Pattern }));
}
/** Severity series: critical/high use the danger tokens; every level also has its own pattern and marker shape. */
export const SEVERITY_SERIES: Series[] = [
  { key: "critical", label: "Critical", color: "var(--chart-sev-critical)", pattern: "solid", shape: "circle" },
  { key: "high", label: "High", color: "var(--chart-sev-high)", pattern: "dots", shape: "square" },
  { key: "medium", label: "Medium", color: "var(--chart-sev-medium)", pattern: "solid", shape: "diamond" },
  { key: "low", label: "Low", color: "var(--chart-sev-low)", pattern: "solid", shape: "triangle" },
  { key: "review", label: "Review item", color: "var(--chart-sev-review)", pattern: "grid", shape: "circle" },
];

export interface TableData { head: string[]; rows: (string | number)[][]; caption?: string }

export const nf = (n: number) => n.toLocaleString("en");
export const atLeast = (cov: Coverage | undefined, text: string | number) => (cov === "partial" ? `≥${text}` : `${text}`);

/** Axis for 0..max with at most 5 steps of 1, 2, 2.5, 5 or 10 x 10^k. Picks the tightest fit, so the data fills the chart (52 gives 0..60, not 0..80). */
export function niceScale(max: number): { max: number; ticks: number[] } {
  if (max <= 0) return { max: 4, ticks: [0, 1, 2, 3, 4] };
  const p = Math.pow(10, Math.floor(Math.log10(max / 5)));
  let best = { step: 0, n: 0, top: Infinity };
  for (const m of [1, 2, 2.5, 5, 10]) {
    const step = m * p; const n = Math.max(2, Math.ceil(max / step - 1e-9));
    if (n > 5) continue;
    if (n * step < best.top - 1e-9) best = { step, n, top: n * step };
  }
  return { max: best.top, ticks: Array.from({ length: best.n + 1 }, (_, i) => +(i * best.step).toFixed(6)) };
}

/** Smooth but honest curve: monotone cubic (Fritsch-Carlson), so it never overshoots between points and never invents a peak. One cubic piece per segment. */
export function monotone(pts: { x: number; y: number }[]) {
  const n = pts.length; if (n < 2) return [] as string[];
  const dx: number[] = [], m: number[] = [], t: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1].x - pts[i].x; m[i] = (pts[i + 1].y - pts[i].y) / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], q = a * a + b * b;
    if (q > 9) { const tau = 3 / Math.sqrt(q); t[i] = tau * a * m[i]; t[i + 1] = tau * b * m[i]; }
  }
  return pts.slice(0, -1).map((p, i) => `M${p.x},${p.y}C${p.x + dx[i] / 3},${p.y + (t[i] * dx[i]) / 3} ${pts[i + 1].x - dx[i] / 3},${pts[i + 1].y - (t[i + 1] * dx[i]) / 3} ${pts[i + 1].x},${pts[i + 1].y}`);
}

export function markerPath(shape: MarkerShape, cx: number, cy: number, r: number): string {
  if (shape === "square") return `M${cx - r},${cy - r}h${2 * r}v${2 * r}h${-2 * r}z`;
  if (shape === "diamond") return `M${cx},${cy - r * 1.3}L${cx + r * 1.3},${cy}L${cx},${cy + r * 1.3}L${cx - r * 1.3},${cy}z`;
  if (shape === "triangle") return `M${cx},${cy - r * 1.25}L${cx + r * 1.2},${cy + r}H${cx - r * 1.2}z`;
  return `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0z`;
}

export function useWidth(fallback = 640) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    setW(Math.round(el.getBoundingClientRect().width) || fallback);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((e) => { const nw = Math.round(e[0].contentRect.width); if (nw > 0) setW(nw); });
    ro.observe(el); return () => ro.disconnect();
  }, [fallback]);
  return [ref, w] as const;
}

/** Filled swatch/segment shared by bars and legends so pattern and partial styling stay identical. */
export function Fill({ color, pattern = "solid", partial, style, title }: { color: string; pattern?: Pattern; partial?: boolean; style?: CSSProperties; title?: string }) {
  return <span className="ch-fill" data-pattern={pattern} data-partial={partial || undefined} title={title} style={{ "--fill": color, ...style } as CSSProperties} />;
}

export interface LegendItem { label: string; color: string; pattern?: Pattern; shape?: MarkerShape; kind?: "bar" | "line"; partial?: boolean; hollow?: boolean }

/**
 * Legend: shape/pattern plus label, never colour alone.
 * Use for 2+ series (even when also direct-labelled). Do not use for one series: the title names it.
 */
export function Legend({ items, label = "Legend" }: { items: LegendItem[]; label?: string }) {
  return (
    <ul className="ch-legend" aria-label={label}>
      {items.map((it) => (
        <li key={it.label}>
          {it.kind === "line" ? (
            <svg width="22" height="12" aria-hidden="true" focusable="false">
              <line x1="0" x2="22" y1="6" y2="6" stroke={it.color} strokeWidth="2" strokeDasharray={it.partial ? "4 3" : undefined} />
              <path d={markerPath(it.shape ?? "circle", 11, 6, 4)} fill={it.hollow ? "var(--sherpa-surface)" : it.color} stroke={it.hollow ? it.color : "var(--sherpa-surface)"} strokeWidth="2" />
            </svg>
          ) : <Fill color={it.color} pattern={it.pattern} partial={it.partial} />}
          <span>{it.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Unique SVG pattern id per chart instance, so several charts on a page never share or clash on ids. */
export function usePatternIds() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (key: string, partial?: boolean) => `ch${uid}-${key}${partial ? "-p" : ""}`;
}

/**
 * SVG twin of the CSS `Fill`: each series gets a pattern fill (solid, dots, grid, empty) and a hatched "partial coverage" variant,
 * so bars drawn as SVG look identical to their legend swatches.
 */
export function SeriesPatterns({ series, idOf }: { series: Series[]; idOf: (key: string, partial?: boolean) => string }) {
  return (
    <defs>
      {series.flatMap((s) => [false, true].map((partial) => (
        <pattern key={`${s.key}${partial}`} id={idOf(s.key, partial)} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform={partial ? "rotate(45)" : undefined}>
          {s.pattern === "empty"
            ? <rect x="0.75" y="0.75" width="4.5" height="4.5" style={{ fill: "none", stroke: s.color }} strokeWidth="1.5" />
            : <rect width="6" height="6" style={{ fill: s.color, opacity: partial ? 0.8 : 1 }} />}
          {s.pattern === "dots" && <circle cx="3" cy="3" r="1.3" style={{ fill: "var(--sherpa-surface)" }} />}
          {s.pattern === "grid" && <path d="M0 0H6M0 0V6" fill="none" style={{ stroke: "var(--sherpa-surface)" }} strokeWidth="1.5" />}
          {partial && <rect width="6" height="2" style={{ fill: "var(--sherpa-surface)" }} />}
        </pattern>
      )))}
    </defs>
  );
}

/** Rectangle with the trailing corners rounded: `end` "right" for horizontal bars, "top" for vertical bars. */
export function roundedEnd(x: number, y: number, w: number, h: number, r: number, end: "right" | "top"): string {
  const k = Math.max(0, Math.min(r, w, h) / (end === "right" ? 1 : 1));
  if (end === "right") return `M${x},${y}H${x + w - k}a${k},${k} 0 0 1 ${k},${k}V${y + h - k}a${k},${k} 0 0 1 ${-k},${k}H${x}z`;
  return `M${x},${y + h}V${y + k}a${k},${k} 0 0 1 ${k},${-k}H${x + w - k}a${k},${k} 0 0 1 ${k},${k}V${y + h}z`;
}

/** Cuts a label so it fits roughly `px` pixels at the chart font size. The full text stays in a <title>. */
export function fit(text: string, px: number): string {
  const max = Math.max(3, Math.floor(px / 6.6));
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

/** Greedy word wrap for SVG labels: up to `maxLines` lines of about `px` pixels each; the last line is cut with an ellipsis. */
export function wrapLabel(text: string, px: number, maxLines = 3): string[] {
  const max = Math.max(3, Math.floor(px / 6.6));
  const lines: string[] = []; let cur = "";
  for (const w of text.split(/\s+/)) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= max || !cur) cur = next; else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  const out = lines.slice(0, maxLines);
  if (lines.length > maxLines) out[maxLines - 1] = fit(`${out[maxLines - 1]}…`, px);
  return out.map((l) => (l.length > max ? fit(l, px) : l));
}

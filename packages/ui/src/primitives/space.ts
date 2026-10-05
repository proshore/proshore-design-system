import type { CSSProperties } from "react";

/** Spacing scale steps used across the system (4, 8, 12, 16, 24, 32, 40, 48, 64 px). */
export type Space = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type SpaceProps = { m?: Space; mt?: Space; mb?: Space; ml?: Space; mr?: Space; p?: Space; pt?: Space; pb?: Space; pl?: Space; pr?: Space };
const v = (s?: Space) => (s === undefined ? undefined : s === "0" ? 0 : `var(--space-${s})`);

/** Turns margin and padding props into inline style. Explicit style always wins. */
export function spaceStyle(p: SpaceProps, style?: CSSProperties): CSSProperties | undefined {
  const out: CSSProperties = {
    margin: v(p.m), marginTop: v(p.mt), marginBottom: v(p.mb), marginLeft: v(p.ml), marginRight: v(p.mr),
    padding: v(p.p), paddingTop: v(p.pt), paddingBottom: v(p.pb), paddingLeft: v(p.pl), paddingRight: v(p.pr),
  };
  for (const k of Object.keys(out) as (keyof CSSProperties)[]) if (out[k] === undefined) delete out[k];
  const merged = { ...out, ...style };
  return Object.keys(merged).length ? merged : undefined;
}
const SPACE_KEYS = ["m", "mt", "mb", "ml", "mr", "p", "pt", "pb", "pl", "pr"] as const;
export function splitSpace<T extends SpaceProps>(props: T): [SpaceProps, Omit<T, keyof SpaceProps>] {
  const sp: SpaceProps = {}; const rest: Record<string, unknown> = { ...props };
  for (const k of SPACE_KEYS) if (k in rest) { sp[k] = rest[k] as Space; delete rest[k]; }
  return [sp, rest as Omit<T, keyof SpaceProps>];
}

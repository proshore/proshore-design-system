import type { ReactNode } from "react";

/** The Sherpa suite's apps. One thin-line icon per app. */
export type AppGlyph = "workspace" | "scan" | "scenario" | "build" | "fixer" | "monitor";

/**
 * App icons: thin single-colour line drawings, one metaphor per app (mountaineering and Nepal). No filled tile:
 * the line colour is the ink colour, and the current app takes the accent. `framed` adds a hairline rounded square.
 */
function Glyph({ g, sw }: { g: AppGlyph; sw: number }) {
  // One family: 24 grid, 2px safe margin, round caps and joins, no fills. `sw` is the stroke in grid units, chosen so the line is about 1.8px on screen at any size.
  const p = { fill: "none", stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" focusable="false">
      {g === "workspace" && <><circle cx="12" cy="12" r="9" {...p} /><path d="M15.8 8.2l-2.3 5.3-5.3 2.3 2.3-5.3z" {...p} /><path d="M12 3v2M12 19v2M3 12h2M19 12h2" {...p} /></>}
      {g === "scan" && <><circle cx="7" cy="16" r="4" {...p} /><circle cx="17" cy="16" r="4" {...p} /><path d="M3.2 14.6L5.4 5h4l.9 5.4h3.4l.9-5.4h4l2.2 9.6" {...p} /><path d="M10.4 13.8h3.2" {...p} /></>}
      {g === "scenario" && <><circle cx="6" cy="5.5" r="2.2" {...p} /><circle cx="6" cy="18.5" r="2.2" {...p} /><circle cx="18" cy="9" r="2.2" {...p} /><path d="M6 7.7v8.6M6 13c0-3.4 3.2-4 9.8-4" {...p} /></>}
      {g === "fixer" && <><path d="M3 21c0-5.4 1.9-8.2 3.7-9.2C6.5 7.9 8 5.6 9.3 4.9l1.2 1.3L12 3.8l1.5 2.4 1.2-1.3c1.3.7 2.8 3 2.6 6.9 1.8 1 3.7 3.8 3.7 9.2l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4z" {...p} /><path d="M8.7 11.6c0-1.9 1.3-3.2 3.3-3.2s3.3 1.3 3.3 3.2v1.3c0 2.1-1.4 3.4-3.3 3.4s-3.3-1.3-3.3-3.4z" {...p} /><path d="M9.7 10l1.9.7M14.3 10l-1.9.7" {...p} /><circle cx="10.7" cy="11.5" r=".45" {...p} /><circle cx="13.3" cy="11.5" r=".45" {...p} /><path d="M10.7 14.4h2.6" {...p} /></>}
      {g === "build" && <><path d="M2.5 20.5L9 9l3.8 6.4 2.4-3.4 6.3 8.5z" {...p} /><path d="M6.8 12.6L9 14.6l2.2-2" {...p} /><path d="M9 9V3" {...p} /><path d="M9 3l5 1.7L9 6.4" {...p} /></>}
      {g === "monitor" && <><circle cx="12" cy="12" r="9" {...p} /><path d="M5.6 13h1.6M12 5.6v1.6M18.4 13h-1.6M7.7 8.2l1.1 1.1M16.3 8.2l-1.1 1.1" {...p} /><path d="M12 14l3.8-3.8" {...p} /><circle cx="12" cy="14" r=".9" {...p} /><path d="M8.5 18h7" {...p} /></>}
    </svg>
  );
}

/** The app icon. `active` = the app you are in (accent line). Decorative: the name always sits next to it. */
export function AppIcon({ glyph, size = 40, active = false, framed = false }: { glyph: AppGlyph; size?: number; active?: boolean; framed?: boolean }) {
  const inner = Math.round(size * (framed ? 0.6 : 0.8));
  const linePx = 0.55 * Math.min(2, Math.max(1.4, inner * 0.06)); // the fine weight Jeroen chose with the Yeti, now for every app icon
  const sw = (linePx * 24) / inner;
  return (
    <span className="pr-appicon" aria-hidden="true" data-active={active || undefined} data-framed={framed || undefined} style={{ width: size, height: size, borderRadius: size * 0.27 }}>
      <span style={{ width: inner, height: inner, display: "block" }}><Glyph g={glyph} sw={sw} /></span>
    </span>
  );
}

/** An app's large icon with its name and a line of text, for landing pages. */
export function AppTitle({ glyph, children }: { glyph: AppGlyph; children: ReactNode }) {
  return <div className="pr-apptitle"><AppIcon glyph={glyph} size={72} framed active /><div>{children}</div></div>;
}

/**
 * The Sherpa guide: the face of the Ask Sherpa assistant. A mountain guide in a knit beanie with a bobble, snow goggles and a scarf,
 * in the same thin line style as the app icons. `framed` puts it in a hairline circle, as an avatar. Decorative: the name sits beside it.
 */
export function SherpaGuide({ size = 20, framed = false, className }: { size?: number; framed?: boolean; className?: string }) {
  const inner = framed ? Math.round(size * 0.72) : size;
  const linePx = Math.min(1.7, Math.max(1.1, inner * 0.055));
  const sw = (linePx * 24) / inner;
  const p = { fill: "none", stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const svg = (
    <svg viewBox="0 0 24 24" width={inner} height={inner} aria-hidden="true" focusable="false">
      <circle cx="12" cy="3.3" r="1.3" {...p} />
      <path d="M6.4 10.4C6.4 6.7 8.7 4.6 12 4.6s5.6 2.1 5.6 5.8" {...p} />
      <path d="M5.6 11.4h12.8" {...p} />
      <path d="M10.3 9.6L12 7l1.7 2.6" {...p} />
      <path d="M6.6 11.4v1.4c0 4.2 2.4 7 5.4 7s5.4-2.8 5.4-7v-1.4" {...p} />
      <circle cx="9.4" cy="14.3" r="1.8" {...p} /><circle cx="14.6" cy="14.3" r="1.8" {...p} /><path d="M11.2 14.3h1.6M6.6 14.3h1M17.4 14.3h-1" {...p} />
      <path d="M10.4 17.3c1 .6 2.2.6 3.2 0" {...p} />
      <path d="M7.2 19.9c3 1.6 6.6 1.6 9.6 0M15.2 21.2l.8 2.1" {...p} />
    </svg>
  );
  if (!framed) return <span className={className} style={{ display: "inline-grid", width: size, height: size, placeItems: "center" }} aria-hidden="true">{svg}</span>;
  return <span className={className} aria-hidden="true" style={{ display: "inline-grid", placeItems: "center", width: size, height: size, borderRadius: "50%", border: "1px solid var(--sherpa-line)", background: "var(--sherpa-surface)", color: "var(--accent-11)" }}>{svg}</span>;
}

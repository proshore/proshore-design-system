import {
  CheckCircledIcon, CrossCircledIcon, EyeOpenIcon, ExclamationTriangleIcon,
  MagicWandIcon, QuestionMarkCircledIcon,
} from "@proshore/ui";
import type { ComponentType, CSSProperties } from "react";
import type { CoverageState, EvidenceState } from "./types";

type Meta = { label: string; hint: string; Icon: ComponentType<{ "aria-hidden"?: boolean }> };

export const evidenceMeta: Record<EvidenceState, Meta> = {
  observed: { label: "Observed", hint: "Reported by a named tool or read from source", Icon: EyeOpenIcon },
  inferred: { label: "Inferred", hint: "Generated interpretation, not yet reviewed", Icon: MagicWandIcon },
  confirmed: { label: "Confirmed", hint: "Checked by a named reviewer", Icon: CheckCircledIcon },
  unknown: { label: "Unknown", hint: "Open question, not yet answered", Icon: QuestionMarkCircledIcon },
};

const coverageMeta: Record<CoverageState, Meta> = {
  complete: { label: "Complete", hint: "All planned checks finished", Icon: CheckCircledIcon },
  partial: { label: "Partial", hint: "Some checks missing or not trusted. Counts mean “at least”", Icon: ExclamationTriangleIcon },
  failed: { label: "Failed", hint: "No current evidence. Not a clean result", Icon: CrossCircledIcon },
};

const pill: CSSProperties = {
  display: "inline-flex", alignSelf: "flex-start", whiteSpace: "nowrap", alignItems: "center", gap: "var(--space-1)", padding: "2px var(--space-2)",
  borderRadius: "var(--pr-radius-pill)", fontSize: "var(--font-size-1)", fontWeight: 500, lineHeight: 1.4,
};

/** Evidence state pill. Colour + icon + text; Unknown also uses a dashed border. */
export function EvidenceBadge({ state }: { state: EvidenceState }) {
  const { label, Icon } = evidenceMeta[state];
  return (
    <span
      title={evidenceMeta[state].hint}
      style={{
        ...pill,
        color: `var(--pr-${state}-fg)`, background: `var(--pr-${state}-bg)`,
        border: `1px ${state === "unknown" ? "dashed" : "solid"} var(--pr-${state}-border)`,
      }}
    >
      <Icon aria-hidden /> {label}
    </span>
  );
}

const coverageVar: Record<CoverageState, string> = {
  complete: "var(--pr-coverage-complete)", partial: "var(--pr-coverage-partial)", failed: "var(--pr-coverage-failed)",
};

export function CoverageBadge({ state, prefix = "Scan" }: { state: CoverageState; prefix?: string }) {
  const { label, Icon } = coverageMeta[state];
  return (
    <span title={coverageMeta[state].hint} style={{ ...pill, color: coverageVar[state], border: `1px ${state === "failed" ? "double" : "solid"} currentColor` }}>
      <Icon aria-hidden /> {prefix} {label.toLowerCase()}
    </span>
  );
}

const severityLabel: Record<string, string> = {
  critical: "Critical (tool-reported)", high: "High (tool-reported)", medium: "Medium (tool-reported)", low: "Low (tool-reported)", review: "Review item",
};
const severityShort: Record<string, string> = { critical: "Critical", high: "High", medium: "Medium", low: "Low", review: "Review item" };
const dotColor: Record<string, string> = { critical: "var(--sev-critical)", high: "var(--sev-high)", medium: "var(--sev-medium)", low: "var(--sev-low)", review: "var(--sev-review)" };
/**
 * Tool-reported severity, always with text. Not a business-risk claim. "review" = hotspot or concern, not a confirmed vulnerability.
 * `compact` = dot and short label for dense tables (the column header already says "tool severity").
 */
export function SeverityBadge({ severity, compact = false }: { severity: keyof typeof severityLabel; compact?: boolean }) {
  if (compact) {
    return (<span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 500, whiteSpace: "nowrap" }} title={severityLabel[severity]}><span aria-hidden style={{ width: 9, height: 9, borderRadius: 3, background: dotColor[severity], flex: "none" }} />{severityShort[severity]}</span>);
  }
  const strong = severity === "critical" || severity === "high";
  const Icon = strong ? ExclamationTriangleIcon : EyeOpenIcon;
  return (
    <span style={{ ...pill, ...(strong
      ? { color: "var(--pr-danger-fg)", background: "var(--pr-danger-bg)", border: "1px solid var(--pr-danger-border)" }
      : { color: "var(--gray-11)", border: "1px solid var(--gray-7)" }) }}>
      <Icon aria-hidden /> {severityLabel[severity]}
    </span>
  );
}

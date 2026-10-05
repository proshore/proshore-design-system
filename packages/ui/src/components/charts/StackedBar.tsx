import { Text } from "../../primitives/Text";
import { useMessages } from "../../i18n/I18nProvider";
import { Fill, nf, type Coverage, type Pattern } from "./shared";

export interface StackSegment { label: string; value: number; color: string; pattern?: Pattern }

/**
 * Single-row part-to-whole (severity split, scan coverage split). Use for 2 to 5 parts of one total.
 * Do not use to compare several totals (BarChart stacked) or as a pie/donut substitute for many slices.
 * Drawn as one soft pill; each part is named and counted under it, so colour is never the only cue (patterns appear only for partial coverage).
 * The text summary below is always rendered so small segments stay readable and screen readers get the data.
 */
export interface StackedBarProps {
  segments: StackSegment[]; unit: string; coverage?: Coverage;
  /** What the whole is, for the summary sentence, e.g. "Ordering, scan S-104". */
  subject: string;
}

export function StackedBar({ segments, unit, coverage = "complete", subject }: StackedBarProps) {
  const { t } = useMessages();
  const parts = segments.filter((s) => s.value > 0);
  const sum = parts.reduce((a, s) => a + s.value, 0);
  const pre = coverage === "partial" ? t("charts.stackedAtLeast") : "";
  const text = coverage === "none" ? t("charts.stackedNoData", { subject })
    : t("charts.stackedHead", { subject, prefix: pre, sum: nf(sum), unit }) + segments.map((s) => t("charts.stackedSegment", { label: s.label, value: nf(s.value), percent: sum ? Math.round((s.value / sum) * 100) : 0 })).join(", ") + (coverage === "partial" ? t("charts.stackedEndPartial") : t("charts.stackedEnd"));
  if (coverage === "none") return <div><div className="ch-none ch-stack__none" role="img" aria-label={text}>{t("charts.noData")}</div><Text as="p" size="1" color="gray" mt="2">{text}</Text></div>;
  return (
    <div>
      <div role="img" aria-label={text}>
        <div className="ch-stack__bar">{parts.map((s) => <Fill key={s.label} color={s.color} pattern={coverage === "partial" ? s.pattern : "solid"} partial={coverage === "partial"} title={`${s.label}: ${nf(s.value)}`} style={{ flex: `${s.value} 0 0` }} />)}</div>
        <div className="ch-stack__labels" aria-hidden="true">{parts.map((s) => <span key={s.label} title={`${s.label} ${nf(s.value)}`} style={{ flex: `${s.value} 0 0` }}>{s.label} {nf(s.value)}</span>)}</div>
      </div>
      <Text as="p" size="1" color="gray" mt="2">{text}</Text>
    </div>
  );
}

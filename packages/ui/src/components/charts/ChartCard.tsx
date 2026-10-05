import { Button } from "../../primitives/Button";
import { Text } from "../../primitives/Text";
import { useState, type ReactNode } from "react";
import { Panel, Stack } from "../layout";
import { useMessages } from "../../i18n/I18nProvider";
import type { Coverage, TableData } from "./shared";

/**
 * Wrapper for every chart. Use it whenever a chart appears on a screen: it guarantees a plain-language takeaway,
 * an honest caveat, a legend slot, provenance and the accessible table alternative.
 * Do not put a chart on a page without it, and do not write a title that only names the metric ("Revenue by region").
 * State the takeaway as the title ("Northern region drives most revenue").
 */
export interface ChartCardProps {
  /** Takeaway as a plain-language title. */
  title: string;
  /** One sentence: what this shows. */
  description: string;
  /** Data-quality caveat, e.g. values are "at least" because the data is incomplete. Shown whenever coverage is not complete. */
  caveat?: ReactNode;
  coverage?: Coverage;
  legend?: ReactNode;
  /** Source footer, e.g. "Invoices table, 1 Jan to 30 Sep, demo data". */
  source: string;
  /** Same data as the chart. Required: every chart has a table view. */
  table: TableData;
  children: ReactNode;
}

export function ChartCard({ title, description, caveat, coverage, legend, source, table, children }: ChartCardProps) {
  const { t, tn } = useMessages();
  const [asTable, setAsTable] = useState(false);
  return (
    <Panel
      title={title}
      actions={<Button size="1" variant="soft" className="ch-card__toggle" aria-pressed={asTable} onClick={() => setAsTable((v) => !v)}>{asTable ? t("charts.viewAsChart") : t("charts.viewAsTable")}</Button>}
      footer={<span className="ch-card__foot">{tn("charts.source", { source })}</span>}
    >
      <Stack gap={3}>
        <Text as="p" size="2" color="gray">{description}</Text>
        {(caveat || coverage === "partial") && (
          <div className="ch-card__caveat" role="note"><span aria-hidden="true">{"◐"}</span><span><strong>{t("charts.partialCoverage")}</strong> {caveat ?? t("charts.atLeastShown")}</span></div>
        )}
        {!asTable && legend}
        {asTable ? (
          <div className="ch-table-wrap">
            <table className="ch-table">
              {table.caption && <caption>{table.caption}</caption>}
              <thead><tr>{table.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
              <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody>
            </table>
          </div>
        ) : children}
      </Stack>
    </Panel>
  );
}

import type { ReactNode } from "react";

/**
 * SimpleTable: a short, static, semantic table (no sorting, search or paging). For anything users need to explore,
 * use DataTable instead. First column is the row header. Scrolls inside its own keyboard-focusable region.
 */
export function SimpleTable<T>({ caption, columns, rows, getRowId }: {
  caption: string; columns: { id: string; header: string; cell: (row: T) => ReactNode }[]; rows: T[]; getRowId: (row: T) => string;
}) {
  return (
    <div className="pr-simpletable" role="region" aria-label={`${caption}, scrollable`} tabIndex={0}>
      <table>
        <caption className="pr-sr">{caption}</caption>
        <thead><tr>{columns.map((c) => <th key={c.id} scope="col">{c.header}</th>)}</tr></thead>
        <tbody>{rows.map((r) => (<tr key={getRowId(r)}>{columns.map((c, i) => (i === 0 ? <th key={c.id} scope="row">{c.cell(r)}</th> : <td key={c.id}>{c.cell(r)}</td>))}</tr>))}</tbody>
      </table>
    </div>
  );
}

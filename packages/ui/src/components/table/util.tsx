import type { ReactNode } from "react";
import type { ColumnDef, SortPrimitive } from "./types";

/**
 * Wraps matches of `query` inside `text` in a mark.
 */
export function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((p, i) => (i % 2 === 1 ? <mark key={i} className="dt-mark">{p}</mark> : p));
}

const str = (v: SortPrimitive) => (v === null || v === undefined ? "" : v instanceof Date ? v.toISOString() : String(v));
/** Spreadsheet formula characters get a leading apostrophe so exported text cannot execute. */
const csvCell = (s: string) => {
  const safe = /^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function toCsv<T>(rows: T[], columns: ColumnDef<T>[]): string {
  const head = columns.map((c) => csvCell(c.header)).join(",");
  const body = rows.map((r) => columns.map((c) => csvCell(c.csv ? c.csv(r) : str(c.accessor?.(r)))).join(","));
  return [head, ...body].join("\r\n");
}

/** Client-side only: builds a Blob and clicks a temporary link. Nothing is sent anywhere. */
export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * CellSub: the secondary text of a table cell (an id, a category, a reviewer). Put it after the primary text in the same cell.
 * In the default single-line density it sits inline after the primary text, muted, and is cut off first when the cell is too long.
 * In the comfortable density it stacks as a second line. Do not put essential information only here: it can be truncated.
 *
 * @example
 * cell: (f) => <><span className="dt-title">{f.title}</span><CellSub>{f.id} · {f.category}</CellSub></>
 */
export function CellSub({ children }: { children: ReactNode }) {
  return <span className="dt-sub">{children}</span>;
}

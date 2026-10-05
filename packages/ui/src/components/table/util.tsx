import type { ReactNode } from "react";
import type { ColumnDef, SortPrimitive } from "./types";

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

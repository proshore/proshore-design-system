import { Pagination } from "../Pagination";
import { Note } from "../Note";
import {
  ArrowDownIcon, ArrowUpIcon, CaretSortIcon, CheckIcon,
  DownloadIcon, InfoCircledIcon, RowsIcon, ViewVerticalIcon,
} from "../../icons";
import { Checkbox, Select } from "../../primitives/forms";
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import { Button } from "../../primitives/Button";
import { Text } from "../../primitives/Text";
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { FilterBar, useActiveFilters } from "./FilterBar";
import { EmptyState, ErrorState, NoResults, TableSkeleton } from "./states";
import { PAGE_SIZES, type ColumnDef, type PageSize, type SortDir } from "./types";
import { isHideable, isSortable, useTableState } from "./useTableState";
import { Highlight, downloadCsv, toCsv } from "./util";
import { useMessages } from "../../i18n/I18nProvider";
import "./table.css";

export type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** Accessible name of the table and export file name stem. */
  caption: string;
  /** Plural noun for counts and labels: "invoices". */
  noun?: string;
  status?: "ready" | "loading" | "error";
  errorMessage?: ReactNode;
  onRetry?: () => void;
  emptyState?: ReactNode;
  /** Adds the coverage warning to the no-results state. Set it whenever a zero result could be mistaken for a clean result. */
  noResultsHint?: boolean;
  /** Banner above the table, e.g. a Note that the scan is partial. Recommended: `<PartialBanner summary="...">` or a `<Note summary="...">`, one line with the full text behind Details. */
  partialNotice?: ReactNode;
  /** Called with the row and the full filtered and sorted list (all pages), so a detail panel can step through what is on screen. */
  onRowOpen?: (row: T, visibleRows: T[]) => void;
  rowLabel?: (row: T) => string;
  selectable?: boolean;
  bulkActions?: (selected: T[]) => ReactNode;
  features?: { search?: boolean; filters?: boolean; density?: boolean; columns?: boolean; export?: boolean; pagination?: boolean };
  toolbarRight?: ReactNode;
  initialSort?: { id: string; dir: SortDir }[];
  initialPageSize?: PageSize;
  initialDensity?: "comfortable" | "compact";
  initialHidden?: string[];
  onExported?: (info: { count: number; filename: string }) => void;
  maxHeight?: string;
};

/** Single-line cells are cut with an ellipsis; on hover a cut cell gets its full text as tooltip. Keyboard and screen reader users get the full text from the row detail and the DOM. */
function cellTooltip(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const inner = el.querySelector<HTMLElement>(".dt-rowbtn"); // the first cell's text sits in the row button, which does the clipping
  const cut = el.scrollWidth > el.clientWidth + 1 || (inner !== null && inner.scrollWidth > inner.clientWidth + 1);
  if (cut) { if (!el.title) { el.title = el.textContent ?? ""; el.dataset.tip = ""; } }
  else if (el.dataset.tip !== undefined) { el.removeAttribute("title"); delete el.dataset.tip; }
}

const AlignCls = { start: "", end: " dt-end", center: " dt-center" } as const;

/**
 * Smooth row movement: when sorting, filtering or paging changes the rows, rows that stay slide to their new place (FLIP),
 * new rows fade up with a light stagger. Disabled with reduced motion.
 */
function useRowMotion(bodyRef: React.RefObject<HTMLTableSectionElement | null>, orderKey: string) {
  const prev = useRef<Map<string, number>>(new Map());
  useLayoutEffect(() => {
    const body = bodyRef.current; if (!body) return;
    const base = body.getBoundingClientRect().top;
    const rows = [...body.querySelectorAll<HTMLElement>("tr[data-rowid]")];
    const now = new Map(rows.map((r) => [r.dataset.rowid as string, r.getBoundingClientRect().top - base]));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) rows.forEach((r, i) => {
      const id = r.dataset.rowid as string; const before = prev.current.get(id); const after = now.get(id) as number;
      if (before !== undefined) { const dy = before - after; if (Math.abs(dy) > 1) r.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" }); }
      else r.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 300, delay: Math.min(i, 10) * 18, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
    });
    prev.current = now;
  }, [bodyRef, orderKey]);
}

/**
 * DataTable: the full data grid. Sorting, search, filters, column visibility, density, pagination, CSV export, row selection and loading, error and empty states in one component. Columns describe how to read, show, sort and export each row.
 *
 * @example
 * <DataTable
 *   caption="Applications"
 *   noun="applications"
 *   rows={apps}
 *   getRowId={(a) => a.id}
 *   columns={[
 *     { id: "name", header: "Name", accessor: (a) => a.name },
 *     { id: "owner", header: "Owner", accessor: (a) => a.owner },
 *   ]}
 *   onRowOpen={(a) => setOpen(a.id)}
 * />
 */
export function DataTable<T>(props: DataTableProps<T>) {
  const { t, tn } = useMessages();
  const { columns, rows, getRowId, caption, status = "ready", onRowOpen, selectable = false, features = {} } = props;
  const noun = props.noun ?? t("table.defaultNoun");
  const f = { search: true, filters: true, density: true, columns: true, export: true, pagination: true, ...features };
  const s = useTableState<T>(rows, columns, { getRowId, initialSort: props.initialSort, initialPageSize: props.initialPageSize, initialDensity: props.initialDensity, initialHidden: props.initialHidden });
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const focusSearch = () => setTimeout(() => rootRef.current?.querySelector<HTMLInputElement>("[role=search] input")?.focus(), 0);
  const active = useActiveFilters(s, columns).map((f) => ({ ...f, remove: () => { f.remove(); focusSearch(); } }));
  const [tableW, setTableW] = useState(99999);
  useLayoutEffect(() => { const el = rootRef.current; if (!el) return; const ro = new ResizeObserver(([e]) => setTableW(e.contentRect.width)); ro.observe(el); return () => ro.disconnect(); }, []);
  const chosen = s.visibleColumns;
  const vis = chosen.filter((c) => !c.hideBelow || tableW >= c.hideBelow);
  const hasFacets = columns.some((c) => c.filter);
  const showBar = f.search || (f.filters && hasFacets) || f.density || f.columns || f.export || props.toolbarRight;
  const sortCols = s.sort.map((k) => ({ ...k, header: columns.find((c) => c.id === k.id)?.header ?? k.id }));
  const sortText = sortCols.length ? t("table.sortedBy", { sorts: sortCols.map((k) => t("table.sortPart", { header: k.header, direction: k.dir === "asc" ? t("table.ascending") : t("table.descending") })).join(t("table.sortThen")) }) : t("table.defaultOrder");

  const doExport = () => {
    const filename = `${caption.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.csv`;
    downloadCsv(filename, toCsv(s.sorted, vis));
    props.onExported?.({ count: s.sorted.length, filename });
  };

  const right = (
    <>
      {f.density && (
        <Button size="2" variant="outline" color="gray" aria-pressed={s.density === "compact"} onClick={() => s.setDensity(s.density === "compact" ? "comfortable" : "compact")}>
          <RowsIcon aria-hidden /> {t("table.compactRows")}
        </Button>
      )}
      {f.columns && (
        <MenuTrigger>
          <Button size="2" variant="outline" color="gray" aria-label={t("table.columnsMenu")}><ViewVerticalIcon aria-hidden /> {t("table.columns")}</Button>
          <Popover className="pr-popover" placement="bottom end">
            <Menu className="pr-menu" aria-label={t("table.columnsMenu")} selectionMode="multiple" selectedKeys={new Set(chosen.map((c) => c.id))}
              onSelectionChange={() => undefined}>
              {columns.map((c) => (
                <MenuItem key={c.id} id={c.id} className="pr-menu__item" textValue={c.header} isDisabled={!isHideable(c)} onAction={() => s.toggleHidden(c.id)}>
                  <span className="pr-menu__check" aria-hidden>{chosen.includes(c) && <CheckIcon />}</span>{c.header}
                </MenuItem>
              ))}
            </Menu>
          </Popover>
        </MenuTrigger>
      )}
      {f.export && <Button size="2" variant="outline" color="gray" onClick={doExport} disabled={status !== "ready" || s.sorted.length === 0}><DownloadIcon aria-hidden /> {t("table.exportCsv")}</Button>}
      {props.toolbarRight}
    </>
  );

  const stickyIdx = vis.findIndex((c) => c.sticky);
  const colStyle = (c: ColumnDef<T>, i: number): CSSProperties => ({
    width: c.width, minWidth: c.minWidth ?? c.width,
    ...(i === stickyIdx ? { left: selectable ? "var(--dt-sel-w)" : 0 } : {}),
  });
  const colSpan = vis.length + (selectable ? 1 : 0);

  const onRowClick = (e: MouseEvent, row: T) => {
    if (!onRowOpen || (e.target as HTMLElement).closest("button,a,input,label,[role=checkbox]")) return;
    onRowOpen(row, s.sorted);
  };

  const body = useMemo(() => {
    if (status === "loading") return <TableSkeleton columns={Math.max(3, vis.length)} label={t("table.loading", { noun })} />;
    if (status === "error") return <ErrorState message={props.errorMessage} onRetry={props.onRetry} />;
    if (props.rows.length === 0) return props.emptyState ?? <EmptyState title={t("table.emptyTitle", { noun })} description={t("table.emptyText")} />;
    if (s.filtered.length === 0) return <NoResults filters={active} search={s.search} onReset={() => { s.resetFilters(); focusSearch(); }} hint={props.noResultsHint} noun={noun} />;
    return null;
  }, [status, props.rows.length, props.emptyState, props.errorMessage, props.onRetry, props.noResultsHint, s.filtered.length, active, s.search, s.resetFilters, vis.length, noun, t]);

  const first = s.page * s.pageSize;
  useRowMotion(bodyRef, s.pageRows.map((r) => getRowId(r)).join("|"));
  const rangeText = s.filtered.length ? t("table.range", { from: first + 1, to: first + s.pageRows.length, total: s.filtered.length }) : t("table.rangeNone");

  return (
    <div className="dt" ref={rootRef} data-density={s.density}>
      {props.partialNotice}
      {showBar && (
        <FilterBar state={s} columns={columns} noun={noun} showSearch={f.search} showFilters={f.filters} right={right} />
      )}
      {!showBar && <Text as="p" size="2" role="status" aria-live="polite" className="dt-visually-hidden">{tn("table.count", { count: s.filtered.length, total: s.total, noun })}</Text>}

      {selectable && s.selected.size > 0 && (
        <div className="dt-bulk" role="region" aria-label={t("table.bulkActions")}>
          <Text size="2" weight="bold" role="status">{tn("table.selected", { count: s.selected.size })}</Text>
          <div className="dt-bulk__actions">{props.bulkActions?.(s.selectedRows)}<Button size="1" variant="ghost" onClick={s.clearSelection}>{t("table.clearSelection")}</Button></div>
        </div>
      )}

      <div className="dt-frame">
        {body ?? (
          <div className="dt-scroll" tabIndex={0} role="region" aria-label={t("common.scrollable", { caption })} style={{ maxHeight: props.maxHeight }}>
            <table className="dt-table" style={{ "--dt-sel-w": "44px" } as CSSProperties}>
              <caption className="dt-visually-hidden">{caption}. {sortText}</caption>
              <thead>
                <tr>
                  {selectable && (
                    <th scope="col" className="dt-th dt-sel dt-stickyc" style={{ left: 0 }}>
                      <span className="dt-check"><Checkbox aria-label={t("table.selectAll", { noun })} isSelected={s.allOnPage} isIndeterminate={!s.allOnPage && s.someOnPage} onChange={s.togglePage} /></span>
                    </th>
                  )}
                  {vis.map((c, i) => {
                    const idx = s.sort.findIndex((k) => k.id === c.id);
                    const dir = idx >= 0 ? s.sort[idx].dir : undefined;
                    const sortable = isSortable(c);
                    return (
                      <th key={c.id} scope="col" className={`dt-th${AlignCls[c.align ?? "start"]}${i === stickyIdx ? " dt-stickyc" : ""}`} style={colStyle(c, i)}
                        aria-sort={sortable ? (dir ? (dir === "asc" ? "ascending" : "descending") : "none") : undefined}>
                        {sortable ? (
                          <button type="button" className="dt-sortbtn" onClick={(e) => s.toggleSort(c.id, e.shiftKey)} title={t("table.sortHint")}>
                            <span>{c.header}</span>
                            {dir === "asc" ? <ArrowUpIcon aria-hidden /> : dir === "desc" ? <ArrowDownIcon aria-hidden /> : <CaretSortIcon aria-hidden className="dt-sortbtn__idle" />}
                            {s.sort.length > 1 && idx >= 0 && <span className="dt-sortbtn__n" aria-label={t("table.sortPriority", { n: idx + 1 })}>{idx + 1}</span>}
                          </button>
                        ) : <span className="dt-th__text">{c.header}</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody ref={bodyRef}>
                {s.pageRows.map((row) => {
                  const id = getRowId(row);
                  const sel = s.selected.has(id);
                  return (
                    <tr key={id} data-rowid={id} className="dt-row" data-selected={sel || undefined} data-openable={onRowOpen ? "" : undefined} onClick={(e) => onRowClick(e, row)}>
                      {selectable && (
                        <td className="dt-td dt-sel dt-stickyc" style={{ left: 0 }}>
                          <span className="dt-check"><Checkbox aria-label={t("table.selectRow", { label: props.rowLabel?.(row) ?? id })} isSelected={sel} onChange={() => s.toggleRow(id)} /></span>
                        </td>
                      )}
                      {vis.map((c, i) => {
                        const ctx = { query: s.search, highlight: (t: string) => <Highlight text={t} query={s.search} /> };
                        const raw = c.accessor?.(row);
                        const content = c.cell ? c.cell(row, ctx) : raw instanceof Date ? raw.toLocaleDateString() : raw === null || raw === undefined || raw === "" ? <span className="dt-muted">{t("table.notRecorded")}</span> : ctx.highlight(String(raw));
                        const asBtn = onRowOpen && i === 0;
                        return (
                          <td key={c.id} className={`dt-td${AlignCls[c.align ?? "start"]}${i === stickyIdx ? " dt-stickyc" : ""}`} style={colStyle(c, i)} onMouseEnter={cellTooltip}>
                            {asBtn ? <button type="button" className="dt-rowbtn" aria-label={props.rowLabel ? t("table.openRow", { label: props.rowLabel(row) }) : undefined} onClick={() => onRowOpen(row, s.sorted)}>{content}</button> : content}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Text as="p" size="1" role="status" aria-live="polite" className="dt-visually-hidden">{sortText}</Text>

      {f.pagination && status === "ready" && s.filtered.length > 0 && (
        <div className="dt-footer">
          <div className="dt-footer__size">
            <Text size="2" color="gray" aria-hidden>{t("table.rowsPerPage")}</Text>
            <Select label={t("table.rowsPerPage")} hideLabel size="2" value={String(s.pageSize)} onChange={(v) => s.setPageSize(Number(v) as PageSize)} options={PAGE_SIZES.map((n) => ({ value: String(n), label: String(n) }))} />
          </div>
          <Pagination page={s.page} pageCount={s.pageCount} onPageChange={s.setPage} range={rangeText} label={t("table.paginationLabel", { caption })} />
        </div>
      )}
    </div>
  );
}

/** Convenience banner for "the list is incomplete". Give it a `summary` for the one-line version with a Details expander (recommended for `partialNotice`). */
export function PartialBanner({ children, summary }: { children: ReactNode; summary?: ReactNode }) {
  return (
    <div className="dt-partial"><Note tone="warning" summary={summary}>{children}</Note></div>
  );
}

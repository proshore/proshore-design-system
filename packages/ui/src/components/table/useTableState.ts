import {
  columnFacetingFeature, columnFilteringFeature, columnVisibilityFeature, createFacetedRowModel, createFacetedUniqueValues, createFilteredRowModel,
  createSortedRowModel, globalFilteringFeature, rowSortingFeature, tableFeatures, useTable,
  type ColumnDef as TanColumn, type ColumnFiltersState, type SortingState, type ColumnVisibilityState,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import type { ColumnDef, Density, FilterOption, PageSize, SortDir, SortKey, SortPrimitive } from "./types";

export type UseTableStateOptions<T> = {
  getRowId: (row: T) => string;
  initialSort?: SortKey[];
  initialPageSize?: PageSize;
  initialDensity?: Density;
  initialFilters?: Record<string, string[]>;
  initialHidden?: string[];
};

/** Locale-aware, numeric-aware, empty values last. Ties return 0 so the caller can keep original order. */
export function comparePrimitive(a: SortPrimitive, b: SortPrimitive): number {
  const ae = a === null || a === undefined || a === "";
  const be = b === null || b === undefined || b === "";
  if (ae || be) return ae && be ? 0 : ae ? 1 : -1;
  if (a instanceof Date || b instanceof Date) return new Date(a as Date).getTime() - new Date(b as Date).getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

const sortVal = <T,>(c: ColumnDef<T>, r: T): SortPrimitive => (c.sortValue ?? c.accessor)?.(r);
export const isSortable = <T,>(c: ColumnDef<T>) => c.sortable ?? Boolean(c.sortValue || c.accessor);
export const isHideable = <T,>(c: ColumnDef<T>) => c.hideable ?? !c.sticky;
const filterValueOf = <T,>(c: ColumnDef<T>, r: T): string => c.filter?.value?.(r) ?? String(c.accessor?.(r) ?? "");
function searchTextOf<T>(c: ColumnDef<T>, r: T): string {
  if (c.searchText === false) return "";
  if (c.searchText) return c.searchText(r);
  const v = c.accessor?.(r);
  return typeof v === "string" ? v : "";
}

/** Only the features the design system uses are registered, so the bundle stays small. Stable module-level reference, as v9 requires. */
const features = tableFeatures({
  columnFilteringFeature, globalFilteringFeature, filteredRowModel: createFilteredRowModel(),
  columnFacetingFeature, facetedRowModel: createFacetedRowModel(), facetedUniqueValues: createFacetedUniqueValues(),
  rowSortingFeature, sortedRowModel: createSortedRowModel(),
  columnVisibilityFeature,
});
type Features = typeof features;

const empty = (v: SortPrimitive) => v === null || v === undefined || v === "";

/**
 * Table state and row pipeline. The public shape is the design system's own (`ColumnDef`, `TableState`);
 * @tanstack/react-table v9 is the headless engine underneath: global and column filtering, faceted counts, multi-sort and column visibility.
 * Paging and row selection stay in this hook (a few lines each, and they are tied to the pager and bulk-action UI).
 * Nothing TanStack-specific leaks into `DataTable` props, so the engine can change again without touching consumers.
 */
export function useTableState<T>(rows: T[], columns: ColumnDef<T>[], opts: UseTableStateOptions<T>) {
  const { getRowId } = opts;
  const [search, setSearchRaw] = useState("");
  const [sorting, setSorting] = useState<SortingState>((opts.initialSort ?? []).map((s) => ({ id: s.id, desc: s.dir === "desc" })));
  const [filters, setFiltersRaw] = useState<Record<string, string[]>>(opts.initialFilters ?? {});
  const [pageIndex, setPage] = useState(0);
  const [pageSize, setPageSizeRaw] = useState<PageSize>(opts.initialPageSize ?? 10);
  const [density, setDensity] = useState<Density>(opts.initialDensity ?? "comfortable");
  const [hidden, setHidden] = useState<string[]>(opts.initialHidden ?? []);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const setSearch = useCallback((v: string) => { setSearchRaw(v); setPage(0); }, []);
  const setFilter = useCallback((id: string, values: string[]) => {
    setFiltersRaw((f) => { const n = { ...f }; if (values.length) n[id] = values; else delete n[id]; return n; });
    setPage(0);
  }, []);
  const setPageSize = useCallback((s: PageSize) => { setPageSizeRaw(s); setPage(0); }, []);
  const resetFilters = useCallback(() => { setSearchRaw(""); setFiltersRaw({}); setPage(0); }, []);

  /** Click cycles asc, desc, none. Shift-click adds or cycles a secondary key. */
  const toggleSort = useCallback((id: string, additive: boolean) => {
    setSorting((cur) => {
      const i = cur.findIndex((s) => s.id === id);
      // undefined = none; the cycle is asc, desc, none
      const next = (desc: boolean | undefined): boolean | undefined => (desc === undefined ? false : desc === false ? true : undefined);
      if (additive) {
        if (i === -1) return [...cur, { id, desc: false }];
        const d = next(cur[i].desc);
        return d === undefined ? cur.filter((_, k) => k !== i) : cur.map((s, k) => (k === i ? { id, desc: d } : s));
      }
      const d = next(i === -1 || cur.length > 1 ? undefined : cur[0].desc);
      return d === undefined ? [] : [{ id, desc: d }];
    });
    setPage(0);
  }, []);

  const toggleHidden = useCallback((id: string) => setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id])), []);

  const tanColumns = useMemo<TanColumn<Features, any>[]>(() => columns.map((c) => ({
    id: c.id,
    // accessorFn feeds sorting and faceting; empty values become undefined so `sortUndefined: "last"` keeps them last in both directions
    accessorFn: (r: any) => { const v = sortVal(c, r); return empty(v) ? undefined : v; },
    enableSorting: isSortable(c),
    enableMultiSort: true,
    sortUndefined: "last",
    sortFn: (a, b, id) => comparePrimitive(a.getValue(id) as SortPrimitive, b.getValue(id) as SortPrimitive),
    enableColumnFilter: Boolean(c.filter),
    filterFn: (row, _id, value: string[]) => {
      if (!value?.length) return true;
      const v = filterValueOf(c, row.original as T);
      return c.filter?.kind === "text" ? v.toLowerCase().includes(value[0].toLowerCase()) : value.includes(v);
    },
    // facet options and counts use the display filter value, not the sort value
    getUniqueValues: (r: any) => (c.filter ? [filterValueOf(c, r)] : []),
    enableGlobalFilter: true,
  })), [columns]);

  const columnFilters = useMemo<ColumnFiltersState>(() => Object.entries(filters).map(([id, value]) => ({ id, value })), [filters]);
  const columnVisibility = useMemo<ColumnVisibilityState>(() => Object.fromEntries(columns.map((c) => [c.id, !hidden.includes(c.id) || !isHideable(c)])), [columns, hidden]);

  const table = useTable({
    features,
    data: rows as any[], // the engine is untyped internally; the public hook stays generic in T
    columns: tanColumns,
    getRowId: (r: any) => getRowId(r as T),
    state: { sorting, columnFilters, globalFilter: search.trim().toLowerCase(), columnVisibility },
    onSortingChange: setSorting,
    enableMultiSort: true,
    enableSortingRemoval: true,
    getColumnCanGlobalFilter: () => true,
    globalFilterFn: (row, columnId, q: string) => {
      const c = columns.find((x) => x.id === columnId);
      return c ? searchTextOf(c, row.original as T).toLowerCase().includes(q) : false;
    },
  });

  const filtered = useMemo(() => table.getFilteredRowModel().rows.map((r) => r.original as T), [table, rows, columnFilters, search, tanColumns]); // eslint-disable-line react-hooks/exhaustive-deps
  const sorted = useMemo(() => table.getSortedRowModel().rows.map((r) => r.original as T), [table, rows, columnFilters, search, sorting, tanColumns]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(pageIndex, pageCount - 1);
  const pageRows = useMemo(() => sorted.slice(safePage * pageSize, safePage * pageSize + pageSize), [sorted, safePage, pageSize]);

  /** Option list per facet column. Counts come from TanStack's faceted model: every OTHER active filter and the search apply, this column's own filter does not. */
  const facets = useMemo(() => {
    const out: Record<string, { option: FilterOption; count: number }[]> = {};
    for (const c of columns) {
      if (!c.filter || c.filter.kind === "text") continue;
      const col = table.getColumn(c.id);
      if (!col) continue;
      const counts = col.getFacetedUniqueValues();
      const opts = c.filter.options ?? [...new Set(rows.map((r) => filterValueOf(c, r)).filter(Boolean))].sort((a, b) => a.localeCompare(b)).map((value) => ({ value }));
      out[c.id] = opts.map((option) => ({ option, count: counts.get(option.value) ?? 0 }));
    }
    return out;
  }, [columns, rows, table, columnFilters, search, tanColumns]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleColumns = useMemo(() => columns.filter((c) => columnVisibility[c.id]), [columns, columnVisibility]);
  const activeFilterCount = Object.keys(filters).length + (search.trim() ? 1 : 0);

  const sort: SortKey[] = sorting.map((s) => ({ id: s.id, dir: s.desc ? "desc" : "asc" }));
  const pageIds = pageRows.map(getRowId);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someOnPage = pageIds.some((id) => selected.has(id));
  const toggleRow = useCallback((id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; }), []);
  const togglePage = useCallback(() => setSelected((s) => { const n = new Set(s); if (pageIds.every((id) => n.has(id))) pageIds.forEach((id) => n.delete(id)); else pageIds.forEach((id) => n.add(id)); return n; }), [pageIds.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  const clearSelection = useCallback(() => setSelected(new Set()), []);
  const selectedRows = useMemo(() => rows.filter((r) => selected.has(getRowId(r))), [rows, selected, getRowId]);

  return {
    search, setSearch, sort, toggleSort, filters, setFilter, resetFilters, activeFilterCount,
    page: safePage, setPage, pageCount, pageSize, setPageSize, density, setDensity,
    hidden, toggleHidden, visibleColumns,
    selected, toggleRow, togglePage, clearSelection, selectedRows, allOnPage, someOnPage,
    filtered, sorted, pageRows, facets, total: rows.length,
  };
}
export type TableState<T> = ReturnType<typeof useTableState<T>>;

import type { ReactNode } from "react";

export type SortDir = "asc" | "desc";
export type SortKey = { id: string; dir: SortDir };
export type Density = "comfortable" | "compact";
export type PageSize = 10 | 25 | 50;
export const PAGE_SIZES: PageSize[] = [10, 25, 50];

export type SortPrimitive = string | number | Date | null | undefined;
type FilterKind = "select" | "multi" | "text";
export type FilterOption = { value: string; label?: string };

export type CellContext = { query: string; highlight: (text: string) => ReactNode };

export type ColumnDef<T> = {
  id: string;
  /** Plain-text header. Also used for the column menu, filter buttons and CSV. */
  header: string;
  /** Raw value. Used as default for sort, search, filter and CSV. */
  accessor?: (row: T) => SortPrimitive;
  /** Custom renderer. Without it the accessor value is shown with search highlighting. */
  cell?: (row: T, ctx: CellContext) => ReactNode;
  /** Overrides accessor for sorting: use for ranks (severity), dates, numbers. */
  sortValue?: (row: T) => SortPrimitive;
  /** Set false to disable sorting. Default: true when accessor or sortValue exists. */
  sortable?: boolean;
  /** Text searched by the global search. Default: accessor value when it is a string. Set false to exclude. */
  searchText?: ((row: T) => string) | false;
  /** Plain text for CSV. Default: accessor value. */
  csv?: (row: T) => string;
  align?: "start" | "end" | "center";
  /** CSS width, e.g. 120 or "22rem". */
  width?: number | string;
  minWidth?: number | string;
  filter?: {
    kind: FilterKind;
    /** Omit to derive from the data. Order is kept as given. */
    options?: FilterOption[];
    /** Value compared against options. Default: String(accessor). */
    value?: (row: T) => string;
  };
  /** Can be hidden from the column menu. Default true, except for sticky columns. */
  hideable?: boolean;
  /** Responsive: hide this column when the table is narrower than this many px. Extra detail appears on wide screens. */
  hideBelow?: number;
  /** Stays visible on horizontal scroll. Use on the first column only. */
  sticky?: boolean;
};

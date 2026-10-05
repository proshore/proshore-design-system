import { Cross2Icon, MixerHorizontalIcon } from "../../icons";
import { Checkbox, RadioGroup, SearchField, TextField } from "../../primitives/forms";
import { PopoverPanel } from "../../primitives/Popover";
import { Badge } from "../../primitives/Card";
import { Button, IconButton } from "../../primitives/Button";
import { Text } from "../../primitives/Text";
import { useId, type ReactNode } from "react";
import type { TableState } from "./useTableState";
import type { ColumnDef } from "./types";

export type ActiveFilter = { key: string; columnId: string; label: string; value: string; remove: () => void };

export function useActiveFilters<T>(state: TableState<T>, columns: ColumnDef<T>[]): ActiveFilter[] {
  const out: ActiveFilter[] = [];
  for (const c of columns) {
    const vals = state.filters[c.id];
    if (!vals?.length || !c.filter) continue;
    for (const v of vals) {
      const label = c.filter.kind === "text" ? v : c.filter.options?.find((o) => o.value === v)?.label ?? v;
      out.push({ key: `${c.id}:${v}`, columnId: c.id, label: c.header, value: label, remove: () => state.setFilter(c.id, vals.filter((x) => x !== v)) });
    }
  }
  return out;
}

/**
 * Removable chips that show which filters and search are active.
 */
export function FilterChips({ filters, search, onClearSearch }: { filters: ActiveFilter[]; search?: string; onClearSearch?: () => void }) {
  if (!filters.length && !search?.trim()) return null;
  return (
    <ul className="dt-chips" aria-label="Active filters">
      {search?.trim() && onClearSearch && (
        <li><Chip text={`Search: “${search.trim()}”`} label={`Remove search “${search.trim()}”`} onRemove={onClearSearch} /></li>
      )}
      {filters.map((f) => <li key={f.key}><Chip text={`${f.label}: ${f.value}`} label={`Remove filter ${f.label}: ${f.value}`} onRemove={f.remove} /></li>)}
    </ul>
  );
}
function Chip({ text, label, onRemove }: { text: string; label: string; onRemove: () => void }) {
  return (
    <Badge size="2" variant="soft" className="dt-chip">
      {text}
      <IconButton size="1" variant="ghost" color="gray" aria-label={label} onClick={onRemove} className="dt-chip__x"><Cross2Icon aria-hidden /></IconButton>
    </Badge>
  );
}

function FacetButton<T>({ column, state }: { column: ColumnDef<T>; state: TableState<T> }) {
  const f = column.filter!;
  const selected = state.filters[column.id] ?? [];
  const id = useId();
  const count = selected.length;
  return (
    <PopoverPanel label={`Filter by ${column.header}`} trigger={
        <Button variant={count ? "soft" : "outline"} color="gray" size="2" className="dt-facetbtn" aria-label={`Filter by ${column.header}${count ? `, ${count} selected` : ""}`}>
          <MixerHorizontalIcon aria-hidden /> {column.header}{count ? <span className="dt-facetbtn__n">{count}</span> : null}
        </Button>}>
      <div className="dt-popover">
        <div className="dt-popover__head">
          <Text as="p" size="2" weight="bold" id={`${id}-t`}>{column.header}</Text>
          {count > 0 && <Button size="1" variant="ghost" onClick={() => state.setFilter(column.id, [])}>Clear</Button>}
        </div>
        {f.kind === "text" ? (
          <TextField label={`${column.header} contains`} hideLabel value={selected[0] ?? ""} placeholder="Contains…" onChange={(v) => state.setFilter(column.id, v ? [v] : [])} />
        ) : f.kind === "select" ? (
          <RadioGroup label={column.header} hideLabel value={selected[0] ?? "__any"} onChange={(v) => state.setFilter(column.id, v === "__any" ? [] : [v])} className="dt-facet"
            options={[{ value: "__any", label: "Any" }, ...(state.facets[column.id] ?? []).map(({ option, count: n }) => ({ value: option.value, label: <span className="dt-facet__line"><span>{option.label ?? option.value}</span><span className="dt-facet__n">{n}</span></span> }))]} />
        ) : (
          <div role="group" aria-labelledby={`${id}-t`} className="dt-facet">
            {(state.facets[column.id] ?? []).map(({ option, count: n }) => {
              const on = selected.includes(option.value);
              return (
                <Checkbox key={option.value} isSelected={on} onChange={() => state.setFilter(column.id, on ? selected.filter((x) => x !== option.value) : [...selected, option.value])}>
                  <span className="dt-facet__line"><span>{option.label ?? option.value}</span><span className="dt-facet__n" aria-label={`${n} items`}>{n}</span></span>
                </Checkbox>
              );
            })}
          </div>
        )}
      </div>
    </PopoverPanel>
  );
}

/**
 * Search and filter controls for a table, driven by the state from useTableState.
 */
export function FilterBar<T>({ state, columns, noun = "items", searchLabel, searchPlaceholder, showSearch = true, showFilters = true, right, hasActiveFilters }: {
  state: TableState<T>; columns: ColumnDef<T>[]; noun?: string; searchLabel?: string; searchPlaceholder?: string;
  showSearch?: boolean; showFilters?: boolean; right?: ReactNode; hasActiveFilters?: boolean;
}) {
  const sid = useId();
  const focusSearch = () => setTimeout(() => document.getElementById(sid)?.focus(), 0);
  const active = useActiveFilters(state, columns).map((f) => ({ ...f, remove: () => { f.remove(); if (showSearch) focusSearch(); } }));
  const facetCols = columns.filter((c) => c.filter);
  const anyActive = hasActiveFilters ?? state.activeFilterCount > 0;
  return (
    <div className="dt-filterbar">
      <div className="dt-filterbar__row">
        {showSearch && (
          <div role="search" className="dt-search">
            <SearchField id={sid} label={searchLabel ?? `Search ${noun}`} placeholder={searchPlaceholder ?? `Search ${noun}`} value={state.search} onChange={state.setSearch} onClear={() => state.setSearch("")} />
          </div>
        )}
        {showFilters && facetCols.map((c) => <FacetButton key={c.id} column={c} state={state} />)}
        {right && <div className="dt-filterbar__right">{right}</div>}
      </div>
      <div className="dt-filterbar__row dt-filterbar__row--meta">
        <Text as="p" size="2" role="status" aria-live="polite" aria-atomic="true" className="dt-count">
          {state.filtered.length} of {state.total} {noun}
        </Text>
        <FilterChips filters={active} search={state.search} onClearSearch={() => { state.setSearch(""); if (showSearch) focusSearch(); }} />
        {anyActive && <Button size="1" variant="ghost" onClick={() => { state.resetFilters(); if (showSearch) focusSearch(); }}>Reset filters</Button>}
      </div>
    </div>
  );
}

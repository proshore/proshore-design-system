import { Cross2Icon, MixerHorizontalIcon } from "../../icons";
import { Checkbox, RadioGroup, SearchField, TextField } from "../../primitives/forms";
import { PopoverPanel } from "../../primitives/Popover";
import { Badge } from "../../primitives/Card";
import { Button, IconButton } from "../../primitives/Button";
import { Text } from "../../primitives/Text";
import { useId, useSyncExternalStore, type ReactNode } from "react";
import type { TableState } from "./useTableState";
import type { ColumnDef } from "./types";
import { useMessages } from "../../i18n/I18nProvider";

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
  const { t } = useMessages();
  if (!filters.length && !search?.trim()) return null;
  return (
    <ul className="dt-chips" aria-label={t("table.activeFilters")}>
      {search?.trim() && onClearSearch && (
        <li><Chip text={t("table.searchChip", { search: search.trim() })} label={t("table.removeSearch", { search: search.trim() })} onRemove={onClearSearch} /></li>
      )}
      {filters.map((f) => <li key={f.key}><Chip text={`${f.label}: ${f.value}`} label={t("table.removeFilter", { label: f.label, value: f.value })} onRemove={f.remove} /></li>)}
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

/** The controls of one facet (title, clear, options). Shared by the per-facet popover and the single Filters popover on narrow screens. */
function FacetBody<T>({ column, state }: { column: ColumnDef<T>; state: TableState<T> }) {
  const { t } = useMessages();
  const f = column.filter!;
  const selected = state.filters[column.id] ?? [];
  const id = useId();
  const count = selected.length;
  return (
    <div className="dt-popover">
      <div className="dt-popover__head">
        <Text as="p" size="2" weight="bold" id={`${id}-t`}>{column.header}</Text>
        {count > 0 && <Button size="1" variant="ghost" onClick={() => state.setFilter(column.id, [])}>{t("table.clear")}</Button>}
      </div>
      {f.kind === "text" ? (
        <TextField label={t("table.contains", { column: column.header })} hideLabel value={selected[0] ?? ""} placeholder={t("table.containsPlaceholder")} onChange={(v) => state.setFilter(column.id, v ? [v] : [])} />
      ) : f.kind === "select" ? (
        <RadioGroup label={column.header} hideLabel value={selected[0] ?? "__any"} onChange={(v) => state.setFilter(column.id, v === "__any" ? [] : [v])} className="dt-facet"
          options={[{ value: "__any", label: t("table.any") }, ...(state.facets[column.id] ?? []).map(({ option, count: n }) => ({ value: option.value, label: <span className="dt-facet__line"><span>{option.label ?? option.value}</span><span className="dt-facet__n">{n}</span></span> }))]} />
      ) : (
        <div role="group" aria-labelledby={`${id}-t`} className="dt-facet">
          {(state.facets[column.id] ?? []).map(({ option, count: n }) => {
            const on = selected.includes(option.value);
            return (
              <Checkbox key={option.value} isSelected={on} onChange={() => state.setFilter(column.id, on ? selected.filter((x) => x !== option.value) : [...selected, option.value])}>
                <span className="dt-facet__line"><span>{option.label ?? option.value}</span><span className="dt-facet__n" aria-label={t("table.facetCount", { count: n })}>{n}</span></span>
              </Checkbox>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FacetButton<T>({ column, state }: { column: ColumnDef<T>; state: TableState<T> }) {
  const { t } = useMessages();
  const count = (state.filters[column.id] ?? []).length;
  return (
    <PopoverPanel label={t("table.filterBy", { column: column.header })} trigger={
        <Button variant={count ? "soft" : "outline"} color="gray" size="2" className="dt-facetbtn" aria-label={count ? t("table.filterBySelected", { column: column.header, count }) : t("table.filterBy", { column: column.header })}>
          <MixerHorizontalIcon aria-hidden /> {column.header}{count ? <span className="dt-facetbtn__n">{count}</span> : null}
        </Button>}>
      <FacetBody column={column} state={state} />
    </PopoverPanel>
  );
}

/** Narrow screens: one Filters button with a badge, one popover with every facet. */
function FiltersButton<T>({ columns, state }: { columns: ColumnDef<T>[]; state: TableState<T> }) {
  const { t } = useMessages();
  const count = columns.filter((c) => (state.filters[c.id] ?? []).length > 0).length;
  return (
    <PopoverPanel label={t("table.filters")} width={320} trigger={
        <Button variant={count ? "soft" : "outline"} color="gray" size="2" className="dt-facetbtn" aria-label={count ? t("table.filtersActive", { count }) : t("table.filters")}>
          <MixerHorizontalIcon aria-hidden /> {t("table.filters")}{count ? <span className="dt-facetbtn__n">{count}</span> : null}
        </Button>}>
      <div className="dt-allfacets">
        {columns.map((c) => <FacetBody key={c.id} column={c} state={state} />)}
      </div>
    </PopoverPanel>
  );
}

const NARROW = "(max-width: 719.98px)";
/** True below 720px viewport width. */
function useNarrow() {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia(NARROW); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
}

/**
 * Search and filter controls for a table, driven by the state from useTableState.
 */
export function FilterBar<T>({ state, columns, noun: nounProp, searchLabel, searchPlaceholder, showSearch = true, showFilters = true, right, hasActiveFilters }: {
  state: TableState<T>; columns: ColumnDef<T>[]; noun?: string; searchLabel?: string; searchPlaceholder?: string;
  showSearch?: boolean; showFilters?: boolean; right?: ReactNode; hasActiveFilters?: boolean;
}) {
  const { t, tn } = useMessages();
  const noun = nounProp ?? t("table.defaultNoun");
  const sid = useId();
  const focusSearch = () => setTimeout(() => document.getElementById(sid)?.focus(), 0);
  const active = useActiveFilters(state, columns).map((f) => ({ ...f, remove: () => { f.remove(); if (showSearch) focusSearch(); } }));
  const facetCols = columns.filter((c) => c.filter);
  const anyActive = hasActiveFilters ?? state.activeFilterCount > 0;
  const narrow = useNarrow();
  const count = (
    <Text as="p" size="2" role="status" aria-live="polite" aria-atomic="true" className="dt-count">
      {tn("table.count", { count: state.filtered.length, total: state.total, noun })}
    </Text>
  );
  const showMeta = active.length > 0 || state.search.trim().length > 0;
  const facets = showFilters && facetCols.length > 0 ? (narrow ? <FiltersButton columns={facetCols} state={state} /> : facetCols.map((c) => <FacetButton key={c.id} column={c} state={state} />)) : null;
  const search = showSearch && (
    <div role="search" className="dt-search">
      <SearchField id={sid} label={searchLabel ?? t("table.searchLabel", { noun })} placeholder={searchPlaceholder ?? t("table.searchPlaceholder", { noun })} value={state.search} onChange={state.setSearch} onClear={() => state.setSearch("")} />
    </div>
  );
  return (
    <div className="dt-filterbar" data-narrow={narrow || undefined}>
      <div className="dt-filterbar__row">
        {narrow ? (
          <>
            {search}
            <div className="dt-filterbar__row dt-filterbar__row--tools">{facets}{right && <div className="dt-filterbar__right">{right}</div>}</div>
            <div className="dt-filterbar__count">{count}</div>
          </>
        ) : (
          <>
            {search}{facets}
            <div className="dt-filterbar__count">{count}</div>
            {right && <div className="dt-filterbar__right">{right}</div>}
          </>
        )}
      </div>
      {showMeta && (
        <div className="dt-filterbar__row dt-filterbar__row--meta">
          <FilterChips filters={active} search={state.search} onClearSearch={() => { state.setSearch(""); if (showSearch) focusSearch(); }} />
          {anyActive && <Button size="1" variant="ghost" onClick={() => { state.resetFilters(); if (showSearch) focusSearch(); }}>{t("table.resetFilters")}</Button>}
        </div>
      )}
    </div>
  );
}

import { ExclamationTriangleIcon, InboxIcon } from "./icons";
import { Button } from "../../primitives/Button";
import { Skeleton, Text } from "../../primitives/Text";
import type { ReactNode } from "react";
import { PrayerFlags } from "../Motifs";
import { FilterChips, type ActiveFilter } from "./FilterBar";

export function TableSkeleton({ columns = 5, rows = 6, label = "Loading" }: { columns?: number; rows?: number; label?: string }) {
  return (
    <div className="dt-state" aria-busy="true">
      <Text as="p" role="status" size="2" color="gray" className="dt-visually-hidden">{label}…</Text>
      <div className="dt-skeleton" aria-hidden style={{ "--dt-cols": columns } as React.CSSProperties}>
        {Array.from({ length: rows }, (_, r) => (
          <div className="dt-skeleton__row" key={r}>{Array.from({ length: columns }, (_, c) => <Skeleton key={c} height="16px" style={{ width: c === 0 ? "80%" : "60%" }} />)}</div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", description, action }: { title?: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="dt-state dt-state--msg">
      <PrayerFlags className="dt-flags" width={120} />
      <Text as="p" size="3" weight="bold">{title}</Text>
      {description && <Text as="p" size="2" color="gray" className="dt-state__text">{description}</Text>}
      {action}
    </div>
  );
}

export const NO_RESULTS_HINT = "No items match. That is not the same as no issues: check scan coverage.";

export function NoResults({ filters = [], search, onReset, hint = false, noun = "items" }: { filters?: ActiveFilter[]; search?: string; onReset?: () => void; hint?: boolean; noun?: string }) {
  return (
    <div className="dt-state dt-state--msg">
      <PrayerFlags className="dt-flags" width={120} />
      <Text as="p" size="3" weight="bold">{hint ? NO_RESULTS_HINT : `No ${noun} match these filters.`}</Text>
      {(filters.length > 0 || search?.trim()) && (
        <>
          <Text as="p" size="2" color="gray">Active filters</Text>
          <FilterChips filters={filters} search={search} onClearSearch={onReset} />
        </>
      )}
      {onReset && <Button variant="soft" onClick={onReset}>Reset filters</Button>}
    </div>
  );
}

export function ErrorState({ title = "The list could not be loaded", message, onRetry }: { title?: string; message?: ReactNode; onRetry?: () => void }) {
  return (
    <div className="dt-state dt-state--msg dt-state--error" role="alert">
      <ExclamationTriangleIcon aria-hidden />
      <Text as="p" size="3" weight="bold">{title}</Text>
      {message && <Text as="p" size="2" color="gray" className="dt-state__text">{message}</Text>}
      <Text as="p" size="2" color="gray" className="dt-state__text">This is a loading problem, not an empty result.</Text>
      {onRetry && <Button variant="soft" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

import { ExclamationTriangleIcon, InboxIcon } from "./icons";
import { Button } from "../../primitives/Button";
import { Skeleton, Text } from "../../primitives/Text";
import type { ReactNode } from "react";
import { PrayerFlags } from "../Motifs";
import { useMessages } from "../../i18n/I18nProvider";
import { messages } from "../../i18n/messages";
import { FilterChips, type ActiveFilter } from "./FilterBar";

export function TableSkeleton({ columns = 5, rows = 6, label }: { columns?: number; rows?: number; label?: string }) {
  const { t } = useMessages();
  return (
    <div className="dt-state" aria-busy="true">
      <Text as="p" role="status" size="2" color="gray" className="dt-visually-hidden">{label ?? t("table.loadingDefault")}…</Text>
      <div className="dt-skeleton" aria-hidden style={{ "--dt-cols": columns } as React.CSSProperties}>
        {Array.from({ length: rows }, (_, r) => (
          <div className="dt-skeleton__row" key={r}>{Array.from({ length: columns }, (_, c) => <Skeleton key={c} height="16px" style={{ width: c === 0 ? "80%" : "60%" }} />)}</div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title?: string; description?: ReactNode; action?: ReactNode }) {
  const { t } = useMessages();
  return (
    <div className="dt-state dt-state--msg">
      <PrayerFlags className="dt-flags" width={120} />
      <Text as="p" size="3" weight="bold">{title ?? t("table.emptyDefaultTitle")}</Text>
      {description && <Text as="p" size="2" color="gray" className="dt-state__text">{description}</Text>}
      {action}
    </div>
  );
}

/** The English text of the no-results coverage hint. NoResults itself shows the hint in the current language. */
export const NO_RESULTS_HINT = messages.en.table.noResultsHint;

export function NoResults({ filters = [], search, onReset, hint = false, noun }: { filters?: ActiveFilter[]; search?: string; onReset?: () => void; hint?: boolean; noun?: string }) {
  const { t } = useMessages();
  return (
    <div className="dt-state dt-state--msg">
      <PrayerFlags className="dt-flags" width={120} />
      <Text as="p" size="3" weight="bold">{hint ? t("table.noResultsHint") : t("table.noResultsTitle", { noun: noun ?? t("table.defaultNoun") })}</Text>
      {(filters.length > 0 || search?.trim()) && (
        <>
          <Text as="p" size="2" color="gray">{t("table.activeFilters")}</Text>
          <FilterChips filters={filters} search={search} onClearSearch={onReset} />
        </>
      )}
      {onReset && <Button variant="soft" onClick={onReset}>{t("table.resetFilters")}</Button>}
    </div>
  );
}

export function ErrorState({ title, message, onRetry }: { title?: string; message?: ReactNode; onRetry?: () => void }) {
  const { t } = useMessages();
  return (
    <div className="dt-state dt-state--msg dt-state--error" role="alert">
      <ExclamationTriangleIcon aria-hidden />
      <Text as="p" size="3" weight="bold">{title ?? t("table.errorTitle")}</Text>
      {message && <Text as="p" size="2" color="gray" className="dt-state__text">{message}</Text>}
      <Text as="p" size="2" color="gray" className="dt-state__text">{t("table.errorText")}</Text>
      {onRetry && <Button variant="soft" onClick={onRetry}>{t("table.retry")}</Button>}
    </div>
  );
}

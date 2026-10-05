import type { ReactNode } from "react";
import "./pagination.css";
import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "../icons";
import { IconButton } from "../primitives/Button";
import { Text } from "../primitives/Text";
import { useMessages } from "../i18n/I18nProvider";

/**
 * Pagination: previous and next, with first and last when there are more than five pages. `range` is the sentence about
 * what is shown ("1-10 of 37"). The buttons stay in place and are marked disabled at the ends, so the layout never jumps.
 * DataTable uses this; use it directly for lists and card grids.
 */
export function Pagination({ page, pageCount, onPageChange, range, label }: {
  /** Zero-based current page. */ page: number; pageCount: number; onPageChange: (p: number) => void; range?: string; label?: string;
}) {
  const { t, tn } = useMessages();
  const first = page <= 0, last = page >= pageCount - 1;
  const btn = (name: string, disabled: boolean, to: number, icon: ReactNode) => (
    <IconButton size="2" variant="outline" color="gray" aria-label={name} aria-disabled={disabled || undefined} data-disabled={disabled || undefined} onClick={() => { if (!disabled) onPageChange(to); }}>{icon}</IconButton>
  );
  return (
    <nav className="dt-pager" aria-label={label ?? t("pagination.label")}>
      {range && <Text size="2" aria-live="polite" className="dt-pager__range">{range}</Text>}
      {pageCount > 5 && btn(t("pagination.first"), first, 0, <DoubleArrowLeftIcon aria-hidden />)}
      {btn(t("pagination.previous"), first, page - 1, <ChevronLeftIcon aria-hidden />)}
      <Text size="2" color="gray" className="dt-pager__page">{tn("pagination.page", { page: page + 1, pageCount })}</Text>
      {btn(t("pagination.next"), last, page + 1, <ChevronRightIcon aria-hidden />)}
      {pageCount > 5 && btn(t("pagination.last"), last, pageCount - 1, <DoubleArrowRightIcon aria-hidden />)}
    </nav>
  );
}

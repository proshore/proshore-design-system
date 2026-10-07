import { CheckCircledIcon, CrossCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from "../icons";
import { useId, useState, type ReactNode } from "react";
import { useMessages } from "../i18n/I18nProvider";

export type NoteTone = "info" | "warning" | "success" | "danger";
const icons = { info: InfoCircledIcon, warning: ExclamationTriangleIcon, success: CheckCircledIcon, danger: CrossCircledIcon };

/**
 * Note: an inline message inside the page. Tone maps to the semantic tokens (info = accent, warning = inferred,
 * success = confirmed, danger), so contrast is guaranteed in light and dark. Icon and text always accompany the colour.
 * Use for things that stay on the page (partial data, blocked step). Use a toast for events that pass.
 * `role="status"` is only set when `live` is true, so static notes are not announced again on every render.
 * With `summary` the note is one line (icon, summary, a Details button) and `children` expand below it. The full text is always in the page
 * (only visually collapsed), so screen readers read all of it. Keep the details to plain text. This is the recommended partial notice for a DataTable.
 */
export function Note({ tone = "info", children, live = false, summary }: { tone?: NoteTone; children: ReactNode; live?: boolean; summary?: ReactNode }) {
  const Icon = icons[tone];
  const { t } = useMessages();
  const [open, setOpen] = useState(false);
  const id = useId();
  if (summary === undefined) {
    return (
      <div className="pr-note" data-tone={tone} role={live ? "status" : "note"}>
        <Icon aria-hidden /><div>{children}</div>
      </div>
    );
  }
  return (
    <div className="pr-note" data-tone={tone} data-open={open || undefined} role={live ? "status" : "note"}>
      <Icon aria-hidden />
      <div className="pr-note__body">
        <div className="pr-note__line">
          <span className="pr-note__summary">{summary}</span>
          <button type="button" className="pr-note__toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>{open ? t("note.lessDetails") : t("note.details")}</button>
        </div>
        <div id={id} className="pr-note__more">{children}</div>
      </div>
    </div>
  );
}

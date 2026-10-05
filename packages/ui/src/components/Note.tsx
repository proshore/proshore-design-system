import { CheckCircledIcon, CrossCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from "../icons";
import type { ReactNode } from "react";

export type NoteTone = "info" | "warning" | "success" | "danger";
const icons = { info: InfoCircledIcon, warning: ExclamationTriangleIcon, success: CheckCircledIcon, danger: CrossCircledIcon };

/**
 * Note: an inline message inside the page. Tone maps to the semantic tokens (info = accent, warning = inferred,
 * success = confirmed, danger), so contrast is guaranteed in light and dark. Icon and text always accompany the colour.
 * Use for things that stay on the page (partial data, blocked step). Use a toast for events that pass.
 * `role="status"` is only set when `live` is true, so static notes are not announced again on every render.
 */
export function Note({ tone = "info", children, live = false }: { tone?: NoteTone; children: ReactNode; live?: boolean }) {
  const Icon = icons[tone];
  return (
    <div className="pr-note" data-tone={tone} role={live ? "status" : "note"}>
      <Icon aria-hidden /><div>{children}</div>
    </div>
  );
}

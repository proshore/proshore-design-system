import type { ReactNode } from "react";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";

/**
 * PopoverPanel: a small dialog anchored to a trigger (filters, quick settings). Focus moves in, Esc closes,
 * focus returns to the trigger. `trigger` must be our Button or IconButton. `label` names the dialog for screen readers.
 * Renders into <body>, so it relies on the page-level tokens (decision 44).
 */
export function PopoverPanel({ trigger, label, children, width = 280, placement = "bottom start" }: {
  trigger: ReactNode; label: string; children: ReactNode; width?: number; placement?: "bottom start" | "bottom end" | "bottom";
}) {
  return (
    <DialogTrigger>
      {trigger}
      <Popover className="pr-popover" placement={placement}>
        <Dialog aria-label={label} className="pr-panel" style={{ width }}>{children}</Dialog>
      </Popover>
    </DialogTrigger>
  );
}

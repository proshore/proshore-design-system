import type { ReactNode } from "react";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";

/**
 * PopoverPanel: a small dialog anchored to a trigger (filters, quick settings). Focus moves in, Esc closes,
 * focus returns to the trigger. `trigger` must be our Button or IconButton. `label` names the dialog for screen readers.
 * Renders into <body>, so it relies on the page-level tokens (decision 44).
 *
 * Uncontrolled by default. Pass `open` and `onOpenChange` (same pattern as ModalDialog) to control it, for example
 * to close it after choosing an item. `onOpenChange` fires for Escape, outside click and the trigger too.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <PopoverPanel open={open} onOpenChange={setOpen} label="Row actions" trigger={<Button variant="outline">Actions</Button>}>
 *   <Button variant="ghost" onClick={() => { archive(); setOpen(false); }}>Archive</Button>
 * </PopoverPanel>
 */
export function PopoverPanel({ trigger, label, children, width = 280, placement = "bottom start", open, onOpenChange }: {
  trigger: ReactNode; label: string; children: ReactNode; width?: number; placement?: "bottom start" | "bottom end" | "bottom";
  open?: boolean; onOpenChange?: (open: boolean) => void;
}) {
  return (
    <DialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      {trigger}
      <Popover className="pr-popover" placement={placement}>
        <Dialog aria-label={label} className="pr-panel" style={{ width }}>{children}</Dialog>
      </Popover>
    </DialogTrigger>
  );
}

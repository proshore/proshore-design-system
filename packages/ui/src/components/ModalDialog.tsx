import { useId, type ReactNode } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { Button } from "../primitives/Button";
import { Text } from "../primitives/Text";

/**
 * ModalDialog (React Aria Modal): a short, focused question or form that must be answered before going on. Focus is
 * trapped, Esc closes it, focus returns to the control that opened it. For the detail of a record use SlideOver; for a
 * small anchored panel use PopoverPanel. Keep it to one decision: if it needs scrolling, it should be a page.
 *
 * @example
 * <ModalDialog open={open} onOpenChange={setOpen} title="Rename workspace" description="Everyone in the workspace sees the new name.">
 *   <TextField label="Name" value={name} onChange={setName} />
 * </ModalDialog>
 */
export function ModalDialog({ open, onOpenChange, title, description, children, footer, dismissable = true, alert = false }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: ReactNode; description?: ReactNode; children?: ReactNode; footer?: ReactNode;
  /** Whether a click outside closes it. Set false when closing would lose work. */ dismissable?: boolean;
  /** role="alertdialog": for confirmations of something that cannot be undone. */ alert?: boolean;
}) {
  const descId = useId();
  return (
    <ModalOverlay isOpen={open} onOpenChange={onOpenChange} isDismissable={dismissable} isKeyboardDismissDisabled={!dismissable} className="pr-dlg-overlay">
      <Modal className="pr-dlg">
        <Dialog role={alert ? "alertdialog" : "dialog"} aria-describedby={description ? descId : undefined} className="pr-dlg__box">
          <Heading slot="title" className="pr-dlg__title">{title}</Heading>
          {description && <Text as="p" size="2" color="gray" id={descId} className="pr-dlg__desc">{description}</Text>}
          {children && <div className="pr-dlg__body">{children}</div>}
          {footer && <div className="pr-dlg__foot">{footer}</div>}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

/**
 * ConfirmDialog: "Are you sure?" done well. The title says what will happen, the confirm button repeats the action
 * ("Suspend access", not "OK"), and `tone="danger"` is for things that cannot be undone. Cancel is always there and has focus order first.
 *
 * @example
 * <ConfirmDialog open={open} onOpenChange={setOpen} title="Suspend this user?" description="They lose access immediately." confirmLabel="Suspend" tone="danger" onConfirm={suspend} />
 */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", tone = "default", busy = false, onConfirm }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: ReactNode; description?: ReactNode;
  confirmLabel?: string; cancelLabel?: string; tone?: "default" | "danger"; busy?: boolean; onConfirm: () => void;
}) {
  return (
    <ModalDialog open={open} onOpenChange={onOpenChange} title={title} description={description} alert={tone === "danger"}
      footer={<>
        <Button variant="outline" onClick={() => onOpenChange(false)}>{cancelLabel}</Button>
        <Button className={tone === "danger" ? "pr-btn--danger" : undefined} disabled={busy} onClick={onConfirm}>{busy ? "Working…" : confirmLabel}</Button>
      </>} />
  );
}

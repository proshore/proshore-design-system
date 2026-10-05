import { EnterFullScreenIcon, ChevronLeftIcon, ChevronRightIcon, Cross2Icon } from "../icons";
import { useState, type ReactNode } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { IconButton, Tooltip } from "../primitives/Button";
import { Eyebrow } from "./Bits";
import { useMessages } from "../i18n/I18nProvider";

/**
 * SlideOver (React Aria Modal): detail of ONE item without leaving the list (a record, a decision, an assistant).
 * Anatomy (fixed, so every slide-over lines up): sticky header (eyebrow, title, chips, prev/next, wider, close),
 * scrolling body made of groups, sticky footer with the actions. Modal: focus is trapped, Esc and a click outside
 * close it, focus returns to whatever opened it. Renders into <body>, so it uses the page-level tokens.
 * Do not use for forms longer than one screen or for anything that must stay open while the user works elsewhere.
 *
 * @example
 * <SlideOver open={open} onOpenChange={setOpen} eyebrow="Application" title="Billing portal" footer={<Button onClick={() => setOpen(false)}>Close</Button>}>
 *   <Text>Details of the selected row.</Text>
 * </SlideOver>
 */
export function SlideOver({ open, onOpenChange, eyebrow, title, chips, children, footer, nav, size = "md" }: {
  open: boolean; onOpenChange: (o: boolean) => void; eyebrow: ReactNode; title: ReactNode; chips?: ReactNode; children: ReactNode; footer?: ReactNode;
  nav?: { index: number; total: number; onPrev: () => void; onNext: () => void }; size?: "md" | "lg";
}) {
  const { t, tn } = useMessages();
  const [wide, setWide] = useState(false);
  const width = wide || size === "lg" ? 720 : 520;
  return (
    <ModalOverlay isOpen={open} onOpenChange={onOpenChange} isDismissable className="so-overlay">
      <Modal className="so-modal" style={{ "--so-w": `${width}px` } as React.CSSProperties}>
        <Dialog className="so">
          <header className="so__head">
            <div className="so__bar">
              <Eyebrow>{eyebrow}</Eyebrow>
              <div className="so__nav">
                {nav && (
                  <>
                    <Tooltip content={t("slideOver.previous")}><IconButton variant="ghost" color="gray" aria-label={t("slideOver.previous")} disabled={nav.index <= 0} onClick={nav.onPrev}><ChevronLeftIcon /></IconButton></Tooltip>
                    <span className="pr-eyebrow" aria-live="polite">{tn("slideOver.position", { index: nav.index + 1, total: nav.total })}</span>
                    <Tooltip content={t("slideOver.next")}><IconButton variant="ghost" color="gray" aria-label={t("slideOver.next")} disabled={nav.index >= nav.total - 1} onClick={nav.onNext}><ChevronRightIcon /></IconButton></Tooltip>
                  </>
                )}
                <Tooltip content={wide ? t("slideOver.narrower") : t("slideOver.wider")}><IconButton variant="ghost" color="gray" aria-label={wide ? t("slideOver.makeNarrower") : t("slideOver.makeWider")} aria-pressed={wide} onClick={() => setWide((w) => !w)}><EnterFullScreenIcon /></IconButton></Tooltip>
                <IconButton variant="ghost" color="gray" aria-label={t("slideOver.close")} onClick={() => onOpenChange(false)}><Cross2Icon /></IconButton>
              </div>
            </div>
            <Heading slot="title" className="so__title">{title}</Heading>
            {chips && <div className="so__chips">{chips}</div>}
          </header>
          <div className="so__body">{children}</div>
          {footer && <footer className="so__foot">{footer}</footer>}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

/** Titled group inside a slide-over body. */
export function SlideGroup({ title, children }: { title: string; children: ReactNode }) {
  return (<section className="so__group"><Eyebrow>{title}</Eyebrow>{children}</section>);
}

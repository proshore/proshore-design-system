import { EnterFullScreenIcon, ChevronLeftIcon, ChevronRightIcon, Cross2Icon } from "../icons";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useShell } from "../shell/ShellContext";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { IconButton, Tooltip } from "../primitives/Button";
import { Eyebrow } from "./Bits";
import { useMessages } from "../i18n/I18nProvider";

/**
 * SlideOver (React Aria Modal): detail of ONE item without leaving the list (a record, a decision, an assistant).
 * Anatomy (fixed, so every slide-over lines up): sticky header (eyebrow, title, chips, prev/next, wider, close),
 * scrolling body made of groups, sticky footer with the actions. Modal: focus is trapped, Esc and a click outside
 * close it, focus returns to whatever opened it. Renders into <body>, so it uses the page-level tokens.
 * Do not use for forms longer than one screen or for anything that must stay open while the user works elsewhere
 * (except with `dock`, below).
 * `dock`: inside an AppShell and on screens of 1440px or wider, the panel is NOT modal. It is a right-hand column beside the
 * page (sticky, own scroll, no overlay, no focus trap) so the list stays usable while one item is open. Focus moves to the
 * panel title on open and returns to the opener on close; Esc closes it while focus is inside. It is a non-modal
 * role="dialog" (no aria-modal), so assistive technology announces it on open, which a landmark would not do; a dialog
 * is also what users of the modal version already know. Below 1440px or without a shell it is the modal slide-over.
 *
 * @example
 * <SlideOver open={open} onOpenChange={setOpen} eyebrow="Application" title="Billing portal" footer={<Button onClick={() => setOpen(false)}>Close</Button>}>
 *   <Text>Details of the selected row.</Text>
 * </SlideOver>
 */
export function SlideOver({ open, onOpenChange, eyebrow, title, chips, children, footer, nav, size = "md", dock = false }: {
  open: boolean; onOpenChange: (o: boolean) => void; eyebrow: ReactNode; title: ReactNode; chips?: ReactNode; children: ReactNode; footer?: ReactNode;
  nav?: { index: number; total: number; onPrev: () => void; onNext: () => void }; size?: "md" | "lg";
  /** Dock beside the page instead of opening over it, inside an AppShell on screens of 1440px or wider. */ dock?: boolean;
}) {
  const { t, tn } = useMessages();
  const [wide, setWide] = useState(false);
  const shell = useShell();
  const roomy = useMinWidth(1440);
  const docked = dock && roomy && !!shell?.dockSlot;
  const width = wide || size === "lg" ? 720 : 520;
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const setDocked = shell?.setDocked, dockSlot = shell?.dockSlot;
  const showDocked = docked && open;
  useEffect(() => {
    if (!showDocked) return;
    setDocked?.(true);
    const prev = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    opener.current = prev;
    titleRef.current?.focus({ preventScroll: true });
    return () => {
      setDocked?.(false);
      const back = opener.current; opener.current = null;
      // Return focus to the opener, unless the user already moved it somewhere else on the page.
      const a = document.activeElement;
      if (back?.isConnected && (!a || a === document.body || dockSlot?.contains(a))) back.focus({ preventScroll: true });
    };
  }, [showDocked, setDocked, dockSlot]);
  useEffect(() => { dockSlot?.style.setProperty("--pr-dock-w", wide || size === "lg" ? "600px" : "440px"); }, [dockSlot, wide, size]);

  // Docked, the page behind stays in the accessibility tree: a <header>/<footer> here would count as a second banner/contentinfo landmark, so use plain blocks.
  const Head = docked ? "div" : "header";
  const head = (heading: ReactNode) => (
    <Head className="so__head">
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
      {heading}
      {chips && <div className="so__chips">{chips}</div>}
    </Head>
  );

  if (docked) {
    if (!open || !dockSlot) return null;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape" && !e.defaultPrevented) { e.stopPropagation(); onOpenChange(false); } };
    return createPortal(
      <div className="so" data-docked role="dialog" aria-labelledby={titleId} onKeyDown={onKeyDown}>
        {head(<h2 id={titleId} ref={titleRef} tabIndex={-1} className="so__title">{title}</h2>)}
        <div className="so__body">{children}</div>
        {footer && <div className="so__foot">{footer}</div>}
      </div>,
      dockSlot,
    );
  }
  return (
    <ModalOverlay isOpen={open} onOpenChange={onOpenChange} isDismissable className="so-overlay">
      <Modal className="so-modal" style={{ "--so-w": `${width}px` } as React.CSSProperties}>
        <Dialog className="so">
          {head(<Heading slot="title" className="so__title">{title}</Heading>)}
          <div className="so__body">{children}</div>
          {footer && <footer className="so__foot">{footer}</footer>}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

/** True while the viewport is at least `px` wide. */
function useMinWidth(px: number) {
  const q = `(min-width: ${px}px)`;
  const [on, setOn] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => { const m = window.matchMedia(q); const f = () => setOn(m.matches); f(); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, [q]);
  return on;
}

/** Titled group inside a slide-over body. */
export function SlideGroup({ title, children }: { title: string; children: ReactNode }) {
  return (<section className="so__group"><Eyebrow>{title}</Eyebrow>{children}</section>);
}

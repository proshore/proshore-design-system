import { useEffect, useState, type RefObject } from "react";

/** When a top bar slides out of view: "scroll" on every width, "phone" only on phones (up to 720px), "off" never. */
export type AutoHide = "scroll" | "phone" | "off";

const AFTER = 64; // the page must be scrolled this far before the bar may hide
const STEP = 8;   // the scroll distance in one direction that counts as a decision (avoids jitter)

/**
 * Hides a sticky bar while the user scrolls down and shows it again on scrolling up.
 * Returns true while hidden. The bar stays in the DOM (only transformed), so screen readers and keyboard users still reach it:
 * focus entering it shows it. It never hides while a menu opened from it is open, while keyboard focus is inside it,
 * or when the page barely scrolls.
 */
export function useAutoHide(ref: RefObject<HTMLElement | null>, mode: AutoHide): boolean {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || mode === "off") { setHidden(false); return; }
    const phone = window.matchMedia("(max-width: 720px)");
    const active = () => mode === "scroll" || phone.matches;
    let last = window.scrollY, acc = 0, raf = 0;
    const show = () => { acc = 0; setHidden(false); };
    const pinned = () => !!el.querySelector('[aria-expanded="true"]') || !!el.querySelector(":focus-visible");
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY, dy = y - last; last = y;
        if (!active()) { setHidden(false); return; }
        if (y <= 0) { show(); return; }
        if (dy === 0) return;
        if ((dy > 0) !== (acc > 0)) acc = 0;
        acc += dy;
        if (acc <= -STEP) { show(); return; }
        const scrollable = document.documentElement.scrollHeight - window.innerHeight > AFTER;
        if (acc >= STEP && y > AFTER && scrollable && !pinned()) setHidden(true);
      });
    };
    const onFocusIn = () => show();
    const onMq = () => { if (!active()) show(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("focusin", onFocusIn);
    phone.addEventListener("change", onMq);
    return () => { window.removeEventListener("scroll", onScroll); el.removeEventListener("focusin", onFocusIn); phone.removeEventListener("change", onMq); cancelAnimationFrame(raf); };
  }, [ref, mode]);
  return hidden;
}

import { useEffect, useRef, useState } from "react";

/**
 * CountUp: a number that eases up to its value once when it appears (about 700 ms). Screen readers get the final value
 * only, never the counting. With reduced motion the final value shows immediately.
 */
export function CountUp({ value, prefix = "", duration = 700 }: { value: number; prefix?: string; duration?: number }) {
  const [n, setN] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || done.current) { setN(value); return; }
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / duration); setN(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); else done.current = true; };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return (<><span aria-hidden style={{ fontVariantNumeric: "tabular-nums" }}>{prefix}{n}</span><span className="pr-sr">{prefix}{value}</span></>);
}

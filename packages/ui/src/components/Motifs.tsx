/**
 * Theme motifs: mountaineering and Nepal, drawn as thin single-colour lines that inherit `currentColor`.
 * Decorative only (aria-hidden). Keep them rare: a ridgeline in page headers, prayer flags in empty states.
 */

/** Two ridge lines with a snow-capped peak. Sits quietly at the edge of a page header. */
export function Ridgeline({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 520 120" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" preserveAspectRatio="xMaxYMax meet">
      <path d="M0 100 L60 72 L95 86 L160 28 L205 62 L250 44 L310 88 L360 58 L420 96 L470 74 L520 92" vectorEffect="non-scaling-stroke" />
      <path d="M0 113 L80 94 L130 105 L210 78 L280 109 L360 91 L440 111 L520 99" vectorEffect="non-scaling-stroke" opacity=".6" />
      <path d="M147 45 L155 38 L160 44 L166 36 L173 46" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** A string of prayer flags (lung ta) hanging in a shallow curve. Monochrome on purpose. */
export function PrayerFlags({ className, flags = 7, width = 200 }: { className?: string; flags?: number; width?: number }) {
  const W = 240, H = 44;
  const y = (t: number) => (1 - t) * (1 - t) * 6 + 2 * (1 - t) * t * 30 + t * t * 6;
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} width={width} height={(width * H) / W} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={`M2 6 Q${W / 2} 54 ${W - 2} 6`} vectorEffect="non-scaling-stroke" />
      {Array.from({ length: flags }, (_, i) => {
        const t = (i + 1) / (flags + 1); const x = 2 + t * (W - 4); const yy = y(t);
        return <path key={i} d={`M${x - 6} ${yy + 0.6} h12 v11 h-12 z`} vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}

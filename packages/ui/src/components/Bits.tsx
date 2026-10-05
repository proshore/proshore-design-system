import type { ReactNode } from "react";

/** Mono uppercase label, as on proshore.eu. `chip` = filled tag. */
export function Eyebrow({ children, chip = false }: { children: ReactNode; chip?: boolean }) {
  return <span className={chip ? "sherpa-eyebrow sherpa-eyebrow--chip" : "sherpa-eyebrow"}>{children}</span>;
}

/** Hand-drawn accent underline: Proshore's "a person looked at this" mark. One per view, decorative. */
export function HandMark({ children }: { children: ReactNode }) {
  return (
    <span className="sherpa-mark">
      {children}
      <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M3 8 C 40 2, 80 11, 120 5 S 180 4, 197 7" />
      </svg>
    </span>
  );
}

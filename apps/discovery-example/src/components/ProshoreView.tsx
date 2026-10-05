import { Eyebrow } from "@proshore/ui";
import type { ReactNode } from "react";

/** Proshore's reviewed statement as a periwinkle band with the orange bar: the one place advice is set apart from evidence. */
export function ProshoreView({ label = "Proshore's view", statement, meta, action }: { label?: string; statement: ReactNode; meta?: ReactNode; action?: ReactNode }) {
  return (
    <div className="pr-band">
      <div className="pr-band__bar" aria-hidden />
      <div>
        <Eyebrow>{label}</Eyebrow>
        <p className="pr-band__q">{statement}</p>
        {meta && <div className="pr-band__meta">{meta}</div>}
      </div>
      {action}
    </div>
  );
}

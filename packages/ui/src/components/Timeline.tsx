import type { ReactNode } from "react";

export type TimelineEntry = { id: string; when: string; actor: string; text: ReactNode; kind?: "observed" | "review" | "system" };

/** Vertical history: who did what, when. Use for review history and scan history, newest first. Not for process steps. */
export function Timeline({ entries, label = "History" }: { entries: TimelineEntry[]; label?: string }) {
  return (
    <ol className="timeline" aria-label={label}>
      {entries.map((e) => (
        <li key={e.id} className="timeline__item" data-kind={e.kind ?? "system"}>
          <span className="timeline__dot" aria-hidden />
          <div className="timeline__body">
            <span className="timeline__meta"><span className="sherpa-eyebrow">{e.when}</span> · {e.actor}</span>
            <span>{e.text}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

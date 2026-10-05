import type { ReactNode } from "react";
import { useMessages } from "../i18n/I18nProvider";

export type TimelineEntry = { id: string; when: string; actor: string; text: ReactNode; kind?: "observed" | "review" | "system" };

/** Vertical history: who did what, when. Use for review history and scan history, newest first. Not for process steps. */
export function Timeline({ entries, label }: { entries: TimelineEntry[]; label?: string }) {
  const { t } = useMessages();
  return (
    <ol className="timeline" aria-label={label ?? t("timeline.label")}>
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

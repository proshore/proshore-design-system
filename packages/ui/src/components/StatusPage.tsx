import type { ReactNode } from "react";
import { PrayerFlags, Ridgeline } from "./Motifs";
import { useMessages } from "../i18n/I18nProvider";
import type { MessageKey } from "../i18n/translate";

export type StatusKind = "forbidden" | "not-found" | "error" | "session-expired" | "offline";

const copy: Record<StatusKind, { code: string; title: MessageKey; text: MessageKey }> = {
  forbidden: { code: "403", title: "status.forbiddenTitle", text: "status.forbiddenText" },
  "not-found": { code: "404", title: "status.notFoundTitle", text: "status.notFoundText" },
  error: { code: "500", title: "status.errorTitle", text: "status.errorText" },
  "session-expired": { code: "401", title: "status.sessionExpiredTitle", text: "status.sessionExpiredText" },
  offline: { code: "", title: "status.offlineTitle", text: "status.offlineText" },
};

/**
 * StatusPage: a whole-page message when something stops the person: no access (403), not found (404), server error (500),
 * session expired (401), offline. Plain language first: say what happened, whether it is the person's doing, and what to do next.
 * Use inside the page area of the shell (it renders a section, the page's h1). `actions` holds the one or two ways out
 * (go back, sign in again, try again); `reference` is a support code to quote, if the app has one.
 *
 * @example
 * <StatusPage kind="not-found" actions={<Button href="#/">Back to start</Button>} />
 */
export function StatusPage({ kind, title, description, actions, reference }: {
  kind: StatusKind; title?: string; description?: ReactNode; actions?: ReactNode; reference?: string;
}) {
  const { t } = useMessages();
  const c = copy[kind];
  return (
    <section className="pr-status" aria-labelledby="pr-status-title" data-kind={kind}>
      <Ridgeline className="pr-status__ridge" />
      <div className="pr-status__in">
        {c.code && <p className="pr-status__code" aria-hidden>{c.code}</p>}
        <PrayerFlags className="pr-status__flags" width={140} />
        <h1 id="pr-status-title" className="pr-status__title">{title ?? t(c.title)}</h1>
        <p className="pr-status__text">{description ?? t(c.text)}</p>
        {actions && <div className="pr-status__actions">{actions}</div>}
        {reference && <p className="pr-status__ref">{t("status.reference")} <code>{reference}</code></p>}
      </div>
    </section>
  );
}

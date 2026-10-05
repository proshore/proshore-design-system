import type { ReactNode } from "react";
import { PrayerFlags, Ridgeline } from "./Motifs";

export type StatusKind = "forbidden" | "not-found" | "error" | "session-expired" | "offline";

const copy: Record<StatusKind, { code: string; title: string; text: string }> = {
  forbidden: { code: "403", title: "You do not have access to this page", text: "Your sign-in works, but this page is not part of the access you were given. Ask the person who manages access for this app." },
  "not-found": { code: "404", title: "This page does not exist", text: "The link may be old or mistyped. Check the address, or go back to where you came from." },
  error: { code: "500", title: "Something went wrong on our side", text: "It is not you. Try again in a moment. If it keeps happening, tell the team and mention what you were doing." },
  "session-expired": { code: "401", title: "You have been signed out", text: "For your security you are signed out after a period of inactivity. Sign in again to continue where you were." },
  offline: { code: "", title: "You are offline", text: "The page cannot reach the server. Check your connection; your changes are kept until it is back." },
};

/**
 * StatusPage: a whole-page message when something stops the person: no access (403), not found (404), server error (500),
 * session expired (401), offline. Plain language first: say what happened, whether it is the person's doing, and what to do next.
 * Use inside the page area of the shell (it renders a section, the page's h1). `actions` holds the one or two ways out
 * (go back, sign in again, try again); `reference` is a support code to quote, if the app has one.
 */
export function StatusPage({ kind, title, description, actions, reference }: {
  kind: StatusKind; title?: string; description?: ReactNode; actions?: ReactNode; reference?: string;
}) {
  const c = copy[kind];
  return (
    <section className="pr-status" aria-labelledby="pr-status-title" data-kind={kind}>
      <Ridgeline className="pr-status__ridge" />
      <div className="pr-status__in">
        {c.code && <p className="pr-status__code" aria-hidden>{c.code}</p>}
        <PrayerFlags className="pr-status__flags" width={140} />
        <h1 id="pr-status-title" className="pr-status__title">{title ?? c.title}</h1>
        <p className="pr-status__text">{description ?? c.text}</p>
        {actions && <div className="pr-status__actions">{actions}</div>}
        {reference && <p className="pr-status__ref">Reference: <code>{reference}</code></p>}
      </div>
    </section>
  );
}

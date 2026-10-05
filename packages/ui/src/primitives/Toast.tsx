import { Cross2Icon } from "../icons";
import { Button, Text, UNSTABLE_Toast as Toast, UNSTABLE_ToastContent as ToastContent, UNSTABLE_ToastQueue as ToastQueue, UNSTABLE_ToastRegion as ToastRegion } from "react-aria-components";

type ToastContentData = { message: string; tone: "info" | "success" | "warning" | "danger" };
const queue = new ToastQueue<ToastContentData>({ maxVisibleToasts: 3 });

/**
 * toast.show("Saved"): a message for something that just happened and then goes away (5 s by default, dismissible,
 * announced to screen readers). Use Note for messages that must stay on the page. React Aria's Toast is still marked
 * UNSTABLE, so ALL use goes through this file: if the API changes, only this file changes.
 */
export const toast = {
  show(message: string, opts: { tone?: ToastContentData["tone"]; timeout?: number } = {}) {
    queue.add({ message, tone: opts.tone ?? "info" }, { timeout: opts.timeout ?? 5000 });
  },
};

/** Render once at the app root. */
export function ToastHost() {
  return (
    <ToastRegion queue={queue} className="pr-toasts" aria-label="Notifications">
      {({ toast: t }) => (
        <Toast toast={t} className="pr-toast" data-tone={t.content.tone}>
          <ToastContent><Text slot="title" className="pr-toast__text">{t.content.message}</Text></ToastContent>
          <Button slot="close" className="pr-toast__x" aria-label="Dismiss notification"><Cross2Icon aria-hidden /></Button>
        </Toast>
      )}
    </ToastRegion>
  );
}

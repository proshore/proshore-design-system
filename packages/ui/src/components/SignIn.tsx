import type { ReactNode } from "react";
import { Button } from "react-aria-components";
import { ProshoreIcon, ProshoreWordmark } from "./Brand";
import { Ridgeline } from "./Motifs";
import { Note } from "./Note";
import "./signin.css";

/** Google's four-colour "G". Brand mark: do not recolour or redraw (Google Identity branding guidelines). */
export function GoogleMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/**
 * The "Sign in with Google" button. Follows Google's button guidelines (neutral light and dark variants, the G mark, the label
 * "Sign in with Google"), so its colours are intentionally not Proshore tokens. `busy` shows the redirecting state and blocks repeat clicks.
 */
export function GoogleSignInButton({ onPress, busy = false, label = "Sign in with Google" }: { onPress?: () => void; busy?: boolean; label?: string }) {
  return (
    <Button className="pr-gbtn" onPress={onPress} isDisabled={busy} aria-busy={busy || undefined}>
      <GoogleMark />
      <span>{busy ? "Redirecting to Google…" : label}</span>
    </Button>
  );
}

/**
 * SignInScreen: the one sign-in page for every Proshore application, for Proshore staff with a Google Workspace account.
 * UI only: the application provides `onSignIn` (start the Google flow) and decides who may enter. Google proves who someone is;
 * it does not say what they may see: customer access and roles are separate, per project.
 * Renders <main> with the page's h1. Use `notice` for "You have been signed out." and similar short messages.
 *
 * @example
 * <SignInScreen product="Design system" onSignIn={() => (location.href = "/auth/login")} />
 */
export function SignInScreen({ product, productMark, onSignIn, busy = false, domain = "proshore.nl", notice, footer }: {
  /** Product name, for example "Sherpa Discovery". */ product: string;
  /** Optional product icon shown above the title. */ productMark?: ReactNode;
  onSignIn: () => void; busy?: boolean;
  /** Allowed email domain, shown to the user. */ domain?: string;
  /** Short message shown above the button, for example that the user was signed out. */ notice?: ReactNode;
  /** Small print slot: help link, privacy. */ footer?: ReactNode;
}) {
  return (
    <main className="pr-signin" id="main" tabIndex={-1}>
      <Ridgeline className="pr-signin__ridge" />
      <section className="pr-signin__card" aria-labelledby="signin-title">
        <div className="pr-signin__brand"><ProshoreIcon height={48} /></div>
        {productMark && <div className="pr-signin__mark">{productMark}</div>}
        <h1 id="signin-title" className="pr-signin__title">Sign in to {product}</h1>
        <p className="pr-signin__lead">Use your Proshore Google Workspace account.</p>
        {notice && <Note tone="info" live>{notice}</Note>}
        <GoogleSignInButton onPress={onSignIn} busy={busy} />
        <p className="pr-signin__fine">Only <strong>@{domain}</strong> accounts can sign in here. Signing in shows who you are; what you can open depends on the access you were given.</p>
        {footer && <div className="pr-signin__footer">{footer}</div>}
        <div className="pr-signin__word"><ProshoreWordmark height={14} /></div>
      </section>
    </main>
  );
}

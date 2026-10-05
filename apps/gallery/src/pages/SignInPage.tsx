import { useState } from "react";
import { SignInScreen } from "@proshore/ui";

/** Demo only: a real app redirects to Google (OpenID Connect) and checks the account's domain on the server. */
export function SignInPage({ onSignIn, notice }: { onSignIn: () => void; notice?: string }) {
  const [busy, setBusy] = useState(false);
  return <SignInScreen product="Design system" notice={notice} busy={busy} onSignIn={() => { setBusy(true); setTimeout(() => { setBusy(false); onSignIn(); }, 900); }} />;
}

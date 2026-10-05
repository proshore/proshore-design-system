# Google Workspace sign-in for Proshore apps

Status: **server library built (`packages/auth`, `@proshore/auth`) and verified against real Google on localhost (5 Oct 2026)**; staging and production hosts are not verified yet. One Google Cloud project for all apps, one OAuth client per app (Jeroen, decision 83). The design system ships the screens (`SignInScreen`, the account menu with "Switch account" and "Sign out", `StatusPage kind="session-expired"` and `kind="forbidden"`). Each app implements the actual login. This page says what that takes, so it is the same everywhere.

## What sign-in does and does not do
Signing in proves who someone is (a Proshore Google Workspace account). It does **not** say what they may see: customer access and roles are separate, per app and per engagement, and are checked on the server. Hiding a page in the browser is not access control.

## One-time setup (a person with Google Workspace admin rights)
1. In Google Cloud, create a project (for example "Proshore apps").
2. OAuth consent screen: user type **Internal**. This limits sign-in to accounts in the proshore.nl Workspace, which is the strongest domain check Google offers.
3. Create an OAuth client ID (type Web application) per app, with its redirect URIs: production, staging and `http://localhost:<port>/auth/callback` for development.
4. Put the client ID and client secret in the app's secret store or environment (never in the repository, the front end or a fixture).

## How each app does it (server side)
- Authorization code flow with PKCE, started and finished on the server (a small back-end for the front end). The browser never sees the client secret or a long-lived token.
- Request scopes `openid email profile`. Send `hd=proshore.nl` as a hint, and `prompt=select_account` for "Switch account".
- On the callback, verify the ID token on the server: signature, issuer, audience, expiry, `email_verified`, and that the `hd` claim equals `proshore.nl`. The `hd` request parameter alone is only a hint.
- Create a session in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie. Do not keep tokens in localStorage.
- Authorization (roles, customers, engagements) is decided per request from the app's own data.
- Sign out ends the app session (and the app may also link to Google's account page). An expired session shows `StatusPage kind="session-expired"`; a missing permission shows `kind="forbidden"`.

## Screens and states to cover per app
Signed out (built), redirecting (built: busy), signed out by the user or by expiry (built: notice), wrong domain or not allowed (not built: show `forbidden` with the address that was used), Google or network error (not built).

## What the design system could add next
A small, framework-neutral `AuthGate` and session types, once one real app has done this and we know what really repeats. Not before.

## Decisions needed from Jeroen
Who has Workspace admin rights to create the Cloud project; one Cloud project for all apps or one per app; whether contractors with other domains ever need access (then Internal is not enough).

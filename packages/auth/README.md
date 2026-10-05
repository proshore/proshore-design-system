# @proshore/auth

Server-side "Sign in with Google Workspace, Proshore staff only" for Proshore's internal apps. Small, framework-neutral, one dependency (`jose`). It works on standard Web `Request` and `Response`, so it mounts in Node `http`, Express (via an adapter), Next route handlers, Hono and similar.

Status: **0.1.0. Tested against a local fake Google (automated, no network) and verified against real Google on localhost on 5 Oct 2026**, with a Proshore Workspace OAuth client (consent screen type Internal): sign-in with a proshore.nl account, rejection of a non-proshore.nl account, switch account, the session and logout, and a returning session. **Not yet verified:** staging and production hosts. Do a first real sign-in on each new host (it needs its own redirect URI) before trusting it there.

## What it does
- `login(req)`: 302 to Google, authorization code flow with PKCE (S256), `state`, `nonce`, scope `openid email profile`, `hd=proshore.nl` hint. `?switch=1` adds `prompt=select_account`. Optional `?returnTo=/path`. Transient state lives in a 10 minute, signed, `HttpOnly` cookie.
- `callback(req)`: checks `state`, exchanges the code on the server (PKCE verifier + client secret), verifies the ID token with Google's JWKS (signature, issuer, audience, expiry, nonce), requires `email_verified === true`, the `hd` **claim** equal to the allowed domain **and** the email ending in `@proshore.nl`, then sets the session cookie and redirects to `returnTo`. Otherwise `403` with JSON `{ "error": "access_denied", "code": "wrong_domain" | "email_not_verified" | "invalid_state" | "token_invalid" | "exchange_failed" }`. Nothing else is revealed. Show `StatusPage kind="forbidden"` from the `code`.
- `logout(req)`: `POST` only (`405` otherwise) and same-origin only (`Sec-Fetch-Site` / `Origin`, else `403`). Clears the session cookie, `204`.
- `getSession(req)`: `Session | null` (signature and expiry checked). `requireSession(req)`: the session or a `401` `Response` (`if (r instanceof Response) return r`). `me(req)`: the session as JSON or `401`.
- Session: signed HS256 JWT in a cookie (`HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`; name `__Host-proshore_session` when secure) with `sub, email, name, picture, iat, exp`. Default 8 hours, no sliding renewal.
- `returnTo` is open-redirect safe: only a relative path starting with a single `/` (not `//`, not `/\`) is kept; anything else becomes `/`.

## What it does NOT do
- **Authorization.** Signing in proves a Proshore Google account. Roles, customers and engagements are per app and must be checked on the server on every request. Hiding something in the browser is not access control.
- It does not store Google access or refresh tokens (they are discarded), call Google APIs, or keep server-side sessions. Consequence: a session cannot be revoked before it expires, other than by rotating `SESSION_SECRET` (signs everyone out). Keep the lifetime short, or add a per-app deny list checked in `requireSession`.
- No CSRF protection beyond logout. Your own state-changing endpoints should check `Origin` / `Sec-Fetch-Site` too (the cookie is `SameSite=Lax`, which blocks cross-site POSTs, but do not rely on one layer).
- Contractors with other domains: not supported (`allowedDomain` is a single domain).

## Environment variables
| Variable | Meaning |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth client ID (per app) |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret. Server only. Never in the repo, front end or a fixture. |
| `SESSION_SECRET` | At least 32 bytes of randomness, e.g. `openssl rand -base64 48`. Different per app and environment. |
| `BASE_URL` | Public origin of the app, e.g. `https://app.proshore.nl` or `http://localhost:3000` (used by the example; `redirectUri` is `BASE_URL/auth/callback`) |

## One-time Google Cloud setup (needs a Workspace admin)
1. Google Cloud console: create a project (e.g. "Proshore apps").
2. APIs and Services, OAuth consent screen: user type **Internal** (limits sign-in to the proshore.nl Workspace; the strongest domain check Google offers).
3. Credentials, Create OAuth client ID, type **Web application**, one per app. Authorized redirect URIs: `https://<prod host>/auth/callback`, `https://<staging host>/auth/callback`, and `http://localhost:<PORT>/auth/callback` for development.
4. Put the client ID and secret in the app's secret store or environment.

## Mounting
```ts
import { createAuth } from "@proshore/auth";

const auth = createAuth({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  sessionSecret: process.env.SESSION_SECRET!,
  redirectUri: `${process.env.BASE_URL}/auth/callback`,
  // allowedDomain: "proshore.nl" (default), secureCookies: true (default; false only for http://localhost),
  // sessionMaxAgeSeconds: 28800 (default), cookieName
});

// GET /auth/login -> auth.login(req)    GET /auth/callback -> auth.callback(req)
// POST /auth/logout -> auth.logout(req) GET /api/me        -> auth.me(req)
// In any protected handler:
const s = await auth.requireSession(req);
if (s instanceof Response) return s;
```
In Next, export the handlers from route files (`export const GET = auth.login`). Behind a proxy, make sure `req.url` carries the public origin. A runnable Node example: `examples/node-server.mjs` (`node examples/node-server.mjs`, Node 22.18 or newer; set the four env variables).

## Front end
The front end holds no tokens. `SignInScreen`'s button is a normal navigation to `/auth/login` (optionally `?returnTo=<current path>`); "Switch account" goes to `/auth/login?switch=1`; "Sign out" does `fetch("/auth/logout", { method: "POST" })` and then shows the signed-out state. Ask `GET /api/me` for the current user: `401` means signed out or expired (`StatusPage kind="session-expired"`). A `403` from the callback carries a `code` for `StatusPage kind="forbidden"`.

## Development
`npm test -w @proshore/auth` (node:test, no network: a fake Google with a generated RSA key, injected `jwks` and `fetch`), `npm run typecheck -w @proshore/auth`, `npm run build -w @proshore/auth` (emits `dist/`, run automatically on pack). Tests and the example run straight from TypeScript source via Node's type stripping.

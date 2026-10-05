import { SignJWT, jwtVerify, createRemoteJWKSet } from "jose";
import type { JWTPayload, JWTVerifyGetKey } from "jose";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { safeReturnTo } from "./redirect.ts";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const TX_MAX_AGE_SECONDS = 600;
const SESSION_ALG = "HS256";

export type RejectionCode =
  | "wrong_domain" | "email_not_verified" | "invalid_state" | "token_invalid" | "exchange_failed";

export interface Session {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  iat: number;
  exp: number;
}

export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  /** Absolute URL of the callback handler, e.g. https://app.proshore.nl/auth/callback */
  redirectUri: string;
  /** Default "proshore.nl". */
  allowedDomain?: string;
  /** At least 32 bytes of randomness. */
  sessionSecret: string;
  cookieName?: string;
  /** Default true. false only for http://localhost development. */
  secureCookies?: boolean;
  /** Default 8 hours. */
  sessionMaxAgeSeconds?: number;
  /** Injectable for tests. Used only for the token endpoint. */
  fetch?: typeof fetch;
  /** Injectable for tests. Default: Google's remote JWKS. */
  jwks?: JWTVerifyGetKey;
  /** Injectable clock for tests. */
  now?: () => Date;
}

export interface Auth {
  login(req: Request): Promise<Response>;
  callback(req: Request): Promise<Response>;
  logout(req: Request): Promise<Response>;
  getSession(req: Request): Promise<Session | null>;
  /** The session, or a 401 Response to return as is. */
  requireSession(req: Request): Promise<Session | Response>;
  me(req: Request): Promise<Response>;
}

const enc = new TextEncoder();
const b64url = (b: Buffer) => b.toString("base64url");
const sha256 = (s: string | Buffer) => createHash("sha256").update(s).digest();

function json(status: number, body: unknown, extra?: HeadersInit): Response {
  const headers = new Headers(extra);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(body), { status, headers });
}

function parseCookies(header: string | null): Map<string, string> {
  const out = new Map<string, string>();
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (k && !out.has(k)) out.set(k, part.slice(i + 1).trim());
  }
  return out;
}

function safeEqual(a: string, b: string): boolean {
  const ab = sha256(a), bb = sha256(b);
  return timingSafeEqual(ab, bb);
}

export function createAuth(config: AuthConfig): Auth {
  const clientId = config.clientId;
  const clientSecret = config.clientSecret;
  const allowedDomain = (config.allowedDomain ?? "proshore.nl").toLowerCase();
  const secure = config.secureCookies ?? true;
  const maxAge = config.sessionMaxAgeSeconds ?? 8 * 60 * 60;
  const doFetch = config.fetch ?? fetch;
  const now = config.now ?? (() => new Date());

  if (!clientId || typeof clientId !== "string") throw new Error("auth: clientId is required");
  if (!clientSecret || typeof clientSecret !== "string") throw new Error("auth: clientSecret is required");
  if (typeof config.sessionSecret !== "string" || enc.encode(config.sessionSecret).length < 32)
    throw new Error("auth: sessionSecret must be at least 32 bytes");
  if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/.test(allowedDomain))
    throw new Error("auth: allowedDomain must be a bare domain such as proshore.nl");
  if (!Number.isInteger(maxAge) || maxAge <= 0) throw new Error("auth: sessionMaxAgeSeconds must be a positive integer");
  let redirect: URL;
  try { redirect = new URL(config.redirectUri); } catch { throw new Error("auth: redirectUri must be an absolute URL"); }
  const isLocal = redirect.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(redirect.hostname);
  if (secure && redirect.protocol !== "https:" && !isLocal)
    throw new Error("auth: redirectUri must be https (http only for localhost)");
  if (!secure && !isLocal)
    throw new Error("auth: secureCookies=false is only allowed with an http://localhost redirectUri");
  const appOrigin = redirect.origin;

  // Separate keys per purpose, so a transient-state token can never act as a session.
  const sessionKey = sha256(Buffer.concat([Buffer.from("proshore-auth/session\0"), Buffer.from(config.sessionSecret)]));
  const txKey = sha256(Buffer.concat([Buffer.from("proshore-auth/tx\0"), Buffer.from(config.sessionSecret)]));

  const prefix = secure ? "__Host-" : "";
  const sessionCookie = config.cookieName ?? `${prefix}proshore_session`;
  const txCookie = `${sessionCookie}_tx`;

  const jwks: JWTVerifyGetKey = config.jwks ?? createRemoteJWKSet(new URL(JWKS_URI));

  function setCookie(name: string, value: string, seconds: number): string {
    return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${secure ? "; Secure" : ""}`;
  }
  const clearCookie = (name: string) => setCookie(name, "", 0);
  const nowSec = () => Math.floor(now().getTime() / 1000);

  function reject(code: RejectionCode, status = 403): Response {
    const h = new Headers();
    h.append("set-cookie", clearCookie(txCookie));
    return json(status, { error: "access_denied", code }, h);
  }

  async function login(req: Request): Promise<Response> {
    if (req.method !== "GET" && req.method !== "HEAD") return json(405, { error: "method_not_allowed" }, { allow: "GET, HEAD" });
    const url = new URL(req.url);
    const state = b64url(randomBytes(32));
    const nonce = b64url(randomBytes(32));
    const verifier = b64url(randomBytes(48));
    const challenge = b64url(sha256(verifier));
    const returnTo = safeReturnTo(url.searchParams.get("returnTo"));

    const tx = await new SignJWT({ use: "tx", state, nonce, verifier, returnTo })
      .setProtectedHeader({ alg: SESSION_ALG })
      .setIssuedAt(nowSec())
      .setExpirationTime(nowSec() + TX_MAX_AGE_SECONDS)
      .sign(txKey);

    const p = new URLSearchParams({
      client_id: clientId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state, nonce,
      code_challenge: challenge,
      code_challenge_method: "S256",
      hd: allowedDomain,
    });
    if (url.searchParams.get("switch") === "1") p.set("prompt", "select_account");

    const h = new Headers({ location: `${AUTH_ENDPOINT}?${p}`, "cache-control": "no-store" });
    h.append("set-cookie", setCookie(txCookie, tx, TX_MAX_AGE_SECONDS));
    return new Response(null, { status: 302, headers: h });
  }

  async function callback(req: Request): Promise<Response> {
    if (req.method !== "GET") return json(405, { error: "method_not_allowed" }, { allow: "GET" });
    const url = new URL(req.url);
    const cookies = parseCookies(req.headers.get("cookie"));

    // 1. Transient state: signed, unexpired, and matching the state in the URL.
    const txToken = cookies.get(txCookie);
    const stateParam = url.searchParams.get("state");
    if (!txToken || !stateParam) return reject("invalid_state");
    let tx: JWTPayload;
    try {
      tx = (await jwtVerify(txToken, txKey, { algorithms: [SESSION_ALG], currentDate: now() })).payload;
    } catch { return reject("invalid_state"); }
    if (tx.use !== "tx" || typeof tx.state !== "string" || typeof tx.nonce !== "string" ||
        typeof tx.verifier !== "string" || !safeEqual(tx.state, stateParam)) return reject("invalid_state");

    const code = url.searchParams.get("code");
    if (url.searchParams.get("error") || !code) return reject("exchange_failed");

    // 2. Code exchange (server to server, with the PKCE verifier and the client secret).
    let idToken: string;
    try {
      const res = await doFetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code, client_id: clientId, client_secret: clientSecret,
          redirect_uri: config.redirectUri, code_verifier: tx.verifier,
        }).toString(),
      });
      if (!res.ok) return reject("exchange_failed");
      const body = (await res.json()) as { id_token?: unknown };
      if (typeof body.id_token !== "string") return reject("exchange_failed");
      idToken = body.id_token;
    } catch { return reject("exchange_failed"); }
    // Google access/refresh tokens in the response are deliberately ignored and never stored.

    // 3. Verify the ID token: signature, issuer, audience, expiry, nonce.
    let claims: JWTPayload;
    try {
      claims = (await jwtVerify(idToken, jwks, {
        issuer: ISSUERS, audience: clientId, algorithms: ["RS256"], currentDate: now(),
      })).payload;
    } catch { return reject("token_invalid"); }
    if (typeof claims.nonce !== "string" || !safeEqual(claims.nonce, tx.nonce) ||
        typeof claims.sub !== "string" || !claims.sub) return reject("token_invalid");

    // 4. Who is this? Strict checks; the `hd` request parameter was only a hint.
    if (claims.email_verified !== true) return reject("email_not_verified");
    const email = typeof claims.email === "string" ? claims.email.toLowerCase() : "";
    const at = email.lastIndexOf("@");
    const domainOk = at > 0 && email.indexOf("@") === at && email.slice(at + 1) === allowedDomain;
    if (claims.hd !== allowedDomain || !domainOk) return reject("wrong_domain");

    const iat = nowSec();
    const session: Session = {
      sub: claims.sub, email,
      name: typeof claims.name === "string" && claims.name ? claims.name : email,
      iat, exp: iat + maxAge,
    };
    if (typeof claims.picture === "string" && claims.picture.startsWith("https://")) session.picture = claims.picture;

    const jwt = await new SignJWT({ use: "session", email: session.email, name: session.name, ...(session.picture ? { picture: session.picture } : {}) })
      .setProtectedHeader({ alg: SESSION_ALG })
      .setSubject(session.sub)
      .setIssuedAt(session.iat)
      .setExpirationTime(session.exp)
      .sign(sessionKey);

    const h = new Headers({ location: safeReturnTo(typeof tx.returnTo === "string" ? tx.returnTo : "/"), "cache-control": "no-store" });
    h.append("set-cookie", clearCookie(txCookie));
    h.append("set-cookie", setCookie(sessionCookie, jwt, maxAge));
    return new Response(null, { status: 302, headers: h });
  }

  async function getSession(req: Request): Promise<Session | null> {
    const token = parseCookies(req.headers.get("cookie")).get(sessionCookie);
    if (!token) return null;
    try {
      const { payload: p } = await jwtVerify(token, sessionKey, { algorithms: [SESSION_ALG], currentDate: now() });
      if (p.use !== "session" || typeof p.sub !== "string" || typeof p.email !== "string" ||
          typeof p.iat !== "number" || typeof p.exp !== "number") return null;
      if (!p.email.endsWith(`@${allowedDomain}`)) return null;
      return {
        sub: p.sub, email: p.email, name: typeof p.name === "string" ? p.name : p.email,
        ...(typeof p.picture === "string" ? { picture: p.picture } : {}), iat: p.iat, exp: p.exp,
      };
    } catch { return null; }
  }

  const unauthorized = () => json(401, { error: "unauthenticated" });

  async function requireSession(req: Request): Promise<Session | Response> {
    return (await getSession(req)) ?? unauthorized();
  }

  async function me(req: Request): Promise<Response> {
    const s = await getSession(req);
    return s ? json(200, s) : unauthorized();
  }

  function sameOrigin(req: Request): boolean {
    const site = req.headers.get("sec-fetch-site");
    const origin = req.headers.get("origin");
    if (site === null && origin === null) return false;
    if (site !== null && site !== "same-origin") return false;
    if (origin !== null && origin !== appOrigin) return false;
    return true;
  }

  async function logout(req: Request): Promise<Response> {
    if (req.method !== "POST") return json(405, { error: "method_not_allowed" }, { allow: "POST" });
    if (!sameOrigin(req)) return json(403, { error: "forbidden", code: "cross_origin" });
    const h = new Headers({ "cache-control": "no-store" });
    h.append("set-cookie", clearCookie(sessionCookie));
    return new Response(null, { status: 204, headers: h });
  }

  return { login, callback, logout, getSession, requireSession, me };
}

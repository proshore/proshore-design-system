import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { generateKeyPair, exportJWK, SignJWT, createLocalJWKSet } from "jose";
import { createAuth, safeReturnTo } from "../src/index.ts";

const CLIENT_ID = "client-123.apps.googleusercontent.com";
const SECRET = "s".repeat(40);
const REDIRECT = "https://app.proshore.nl/auth/callback";
const ORIGIN = "https://app.proshore.nl";
const { publicKey, privateKey } = await generateKeyPair("RS256");
const jwk = { ...(await exportJWK(publicKey)), kid: "k1", alg: "RS256", use: "sig" };
const otherKey = await generateKeyPair("RS256");

interface Overrides { claims?: Record<string, unknown>; nonce?: string; exp?: number; key?: CryptoKey; tokenStatus?: number }
type Fetched = { body: URLSearchParams; url: string }

function setup(opts: { now?: () => Date; sessionMaxAgeSeconds?: number } = {}) {
  const seen: Fetched[] = [];
  let challenge = "";
  let overrides: Overrides = {};
  const fakeFetch = (async (url: string, init: RequestInit) => {
    const body = new URLSearchParams(init.body as string);
    seen.push({ body, url: String(url) });
    if (overrides.tokenStatus) return new Response("{}", { status: overrides.tokenStatus });
    const verifierChallenge = createHash("sha256").update(body.get("code_verifier") ?? "").digest("base64url");
    if (verifierChallenge !== challenge || body.get("client_secret") !== "cs") return new Response("{}", { status: 400 });
    const t = Math.floor(Date.now() / 1000);
    const claims = {
      email: "jane@proshore.nl", email_verified: true, hd: "proshore.nl", name: "Jane Doe",
      picture: "https://lh3.googleusercontent.com/a/x", nonce: overrides.nonce ?? nonceSeen,
      ...overrides.claims,
    };
    let jwt = new SignJWT(claims as Record<string, unknown>)
      .setProtectedHeader({ alg: "RS256", kid: "k1" })
      .setSubject("1234567890").setIssuedAt(t - 10).setExpirationTime(overrides.exp ?? t + 300);
    const c = claims as Record<string, unknown>;
    jwt = jwt.setIssuer((c.iss as string) ?? "https://accounts.google.com").setAudience((c.aud as string) ?? CLIENT_ID);
    const idToken = await jwt.sign(overrides.key ?? privateKey);
    return Response.json({ id_token: idToken, access_token: "should-be-ignored", refresh_token: "ignored" });
  }) as unknown as typeof fetch;
  let nonceSeen = "";

  const auth = createAuth({
    clientId: CLIENT_ID, clientSecret: "cs", redirectUri: REDIRECT, sessionSecret: SECRET,
    fetch: fakeFetch, jwks: createLocalJWKSet({ keys: [jwk] }), ...opts,
  });

  async function startLogin(query = "") {
    const res = await auth.login(new Request(`${ORIGIN}/auth/login${query}`));
    const loc = new URL(res.headers.get("location")!);
    nonceSeen = loc.searchParams.get("nonce")!;
    challenge = loc.searchParams.get("code_challenge")!;
    const txCookie = cookiePair(res, "__Host-proshore_session_tx");
    return { res, loc, state: loc.searchParams.get("state")!, txCookie };
  }
  async function doCallback(tx: { state: string; txCookie: string }, o: Overrides = {}, stateOverride?: string, cookie?: string) {
    overrides = o;
    const q = stateOverride === undefined ? tx.state : stateOverride;
    return auth.callback(new Request(`${REDIRECT}?code=abc&state=${q}`, { headers: { cookie: cookie ?? tx.txCookie } }));
  }
  return { auth, seen, startLogin, doCallback };
}

function cookiePair(res: Response, name: string): string {
  const line = res.headers.getSetCookie().find((c) => c.startsWith(name + "="))!;
  return line.split(";")[0]!;
}
const sessionCookieOf = (res: Response) => cookiePair(res, "__Host-proshore_session");
const reqWith = (cookie: string, url = `${ORIGIN}/api/me`, init: RequestInit = {}) =>
  new Request(url, { ...init, headers: { cookie, ...(init.headers as Record<string, string>) } });

async function expectRejected(res: Response, code: string) {
  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { error: "access_denied", code });
  assert.ok(!res.headers.getSetCookie().some((c) => c.startsWith("__Host-proshore_session=") && !c.includes("Max-Age=0")), "no session cookie");
}

describe("login", () => {
  test("redirects to Google with code flow, PKCE S256, state, nonce, hd hint", async () => {
    const { loc, res } = await setup().startLogin();
    assert.equal(res.status, 302);
    assert.equal(loc.origin + loc.pathname, "https://accounts.google.com/o/oauth2/v2/auth");
    const p = loc.searchParams;
    assert.equal(p.get("response_type"), "code");
    assert.equal(p.get("client_id"), CLIENT_ID);
    assert.equal(p.get("redirect_uri"), REDIRECT);
    assert.equal(p.get("scope"), "openid email profile");
    assert.equal(p.get("hd"), "proshore.nl");
    assert.equal(p.get("code_challenge_method"), "S256");
    assert.ok(p.get("state")!.length >= 32 && p.get("nonce")!.length >= 32);
    assert.equal(p.get("prompt"), null);
    const c = res.headers.getSetCookie()[0]!;
    assert.match(c, /HttpOnly/); assert.match(c, /Secure/); assert.match(c, /SameSite=Lax/); assert.match(c, /Max-Age=600/);
  });
  test("switch=1 adds prompt=select_account", async () => {
    const { loc } = await setup().startLogin("?switch=1");
    assert.equal(loc.searchParams.get("prompt"), "select_account");
  });
  test("secret and tokens never appear in the redirect", async () => {
    const { res } = await setup().startLogin();
    assert.ok(!res.headers.get("location")!.includes("cs"));
    assert.ok(!res.headers.get("location")!.includes(SECRET));
  });
});

describe("happy path", () => {
  test("login, callback, session, me, logout", async () => {
    const s = setup();
    const tx = await s.startLogin("?returnTo=/engagements/42?tab=a");
    const res = await s.doCallback(tx);
    assert.equal(res.status, 302);
    assert.equal(res.headers.get("location"), "/engagements/42?tab=a");
    const line = res.headers.getSetCookie().find((c) => c.startsWith("__Host-proshore_session="))!;
    assert.match(line, /HttpOnly/); assert.match(line, /Secure/); assert.match(line, /SameSite=Lax/); assert.match(line, /Path=\//);
    assert.match(line, /Max-Age=28800/);
    assert.ok(res.headers.getSetCookie().some((c) => c.startsWith("__Host-proshore_session_tx=;") && c.includes("Max-Age=0")));

    // PKCE verifier matched challenge, secret was sent server side
    assert.equal(s.seen[0]!.url, "https://oauth2.googleapis.com/token");
    assert.equal(s.seen[0]!.body.get("grant_type"), "authorization_code");
    assert.equal(s.seen[0]!.body.get("redirect_uri"), REDIRECT);

    const cookie = sessionCookieOf(res);
    const session = await s.auth.getSession(reqWith(cookie));
    assert.equal(session?.email, "jane@proshore.nl");
    assert.equal(session?.sub, "1234567890");
    assert.equal(session?.name, "Jane Doe");
    assert.ok(session && session.exp - session.iat === 28800);
    // Google tokens are not in the cookie
    assert.ok(!decodeURIComponent(cookie).includes("should-be-ignored"));

    const me = await s.auth.me(reqWith(cookie));
    assert.equal(me.status, 200);
    assert.equal((await me.json()).email, "jane@proshore.nl");
    assert.equal((await s.auth.me(new Request(`${ORIGIN}/api/me`))).status, 401);
    const req = await s.auth.requireSession(new Request(`${ORIGIN}/x`));
    assert.ok(req instanceof Response && req.status === 401);
    assert.ok(!(await s.auth.requireSession(reqWith(cookie)) instanceof Response));
  });
  test("PKCE challenge equals S256(verifier) (fake token endpoint enforces it)", async () => {
    const s = setup();
    const tx = await s.startLogin();
    const res = await s.doCallback(tx);
    assert.equal(res.status, 302);
    const v = s.seen[0]!.body.get("code_verifier")!;
    assert.equal(createHash("sha256").update(v).digest("base64url"), tx.loc.searchParams.get("code_challenge"));
  });
});

describe("callback rejections", () => {
  const cases: [string, Overrides, string][] = [
    ["wrong hd", { claims: { hd: "evil.com" } }, "wrong_domain"],
    ["missing hd (personal gmail)", { claims: { hd: undefined, email: "jane@gmail.com" } }, "wrong_domain"],
    ["missing hd even with proshore email", { claims: { hd: undefined } }, "wrong_domain"],
    ["email domain mismatch though hd matches", { claims: { email: "jane@evil.com" } }, "wrong_domain"],
    ["lookalike email domain", { claims: { email: "jane@proshore.nl.evil.com" } }, "wrong_domain"],
    ["subdomain email", { claims: { email: "jane@sub.proshore.nl" } }, "wrong_domain"],
    ["email_verified false", { claims: { email_verified: false } }, "email_not_verified"],
    ["email_verified string", { claims: { email_verified: "true" } }, "email_not_verified"],
    ["email_verified missing", { claims: { email_verified: undefined } }, "email_not_verified"],
    ["wrong audience", { claims: { aud: "other-client" } }, "token_invalid"],
    ["wrong issuer", { claims: { iss: "https://evil.example.com" } }, "token_invalid"],
    ["expired token", { exp: Math.floor(Date.now() / 1000) - 60 }, "token_invalid"],
    ["bad nonce", { nonce: "not-the-nonce" }, "token_invalid"],
    ["signed by another key", { key: otherKey.privateKey }, "token_invalid"],
    ["token endpoint error", { tokenStatus: 400 }, "exchange_failed"],
  ];
  for (const [name, o, code] of cases) {
    test(name, async () => {
      const s = setup();
      const tx = await s.startLogin();
      await expectRejected(await s.doCallback(tx, o), code);
    });
  }
  test("accepts the bare accounts.google.com issuer", async () => {
    const s = setup();
    const tx = await s.startLogin();
    assert.equal((await s.doCallback(tx, { claims: { iss: "accounts.google.com" } })).status, 302);
  });
  test("bad state", async () => {
    const s = setup();
    const tx = await s.startLogin();
    await expectRejected(await s.doCallback(tx, {}, "wrong"), "invalid_state");
    assert.equal(s.seen.length, 0, "no code exchange on bad state");
  });
  test("missing state param", async () => {
    const s = setup();
    const tx = await s.startLogin();
    const res = await s.auth.callback(new Request(`${REDIRECT}?code=abc`, { headers: { cookie: tx.txCookie } }));
    await expectRejected(res, "invalid_state");
  });
  test("missing transient cookie", async () => {
    const s = setup();
    const tx = await s.startLogin();
    await expectRejected(await s.doCallback(tx, {}, undefined, ""), "invalid_state");
  });
  test("tampered transient cookie", async () => {
    const s = setup();
    const tx = await s.startLogin();
    const bad = tx.txCookie.slice(0, -3) + (tx.txCookie.endsWith("aaa") ? "bbb" : "aaa");
    await expectRejected(await s.doCallback(tx, {}, undefined, bad), "invalid_state");
  });
  test("transient state older than 10 minutes", async () => {
    let t = Date.now();
    const s = setup({ now: () => new Date(t) });
    const tx = await s.startLogin();
    t += 11 * 60 * 1000;
    await expectRejected(await s.doCallback(tx), "invalid_state");
  });
  test("Google error parameter", async () => {
    const s = setup();
    const tx = await s.startLogin();
    const res = await s.auth.callback(new Request(`${REDIRECT}?error=access_denied&state=${tx.state}`, { headers: { cookie: tx.txCookie } }));
    await expectRejected(res, "exchange_failed");
  });
  test("a session cookie is not accepted as transient state (and vice versa)", async () => {
    const s = setup();
    const tx = await s.startLogin();
    const ok = await s.doCallback(tx);
    const sessionAsTx = sessionCookieOf(ok).replace("proshore_session=", "proshore_session_tx=");
    await expectRejected(await s.doCallback(tx, {}, undefined, sessionAsTx), "invalid_state");
    const txAsSession = tx.txCookie.replace("proshore_session_tx=", "proshore_session=");
    assert.equal(await s.auth.getSession(reqWith(txAsSession)), null);
  });
  test("error bodies do not leak internals", async () => {
    const s = setup();
    const tx = await s.startLogin();
    const text = await (await s.doCallback(tx, { claims: { aud: "x" } })).text();
    assert.equal(text, JSON.stringify({ error: "access_denied", code: "token_invalid" }));
  });
});

describe("session cookie", () => {
  test("tampered cookie is rejected", async () => {
    const s = setup();
    const ok = await s.doCallback(await s.startLogin());
    const c = sessionCookieOf(ok);
    const parts = c.split(".");
    // swap payload for another email, keep signature
    const payload = JSON.parse(Buffer.from(parts[1]!, "base64url").toString());
    payload.email = "boss@proshore.nl";
    parts[1] = Buffer.from(JSON.stringify(payload)).toString("base64url");
    assert.equal(await s.auth.getSession(reqWith(parts.join("."))), null);
    assert.equal(await s.auth.getSession(reqWith(c.slice(0, -2) + "xx")), null);
    assert.equal(await s.auth.getSession(reqWith("__Host-proshore_session=garbage")), null);
  });
  test("alg=none token is rejected", async () => {
    const s = setup();
    const h = Buffer.from('{"alg":"none"}').toString("base64url");
    const p = Buffer.from(JSON.stringify({ sub: "1", email: "a@proshore.nl", use: "session", iat: 1, exp: 9999999999 })).toString("base64url");
    assert.equal(await s.auth.getSession(reqWith(`__Host-proshore_session=${h}.${p}.`)), null);
  });
  test("expired session cookie is rejected", async () => {
    let t = Date.now();
    const s = setup({ now: () => new Date(t), sessionMaxAgeSeconds: 60 });
    const ok = await s.doCallback(await s.startLogin());
    const c = sessionCookieOf(ok);
    assert.ok(await s.auth.getSession(reqWith(c)));
    t += 61_000;
    assert.equal(await s.auth.getSession(reqWith(c)), null);
    assert.equal((await s.auth.me(reqWith(c))).status, 401);
  });
  test("a session signed with another secret is rejected", async () => {
    const a = setup(); const b = createAuth({ clientId: CLIENT_ID, clientSecret: "cs", redirectUri: REDIRECT, sessionSecret: "z".repeat(40), jwks: createLocalJWKSet({ keys: [jwk] }) });
    const ok = await a.doCallback(await a.startLogin());
    assert.equal(await b.getSession(reqWith(sessionCookieOf(ok))), null);
  });
});

describe("returnTo", () => {
  for (const bad of ["//evil.com", "/\\evil.com", "https://evil.com", "javascript:alert(1)", "evil.com", "/\\\\evil.com", "/a\\b", "/a\r\nSet-Cookie: x=y"]) {
    test(`login+callback ignore ${JSON.stringify(bad)}`, async () => {
      assert.equal(safeReturnTo(bad), "/");
      const s = setup();
      const tx = await s.startLogin(`?returnTo=${encodeURIComponent(bad)}`);
      assert.equal((await s.doCallback(tx)).headers.get("location"), "/");
    });
  }
  test("keeps normal relative paths", () => {
    assert.equal(safeReturnTo("/a/b?x=1#h"), "/a/b?x=1#h");
    assert.equal(safeReturnTo(undefined), "/");
  });
});

describe("logout", () => {
  const ok = { "sec-fetch-site": "same-origin", origin: ORIGIN } as Record<string, string>;
  test("GET is rejected with 405", async () => {
    const { auth } = setup();
    const res = await auth.logout(new Request(`${ORIGIN}/auth/logout`, { headers: ok }));
    assert.equal(res.status, 405); assert.equal(res.headers.get("allow"), "POST");
    assert.equal(res.headers.getSetCookie().length, 0);
  });
  test("same-origin POST clears the cookie", async () => {
    const { auth } = setup();
    const res = await auth.logout(new Request(`${ORIGIN}/auth/logout`, { method: "POST", headers: ok }));
    assert.equal(res.status, 204);
    assert.match(res.headers.getSetCookie()[0]!, /^__Host-proshore_session=; .*Max-Age=0/);
  });
  test("cross-origin POST is rejected", async () => {
    const { auth } = setup();
    for (const h of [
      { "sec-fetch-site": "cross-site", origin: "https://evil.com" },
      { "sec-fetch-site": "same-site" },
      { origin: "https://evil.com" },
      { "sec-fetch-site": "same-origin", origin: "https://evil.com" },
      {},
    ] as Record<string, string>[]) {
      const res = await auth.logout(new Request(`${ORIGIN}/auth/logout`, { method: "POST", headers: h }));
      assert.equal(res.status, 403, JSON.stringify(h));
      assert.equal(res.headers.getSetCookie().length, 0);
    }
  });
  test("Origin only (no Sec-Fetch-Site) from the app origin is accepted", async () => {
    const { auth } = setup();
    assert.equal((await auth.logout(new Request(`${ORIGIN}/auth/logout`, { method: "POST", headers: { origin: ORIGIN } }))).status, 204);
  });
});

describe("config", () => {
  const base = { clientId: CLIENT_ID, clientSecret: "cs", redirectUri: REDIRECT, sessionSecret: SECRET };
  test("short sessionSecret is rejected", () => {
    assert.throws(() => createAuth({ ...base, sessionSecret: "short" }), /32 bytes/);
    assert.throws(() => createAuth({ ...base, sessionSecret: "x".repeat(31) }), /32 bytes/);
    assert.doesNotThrow(() => createAuth({ ...base, sessionSecret: "x".repeat(32) }));
  });
  test("insecure combinations are rejected", () => {
    assert.throws(() => createAuth({ ...base, redirectUri: "http://app.proshore.nl/auth/callback" }), /https/);
    assert.throws(() => createAuth({ ...base, secureCookies: false }), /localhost/);
    assert.doesNotThrow(() => createAuth({ ...base, redirectUri: "http://localhost:3000/auth/callback", secureCookies: false }));
  });
  test("localhost without Secure uses a plain cookie name and no Secure flag", async () => {
    const auth = createAuth({ ...base, redirectUri: "http://localhost:3000/auth/callback", secureCookies: false });
    const res = await auth.login(new Request("http://localhost:3000/auth/login"));
    const c = res.headers.getSetCookie()[0]!;
    assert.match(c, /^proshore_session_tx=/); assert.doesNotMatch(c, /Secure/);
  });
  test("bad allowedDomain is rejected", () => {
    assert.throws(() => createAuth({ ...base, allowedDomain: "@proshore.nl" }), /domain/);
  });
});

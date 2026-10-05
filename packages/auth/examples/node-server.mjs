// Minimal reference: node:http server mounting @proshore/auth.
//
//   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... \
//   SESSION_SECRET=$(openssl rand -base64 48) BASE_URL=http://localhost:3000 \
//   node packages/auth/examples/node-server.mjs
//
// Runs from source (Node >= 22.18 strips types). In an app, import "@proshore/auth".
import { createServer } from "node:http";
import { createAuth } from "../src/index.ts";

const need = (k) => { const v = process.env[k]; if (!v) { console.error(`Missing env ${k}`); process.exit(1); } return v; };
const baseUrl = new URL(need("BASE_URL"));
const auth = createAuth({
  clientId: need("GOOGLE_CLIENT_ID"),
  clientSecret: need("GOOGLE_CLIENT_SECRET"),
  sessionSecret: need("SESSION_SECRET"),
  redirectUri: new URL("/auth/callback", baseUrl).href,
  secureCookies: baseUrl.protocol === "https:",
});

// Node http -> Web Request. Use BASE_URL for the origin so it is not taken from the Host header.
async function toRequest(req) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  return new Request(new URL(req.url, baseUrl), { method: req.method, headers, body: hasBody ? req : undefined, duplex: "half" });
}
async function send(res, response) {
  const headers = {};
  for (const [k, v] of response.headers) if (k !== "set-cookie") headers[k] = v;
  const cookies = response.headers.getSetCookie();
  if (cookies.length) headers["set-cookie"] = cookies;
  res.writeHead(response.status, headers);
  res.end(Buffer.from(await response.arrayBuffer()));
}

const routes = {
  "/auth/login": auth.login,
  "/auth/callback": auth.callback,
  "/auth/logout": auth.logout,
  "/api/me": auth.me,
};

createServer(async (req, res) => {
  try {
    const path = new URL(req.url, baseUrl).pathname;
    const handler = routes[path];
    if (handler) return await send(res, await handler(await toRequest(req)));
    // Example protected page: sign in is required, authorization (roles) is up to the app.
    const r = await auth.requireSession(await toRequest(req));
    if (r instanceof Response) {
      res.writeHead(302, { location: `/auth/login?returnTo=${encodeURIComponent(req.url)}` });
      return res.end();
    }
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end(`Hello ${r.name} (${r.email})\n`);
  } catch (e) {
    console.error(e);
    res.writeHead(500).end("Internal error");
  }
}).listen(Number(baseUrl.port) || 3000, () => console.log(`Listening on ${baseUrl.origin}`));

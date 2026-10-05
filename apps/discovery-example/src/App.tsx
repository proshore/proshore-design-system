import { Suspense, lazy, useEffect, useState } from "react";
import { Layout } from "./app/Layout";
import { Decision, Evidence, Landscape, Overview } from "./app/pages";
import { AppLanding } from "./app/AppLanding";
import { useRoute } from "./app/router";

// Heavy or staff-only screens load on demand, so the first screen carries only what it needs.
const Findings = lazy(() => import("./app/FindingsPage"));
const Setup = lazy(() => import("./app/Setup").then((m) => ({ default: m.Setup })));
const Library = lazy(() => import("./app/Library").then((m) => ({ default: m.Library })));
const ChartsDemo = lazy(() => import("./labs/ChartsDemo").then((m) => ({ default: m.ChartsDemo })));
const IconsLab = lazy(() => import("./labs/IconsLab").then((m) => ({ default: m.IconsLab })));
const TableDemo = lazy(() => import("./labs/TableDemo").then((m) => ({ default: m.TableDemo })));
import { PortalHost, SignInScreen, toast } from "@proshore/ui";
import { AppIcon } from "@proshore/ui";
import { SherpaTheme } from "@proshore/ui";
import type { Appearance, ThemePreference } from "@proshore/ui";

function initialPref(): ThemePreference {
  try { const v = localStorage.getItem("sherpa-theme"); if (v === "light" || v === "dark" || v === "system") return v; } catch { /* storage unavailable */ }
  return "system";
}
function useResolved(pref: ThemePreference): Appearance {
  const mq = () => window.matchMedia?.("(prefers-color-scheme: dark)");
  const [sys, setSys] = useState<Appearance>(() => (mq()?.matches ? "dark" : "light"));
  useEffect(() => { const m = mq(); if (!m) return; const on = () => setSys(m.matches ? "dark" : "light"); m.addEventListener("change", on); return () => m.removeEventListener("change", on); }, []);
  return pref === "system" ? sys : pref;
}

function DesignSystem() {
  return <Library />;
}

/** Shown while an on-demand screen loads. Same footprint as a page so nothing jumps. */
function PageLoading() {
  return <div role="status" aria-live="polite" style={{ padding: "48px var(--page-x, 24px)", color: "var(--gray-11)" }}>Loading…</div>;
}

// Warm the likely next screens once the first one is up, so navigation feels instant.
function usePrefetch() {
  useEffect(() => {
    const idle = (window as unknown as { requestIdleCallback?: (f: () => void) => void }).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 1500));
    idle(() => { void import("./app/FindingsPage"); void import("./components/FindingDrawer"); });
  }, []);
}

export function App() {
  const [pref, setPref] = useState<ThemePreference>(initialPref);
  const [host, setHost] = useState<HTMLElement | null>(null);
  // Demo only: a real app redirects to Google and checks the account on the server. Here the button just signs in.
  const [signedIn, setSignedIn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [signedOutNotice, setSignedOutNotice] = useState(false);
  const { path, params } = useRoute();
  const appearance = useResolved(pref);
  usePrefetch();
  useEffect(() => { try { localStorage.setItem("sherpa-theme", pref); } catch { /* ignore */ } }, [pref]);
  useEffect(() => { window.scrollTo(0, 0); }, [path]);
  return (
    <SherpaTheme appearance={appearance}>
      <div ref={setHost} style={{ display: "contents" }} />
      <PortalHost.Provider value={host}>
        {!signedIn || path === "/sign-in" ? (
          <SignInScreen
            product="Sherpa Discovery" productMark={<AppIcon glyph="workspace" size={44} />} busy={busy}
            notice={signedOutNotice ? "You have been signed out." : undefined}
            onSignIn={() => { setBusy(true); setTimeout(() => { setBusy(false); setSignedIn(true); setSignedOutNotice(false); if (path === "/sign-in") window.location.hash = "/overview"; }, 900); }}
          />
        ) : (
        <Layout path={path} theme={pref} onTheme={setPref} onSignOut={() => { setSignedOutNotice(true); setSignedIn(false); }} onSwitchAccount={() => toast.show("The Google account chooser would open here (demo)", { tone: "info" })}>
          {(p) => (<Suspense fallback={<PageLoading />}>{(() => {
            const props = { ...p, params };
            if (path.startsWith("/apps/")) return <AppLanding id={path.slice(6)} />;
            switch (path) {
              case "/landscape": return <Landscape {...props} />;
              case "/findings": return <Findings key={params.toString()} {...props} />;
              case "/evidence": return <Evidence />;
              case "/decision": return <Decision {...props} />;
              case "/design": return <DesignSystem />;
              case "/lab/charts": return <ChartsDemo />;
              case "/lab/icons": return <IconsLab />;
              case "/lab/table": return <TableDemo />;
              case "/setup": return <Setup />;
              default: return <Overview {...props} />;
            }
          })()}</Suspense>)}
        </Layout>
        )}
      </PortalHost.Provider>
    </SherpaTheme>
  );
}

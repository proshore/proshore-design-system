import { Suspense, lazy, useEffect, useState } from "react";
import { AppHeader, PortalHost, ProshoreTheme, ToastHost, UserMenu, toast } from "@proshore/ui";
import type { Appearance, HeaderUser, ThemePreference } from "@proshore/ui";
import { pages, useRoute } from "./router";
import { Foundations } from "./pages/Foundations";
import { SignInPage } from "./pages/SignInPage";
import { ShellPage } from "./pages/ShellPage";

const LayoutPage = lazy(() => import("./pages/LayoutPage").then((m) => ({ default: m.LayoutPage })));
const FormsPage = lazy(() => import("./pages/FormsPage").then((m) => ({ default: m.FormsPage })));
const TablesPage = lazy(() => import("./pages/TablesPage").then((m) => ({ default: m.TablesPage })));
const ChartsPage = lazy(() => import("./pages/ChartsPage").then((m) => ({ default: m.ChartsPage })));
const OverlaysPage = lazy(() => import("./pages/OverlaysPage").then((m) => ({ default: m.OverlaysPage })));
const DialogsPage = lazy(() => import("./pages/DialogsPage").then((m) => ({ default: m.DialogsPage })));
const ActionsPage = lazy(() => import("./pages/ActionsPage").then((m) => ({ default: m.ActionsPage })));
const ApiPage = lazy(() => import("./pages/ApiPage").then((m) => ({ default: m.ApiPage })));
const BrandPage = lazy(() => import("./pages/BrandPage").then((m) => ({ default: m.BrandPage })));

const user: HeaderUser = { id: "u1", name: "Sam Example", email: "sam.example@proshore.nl", role: "Designer", org: "Proshore", staff: true };

function initialPref(): ThemePreference {
  try { const v = localStorage.getItem("proshore-theme"); if (v === "light" || v === "dark" || v === "system") return v; } catch { /* storage unavailable */ }
  return "system";
}
function useResolved(pref: ThemePreference): Appearance {
  const [sys, setSys] = useState<Appearance>(() => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  useEffect(() => { const m = window.matchMedia("(prefers-color-scheme: dark)"); const on = () => setSys(m.matches ? "dark" : "light"); m.addEventListener("change", on); return () => m.removeEventListener("change", on); }, []);
  return pref === "system" ? sys : pref;
}

export function App() {
  const [pref, setPref] = useState<ThemePreference>(initialPref);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [signedIn, setSignedIn] = useState(true);
  const path = useRoute();
  const appearance = useResolved(pref);
  useEffect(() => { try { localStorage.setItem("proshore-theme", pref); } catch { /* ignore */ } }, [pref]);
  useEffect(() => { window.scrollTo(0, 0); }, [path]);

  const fullPage = path === "/sign-in" || path === "/shell" || !signedIn;
  return (
    <ProshoreTheme appearance={appearance}>
      <div ref={setHost} style={{ display: "contents" }} />
      <PortalHost.Provider value={host}>
        {path === "/shell" && signedIn ? (
          <ShellPage theme={pref} onTheme={setPref} />
        ) : fullPage ? (
          <SignInPage notice={!signedIn ? "You have been signed out." : undefined} onSignIn={() => { setSignedIn(true); if (path === "/sign-in") window.location.hash = "/foundations"; }} />
        ) : (
          <>
            <a className="sr-skip" href="#main">Skip to content</a>
            <AppHeader
              product="Design system"
              homeHref="#/foundations"
              nav={<nav className="g-nav" aria-label="Gallery">{pages.map((p) => <a key={p.path} href={`#${p.path}`} aria-current={path === p.path ? "page" : undefined}>{p.label}</a>)}</nav>}
              user={<UserMenu user={user} theme={pref} onTheme={setPref} onSwitchAccount={() => toast.show("Account chooser would open here (demo)", { tone: "info" })} onSignOut={() => setSignedIn(false)} />}
            />
            <main id="main" tabIndex={-1}>
              <Suspense fallback={<div role="status" style={{ padding: 48 }}>Loading…</div>}>
                {(() => {
                  switch (path) {
                    case "/layout": return <LayoutPage />;
                    case "/forms": return <FormsPage />;
                    case "/tables": return <TablesPage />;
                    case "/charts": return <ChartsPage />;
                    case "/overlays": return <OverlaysPage />;
                    case "/dialogs": return <DialogsPage />;
                    case "/actions": return <ActionsPage />;
                    case "/api": return <ApiPage />;
                    case "/brand": return <BrandPage />;
                    default: return <Foundations />;
                  }
                })()}
              </Suspense>
            </main>
          </>
        )}
        <ToastHost />
      </PortalHost.Provider>
    </ProshoreTheme>
  );
}

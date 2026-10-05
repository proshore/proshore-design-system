import { Button, IconButton, Text } from "@proshore/ui";
import { MoonIcon, SunIcon } from "@proshore/ui";
import { SherpaGuide } from "@proshore/ui";
import { Suspense, lazy, useCallback, useEffect, useState, type ReactNode } from "react";
import { AppShell, CommandPalette, Page, PageHeader, ProshoreMenu, ShellNav, ToastHost, UserMenu, WorkspaceSwitcher, useCommandShortcut, useDocumentIdentity } from "@proshore/ui";
import type { Command } from "@proshore/ui";
import type { ThemePreference, Workspace } from "@proshore/ui";
import { clients, personas } from "../fixtures/brightfield";
import { allFindings as findings } from "../fixtures/derived";
import type { FindingRecord, Persona } from "../fixtures/brightfield";
import { routes } from "./router";
import { suiteApps } from "../fixtures/suite";

// Opened on demand: load them on first use, then keep them mounted so their exit animations still run.
const AskSherpa = lazy(() => import("../components/AskSherpa").then((m) => ({ default: m.AskSherpa })));
const FindingSlideOver = lazy(() => import("../components/FindingDrawer").then((m) => ({ default: m.FindingSlideOver })));
/** True from the first time `on` is true; used to mount a lazy overlay only once it has been needed. */
function useEver(on: boolean) { const [ever, setEver] = useState(on); useEffect(() => { if (on) setEver(true); }, [on]); return ever || on; }

export type PageProps = { openFinding: (f: FindingRecord, list?: FindingRecord[]) => void; openAsk: () => void; params: URLSearchParams; persona: Persona };

const askContext: Record<string, string> = {
  "/overview": "the engagement overview", "/landscape": "the De Heus landscape", "/findings": "the findings list",
  "/evidence": "scan evidence and coverage", "/decision": "the recommended decision", "/setup": "engagement setup",
};
/** Screens that only Proshore staff may open. The prototype hides them; real access control belongs in the backend. */
const staffItems = [{ href: "#/setup", label: "Engagement setup" }, { href: "#/design", label: "Design system" }];
const proshoreOnlyPaths = ["/setup", "/design", "/lab/table", "/lab/charts"];

function AccessDenied() {
  return (
    <Page>
      <PageHeader eyebrow="Access" title="This page is for Proshore" description="Setup and the design library are only for Proshore staff. Your Proshore contact prepares the engagement for you. Your landscape, findings and the recommended decision are in the menu." actions={<Button href="#/overview">Back to the overview</Button>} />
      <Text size="1" color="gray">Prototype note: real access is decided by the backend, not by hiding pages.</Text>
    </Page>
  );
}

export function Layout({ path, theme, onTheme, onSignOut, onSwitchAccount, children }: {
  path: string; theme: ThemePreference; onTheme: (t: ThemePreference) => void; onSignOut: () => void; onSwitchAccount: () => void; children: (p: Omit<PageProps, "params">) => ReactNode;
}) {
  const [fs, setFs] = useState<{ list: FindingRecord[]; index: number | null }>({ list: findings, index: null });
  const openFinding = (f: FindingRecord, list: FindingRecord[] = findings) => setFs({ list, index: Math.max(0, list.findIndex((x) => x.id === f.id)) });
  useEffect(() => { setFs((x) => (x.index === null ? x : { ...x, index: null })); }, [path]); // navigating away closes the drawer
  const [ask, setAsk] = useState(false);
  const [askCtx, setAskCtx] = useState<string | null>(null);
  const [personaId, setPersonaId] = useState("maria");
  const [ws, setWs] = useState<Workspace>({ clientId: "deheus", engagementId: "ordering" });
  const persona = personas.find((p) => p.id === personaId) ?? personas[0];
  const client = clients.find((c) => c.id === ws.clientId) ?? clients[0];
  const proshoreOnly = proshoreOnlyPaths.includes(path);
  const denied = proshoreOnly && !persona.staff;
  const [cmdOpen, setCmdOpen] = useState(false);
  useCommandShortcut(useCallback(() => setCmdOpen((o) => !o), []));
  const currentApp = path.startsWith("/apps/") ? path.slice(6) : "discovery";
  const inDiscovery = currentApp === "discovery";
  const commands: Command[] = [
    ...routes.map((r) => ({ id: `p${r.path}`, label: r.label, group: "Page", run: () => { window.location.hash = r.path; } })),
    ...suiteApps.map((a) => ({ id: `a-${a.id}`, label: a.name, group: "App", hint: a.status, run: () => { window.location.hash = a.href.slice(1); } })),
    ...(persona.staff ? [{ id: "p-setup", label: "Engagement setup", group: "Proshore only", run: () => { window.location.hash = "/setup"; } }, { id: "p-design", label: "Design system", group: "Proshore only", run: () => { window.location.hash = "/design"; } }] : []),
    ...findings.map((f) => ({ id: `f-${f.id}`, label: f.title, group: "Finding", hint: f.id, run: () => openFinding(f) })),
  ];
  const clientNode = <WorkspaceSwitcher clients={persona.staff ? clients : clients.filter((c) => c.id === "deheus")} value={ws} onChange={setWs} />;
  const askNode = <Button aria-label="Ask Sherpa" onClick={() => { setAskCtx(null); setAsk(true); }}><SherpaGuide size={20} /> <span className="pr-ask__label">Ask Sherpa</span></Button>;
  const themeNode = <ThemeToggle theme={theme} onTheme={onTheme} />;
  const userNode = <UserMenu user={persona} theme={theme} onTheme={onTheme} personas={personas} onPersona={setPersonaId} onSwitchAccount={onSwitchAccount} onSignOut={onSignOut} />;
  const nav = (
    <ShellNav label="Engagement" trailing={persona.staff ? <ProshoreMenu items={staffItems} /> : undefined}
      items={routes.map((r) => ({ href: `#${r.path}`, label: r.label, current: path === r.path, count: r.path === "/findings" ? findings.length : undefined }))} />
  );
  useDocumentIdentity({ client: client.name, product: "Sherpa Discovery", logo: client.logo });
  const askEver = useEver(ask), drawerEver = useEver(fs.index !== null);
  return (
    <AppShell
      apps={suiteApps.map((a) => ({ id: a.id, name: a.name, href: a.href, glyph: a.glyph, status: a.status }))} currentApp={currentApp}
      appName={suiteApps.find((a) => a.id === currentApp)?.name ?? "Discovery"} homeHref="#/overview" appsLabel="Sherpa apps"
      client={clientNode} nav={inDiscovery ? nav : undefined} actions={askNode} onSearch={() => setCmdOpen(true)} theme={themeNode} user={userNode}
      proshoreOnly={proshoreOnly && persona.staff}
      overlays={<>
        <ToastHost />
        <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} commands={commands} placeholder="Jump to a page, app or finding" />
        {drawerEver && <Suspense fallback={null}><FindingSlideOver list={fs.list} index={fs.index} onIndex={(i) => setFs((x) => ({ ...x, index: i }))} onClose={() => setFs((x) => ({ ...x, index: null }))} onAsk={(f) => { setFs((x) => ({ ...x, index: null })); setAskCtx(`finding ${f.id}`); setAsk(true); }} /></Suspense>}
        {askEver && <Suspense fallback={null}><AskSherpa open={ask} onOpenChange={(o) => { setAsk(o); if (!o) setAskCtx(null); }} context={askCtx ?? askContext[path] ?? "this page"} onOpenFinding={(id) => { const f = findings.find((x) => x.id === id); if (f) { setAsk(false); openFinding(f); } }} /></Suspense>}
      </>}
    >
      {denied ? <AccessDenied /> : children({ openFinding, openAsk: () => setAsk(true), persona })}
    </AppShell>
  );
}

/** One-click light/dark switch. The avatar menu still offers "System". */
function ThemeToggle({ theme, onTheme }: { theme: ThemePreference; onTheme: (t: ThemePreference) => void }) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  return (
    <IconButton variant="ghost" color="gray" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => onTheme(dark ? "light" : "dark")}>
      {dark ? <SunIcon aria-hidden /> : <MoonIcon aria-hidden />}
    </IconButton>
  );
}

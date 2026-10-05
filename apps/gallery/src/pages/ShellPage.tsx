import { useCallback, useState } from "react";
import { AppShell, AssistantPanel, Button, CommandPalette, DemoTag, Page, PageHeader, Panel, Section, SherpaGuide, ShellNav, Stack, Text, UserMenu, WorkspaceSwitcher, useCommandShortcut } from "@proshore/ui";
import type { Client, Command, HeaderUser, ShellApp, ThemePreference, Workspace } from "@proshore/ui";

/** Fictional clients and apps. Real products pass their own lists. */
const clients: Client[] = [
  { id: "northwind", name: "Northwind Foods", engagements: [{ id: "ordering", name: "Ordering landscape" }, { id: "billing", name: "Billing review" }] },
  { id: "harbour", name: "Harbour Logistics", engagements: [{ id: "fleet", name: "Fleet planning" }] },
];
const apps: ShellApp[] = [
  { id: "discovery", name: "Discovery", href: "#/shell", glyph: "workspace", status: "Engagement workspace" },
  { id: "scan", name: "Legacy scan", href: "#/shell", glyph: "scan" },
  { id: "scenario", name: "Scenario planner", href: "#/shell", glyph: "scenario" },
  { id: "build", name: "Seeder", href: "#/shell", glyph: "build" },
  { id: "fixer", name: "Proshore Fixer", href: "#/shell", glyph: "fixer" },
  { id: "monitor", name: "Monitoring", href: "#/shell", glyph: "monitor" },
];
const user: HeaderUser = { id: "u1", name: "Sam Example", email: "sam.example@proshore.nl", role: "Consultant", org: "Proshore", staff: true };

/** The whole app frame as a product would use it. Full page, like the sign-in screen. */
export function ShellPage({ theme, onTheme }: { theme: ThemePreference; onTheme: (t: ThemePreference) => void }) {
  const [ws, setWs] = useState<Workspace>({ clientId: "northwind", engagementId: "ordering" });
  const [cmd, setCmd] = useState(false);
  const [ask, setAsk] = useState(false);
  const toggle = useCallback(() => setCmd((o) => !o), []);
  useCommandShortcut(toggle);
  const commands: Command[] = [
    ...apps.map((a) => ({ id: a.id, label: a.name, group: "App", run: () => { window.location.hash = "/shell"; } })),
    { id: "gallery", label: "Back to the gallery", group: "Page", run: () => { window.location.hash = "/foundations"; } },
  ];
  return (
    <AppShell
      apps={apps} currentApp="discovery" appName="Discovery" homeHref="#/foundations"
      client={<WorkspaceSwitcher clients={clients} value={ws} onChange={setWs} />}
      nav={<ShellNav label="Engagement" items={[{ href: "#/shell", label: "Overview", current: true }, { href: "#/shell", label: "Findings", count: 12 }, { href: "#/shell", label: "Decision" }]} />}
      onSearch={() => setCmd(true)}
      actions={<Button aria-label="Ask Sherpa" onClick={() => setAsk(true)}><SherpaGuide size={20} /> <span className="pr-ask__label">Ask Sherpa</span></Button>}
      user={<UserMenu user={user} theme={theme} onTheme={onTheme} />}
      overlays={<>
        <CommandPalette open={cmd} onOpenChange={setCmd} commands={commands} />
        <AssistantPanel open={ask} onOpenChange={setAsk} title="Ask about this engagement" context="the overview" badge={<DemoTag>Demo answers</DemoTag>}
          starters={["What was not scanned?"]} disclaimer="Demo answers, written by hand."
          onAsk={(q) => /scan/i.test(q) ? { text: "One application was not scanned because the clone failed.", confidence: { level: 3, label: "High: read from the scan log" }, sources: [{ label: "Scan log" }], gaps: "Anything outside the three applications." } : null} />
      </>}
    >
      <Page>
        <PageHeader eyebrow="App shell" title="The frame around every Sherpa app" description="Left bar with the apps, top bar with client and engagement, search with Ctrl or Cmd+K, the assistant, account menu. On a phone the left bar becomes a bottom bar." actions={<a href="#/foundations">Back to the gallery</a>} />
        <Section title="What the product supplies"><Panel>
          <Stack gap={2}>
            <Text size="2">The list of apps, the current app, the clients and engagements, the page links, the commands for search, and the assistant's answers. The shell supplies layout, keyboard use, landmarks and the phone layout.</Text>
          </Stack>
        </Panel></Section>
      </Page>
    </AppShell>
  );
}

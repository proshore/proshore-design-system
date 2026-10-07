import { useCallback, useState } from "react";
import { AppShell, AssistantPanel, Button, CommandPalette, DemoTag, Page, PageHeader, Panel, Section, SherpaGuide, ShellNav, SlideGroup, SlideOver, Stack, Text, UserMenu, WorkspaceSwitcher, useCommandShortcut } from "@proshore/ui";
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

const topics = [
  { title: "Left bar", text: "All Sherpa apps as thin-line icons, always one click away. The current app takes the accent. On a phone it becomes a bottom bar that stays visible." },
  { title: "Top bar", text: "Says where you are: app, client and engagement, the page links, search, the assistant and the account menu. It hides while you read down the page." },
  { title: "Page header", text: "A text eyebrow that repeats the active page link is left out, because the top bar already says it. Use keepEyebrow to show it anyway." },
  { title: "Docked panel", text: "Detail of one item beside the page on wide screens, so a list stays usable while one record is open." },
  { title: "Keyboard", text: "Tab into the hidden bar and it comes back. Home or Page Up at the top shows it. Screen readers always find it: it is moved, never removed." },
  { title: "Reduced motion", text: "With reduced motion the bar and the panel appear and disappear without animation." },
];

/** The whole app frame as a product would use it. Full page, like the sign-in screen. */
export function ShellPage({ theme, onTheme, language }: { theme: ThemePreference; onTheme: (t: ThemePreference) => void; language?: { value: string; options: { id: string; label: string }[]; onChange: (id: string) => void } }) {
  const [ws, setWs] = useState<Workspace>({ clientId: "northwind", engagementId: "ordering" });
  const [cmd, setCmd] = useState(false);
  const [ask, setAsk] = useState(false);
  const [detail, setDetail] = useState(false);
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
      user={<UserMenu user={user} theme={theme} onTheme={onTheme} language={language} />}
      overlays={<>
        <CommandPalette open={cmd} onOpenChange={setCmd} commands={commands} />
        <AssistantPanel open={ask} onOpenChange={setAsk} title="Ask about this engagement" context="the overview" badge={<DemoTag>Demo answers</DemoTag>}
          starters={["What was not scanned?"]} disclaimer="Demo answers, written by hand."
          onAsk={(q) => /scan/i.test(q) ? { text: "One application was not scanned because the clone failed.", confidence: { level: 3, label: "High: read from the scan log" }, sources: [{ label: "Scan log" }], gaps: "Anything outside the three applications." } : null} />
        <SlideOver dock open={detail} onOpenChange={setDetail} eyebrow="Finding F-104" title="Docked detail panel" footer={<Button onClick={() => setDetail(false)}>Close panel</Button>}>
          <SlideGroup title="How it behaves"><Text size="2">From 1440px wide the panel sits beside the page: no overlay, no focus trap, the page stays usable. Below that it opens over the page like any slide-over. Esc or the close button closes it and focus returns to the button that opened it.</Text></SlideGroup>
        </SlideOver>
      </>}
    >
      <Page>
        <PageHeader eyebrow="App shell" title="The frame around every Sherpa app" description="Left bar with the apps, top bar with client and engagement, search with Ctrl or Cmd+K, the assistant, account menu. On a phone the left bar becomes a bottom bar." actions={<a href="#/foundations">Back to the gallery</a>} />
        <Section title="What the product supplies"><Panel>
          <Stack gap={2}>
            <Text size="2">See a complete product built on the shell in `apps/discovery-example` (run `npm run dev:discovery`). The product supplies the list of apps, the current app, the clients and engagements, the page links, the commands for search, and the assistant's answers. The shell supplies layout, keyboard use, landmarks and the phone layout.</Text>
          </Stack>
        </Panel></Section>
        <Section title="Docked detail panel" description="On screens of 1440px or wider the panel docks beside the page; narrower, it is a modal slide-over.">
          <Panel><Button onClick={() => setDetail(true)}>Open docked panel</Button></Panel>
        </Section>
        <Section title="The top bar hides while you scroll" description="Scroll down: the bar slides away and the content gets the room. Scroll up, or tab into the bar, and it returns. It stays open while a menu from it is open.">
          <Stack gap={4}>
            {topics.map((t) => (<Panel key={t.title} title={t.title}><Text size="2">{t.text}</Text></Panel>))}
          </Stack>
        </Section>
      </Page>
    </AppShell>
  );
}

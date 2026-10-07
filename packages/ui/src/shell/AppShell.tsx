import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ProshoreIcon } from "../components/Brand";
import { MagnifyingGlassIcon } from "../icons";
import { AppIcon, type AppGlyph } from "./AppIcons";
import { useMessages } from "../i18n/I18nProvider";
import { ShellContext, useShell } from "./ShellContext";
import { useAutoHide, type AutoHide } from "./useAutoHide";

/** One app in the left bar. `status` is read to screen reader users with the name, for example "Concept" or "Live". */
export type ShellApp = { id: string; name: string; href: string; glyph: AppGlyph; status?: string };
export type ShellNavItem = { href: string; label: string; current?: boolean; count?: number };

/**
 * ShellNav: the page links in the top bar (for example Overview, Findings). Each is a real link; the current one is marked.
 * `trailing` is for a menu after the links, such as ProshoreMenu.
 */
export function ShellNav({ items, label, trailing }: { items: ShellNavItem[]; label: string; trailing?: ReactNode }) {
  const shell = useShell();
  const current = items.find((i) => i.current)?.label ?? "";
  const setNavLabel = shell?.setNavLabel;
  // Layout effect: PageHeader learns the current tab before the first paint, so a repeated eyebrow never flashes.
  useLayoutEffect(() => { setNavLabel?.(current); return () => setNavLabel?.(""); }, [setNavLabel, current]);
  return (
    <nav className="pr-bar__tabs" aria-label={label}>
      {items.map((i) => (
        <a key={i.href} href={i.href} aria-current={i.current ? "page" : undefined}>{i.label}{i.count !== undefined && <span className="pr-bar__count">{i.count}</span>}</a>
      ))}
      {trailing}
    </nav>
  );
}

/**
 * AppShell: the frame of every Sherpa app. A slim left bar with all apps as thin-line icons (always one click away, the
 * current app takes the accent), a top bar that says where you are, and the page. On phones the left bar becomes a bottom bar.
 * Slots: `client` (usually WorkspaceSwitcher), `nav` (ShellNav), `actions` (for example an assistant button), `theme`, `user`.
 * Landmarks: <aside> "apps", <header> banner, <main id="main">. Put overlays (toasts, drawers) as `overlays`, after the page.
 *
 * @example
 * <AppShell appName="Discovery" currentApp="workspace" apps={[{ id: "workspace", name: "Discovery", href: "#/", glyph: "workspace" }]} user={<UserMenu user={user} theme="system" onTheme={setTheme} onSignOut={signOut} />}>
 *   <Page>…</Page>
 * </AppShell>
 */
export function AppShell({
  apps, currentApp, appName, homeHref = "#/", appsLabel, client, nav, actions, onSearch, searchLabel, theme, user, proshoreOnly = false, autoHide = "scroll", overlays, children,
}: {
  apps: ShellApp[]; currentApp: string; appName: string; homeHref?: string; appsLabel?: string;
  client?: ReactNode; nav?: ReactNode; actions?: ReactNode;
  /** Opens the command palette. The search button shows only when provided. */ onSearch?: () => void; searchLabel?: string;
  theme?: ReactNode; user: ReactNode;
  /** Marks the page as Proshore-only with an accent line on the top bar. */ proshoreOnly?: boolean;
  /** The top bar slides away while scrolling down and returns on scrolling up, on focus, or when a menu from it is open. "phone": only on phones. "off": always visible. */ autoHide?: AutoHide;
  overlays?: ReactNode; children: ReactNode;
}) {
  const { t } = useMessages();
  const barRef = useRef<HTMLElement>(null);
  const hidden = useAutoHide(barRef, autoHide);
  const [navLabel, setNavLabel] = useState("");
  const [dockSlot, setDockSlot] = useState<HTMLElement | null>(null);
  const [docked, setDocked] = useState(false);
  const ctx = useMemo(() => ({ navLabel, setNavLabel, dockSlot, docked, setDocked }), [navLabel, dockSlot, docked]);
  // Publish the height of the sticky top bar, so sticky toolbars in the page (table filters) stop right under it.
  // While the bar is hidden they pin to the top edge (0px); the registered custom property animates with the bar.
  useEffect(() => {
    const el = barRef.current; if (!el) return;
    const measure = () => document.documentElement.style.setProperty("--pr-sticky-top", hidden ? "0px" : `${Math.round(el.getBoundingClientRect().height)}px`);
    measure(); const ro = new ResizeObserver(measure); ro.observe(el); return () => ro.disconnect();
  }, [hidden]);
  return (
    <ShellContext.Provider value={ctx}>
    <div className="app pr-shell">
      <a className="skip" href="#main">{t("shell.skipToContent")}</a>
      <aside className="pr-rail" aria-label={appsLabel ?? t("shell.apps")}>
        <a className="pr-rail__brand" href={homeHref} aria-label={t("shell.home")}><ProshoreIcon height={26} /></a>
        <ul className="pr-rail__apps">
          {apps.map((a) => (
            <li key={a.id}>
              <a className="pr-rail__app" href={a.href} aria-current={a.id === currentApp ? "page" : undefined} aria-label={a.status ? `${a.name}, ${a.status}` : a.name}>
                <AppIcon glyph={a.glyph} size={44} active={a.id === currentApp} />
                <span className="pr-rail__tip" aria-hidden>{a.name}</span>
              </a>
            </li>
          ))}
        </ul>
        <span className="pr-bar__grow" />
        <div className="pr-rail__foot">{theme}{user}</div>
      </aside>
      <div className="pr-shell__frame" data-docked={docked || undefined}>
      <header ref={barRef} className="pr-bar" data-proshore={proshoreOnly || undefined} data-hidden={hidden || undefined}>
        <div className="pr-bar__row">
          <span className="pr-bar__appname">{appName}</span>
          {client && (<><span className="pr-bar__sep" aria-hidden>/</span>{client}</>)}
          {nav}
          <span className="pr-bar__grow" />
          {onSearch && <button type="button" className="pr-bar__iconbtn" onClick={onSearch} aria-label={t("shell.opensPalette", { label: searchLabel ?? t("shell.search") })}><MagnifyingGlassIcon aria-hidden /></button>}
          {actions}
          <span className="pr-bar__mobile">{theme}{user}</span>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="app__main">{children}</main>
      <div ref={setDockSlot} className="pr-dock" data-docked={docked || undefined} />
      </div>
      {overlays}
    </div>
    </ShellContext.Provider>
  );
}

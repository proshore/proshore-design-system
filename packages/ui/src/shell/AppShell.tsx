import type { ReactNode } from "react";
import { ProshoreIcon } from "../components/Brand";
import { MagnifyingGlassIcon } from "../icons";
import { AppIcon, type AppGlyph } from "./AppIcons";
import { useMessages } from "../i18n/I18nProvider";

/** One app in the left bar. `status` is read to screen reader users with the name, for example "Concept" or "Live". */
export type ShellApp = { id: string; name: string; href: string; glyph: AppGlyph; status?: string };
export type ShellNavItem = { href: string; label: string; current?: boolean; count?: number };

/**
 * ShellNav: the page links in the top bar (for example Overview, Findings). Each is a real link; the current one is marked.
 * `trailing` is for a menu after the links, such as ProshoreMenu.
 */
export function ShellNav({ items, label, trailing }: { items: ShellNavItem[]; label: string; trailing?: ReactNode }) {
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
 */
export function AppShell({
  apps, currentApp, appName, homeHref = "#/", appsLabel, client, nav, actions, onSearch, searchLabel, theme, user, proshoreOnly = false, overlays, children,
}: {
  apps: ShellApp[]; currentApp: string; appName: string; homeHref?: string; appsLabel?: string;
  client?: ReactNode; nav?: ReactNode; actions?: ReactNode;
  /** Opens the command palette. The search button shows only when provided. */ onSearch?: () => void; searchLabel?: string;
  theme?: ReactNode; user: ReactNode;
  /** Marks the page as Proshore-only with an accent line on the top bar. */ proshoreOnly?: boolean;
  overlays?: ReactNode; children: ReactNode;
}) {
  const { t } = useMessages();
  return (
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
      <header className="pr-bar" data-proshore={proshoreOnly || undefined}>
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
      {overlays}
    </div>
  );
}

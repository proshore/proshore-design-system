import { CheckIcon, ChevronDownIcon, DesktopIcon, MoonIcon, SunIcon } from "../icons";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, Header, Menu, MenuItem, MenuSection, MenuTrigger, Popover, Separator } from "react-aria-components";
import { Avatar } from "./Avatar";
import { ProshoreIcon, ProshoreWordmark } from "./Brand";
import { ClientMark } from "./ClientMark";

export type Client = { id: string; name: string; logo?: string; engagements: { id: string; name: string }[] };
export type Workspace = { clientId: string; engagementId: string };
export type ThemePreference = "system" | "light" | "dark";
export type HeaderUser = { id: string; name: string; email: string; role: string; org: string; avatar?: string; staff: boolean };

/**
 * AppHeader: the two layers of a Proshore application.
 *  1. Proshore layer (always): icon and wordmark on the left, the user on the right. Proshore-only areas add
 *     an orange top line and a "Proshore only" tag (`proshoreOnly`).
 *  2. Client layer (optional `client` slot): the client chip. Omit it for internal tools that are not client-scoped.
 * Landmark: renders <header> (banner). Keep the page's h1 in <main>.
 */
export function AppHeader({ product, homeHref = "#/", launcher, client, nav, proshoreOnly = false, actions, user }: {
  product: string; homeHref?: string; /** App launcher: replaces the plain product label. */ launcher?: ReactNode; client?: ReactNode; nav?: ReactNode; proshoreOnly?: boolean; actions?: ReactNode; user: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    // The header floats over the hero: publish its height so the hero can reserve the space beneath it.
    const measure = () => {
      // Only a floating header (inside `.app`, pulled over the page) needs space reserved under it. A plain sticky header already takes its own room.
      const floats = parseFloat(getComputedStyle(el).marginBottom) < 0;
      document.documentElement.style.setProperty("--pr-header-h", floats ? `${Math.round(el.getBoundingClientRect().height) + 10}px` : "0px");
    };
    measure(); const ro = new ResizeObserver(measure); ro.observe(el);
    let raf = 0; const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setScrolled(window.scrollY > 8)); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => { ro.disconnect(); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <header ref={ref} className="pr-header" data-scrolled={scrolled || undefined} data-layer={proshoreOnly ? "proshore" : "client"}>
      <a href={homeHref} className="pr-header__brand" aria-label={`${product}, home`}>
        <ProshoreIcon height={28} /><span className="pr-header__word"><ProshoreWordmark height={14} /></span>
        {!launcher && <span className="sherpa-eyebrow pr-header__product">{product}</span>}
      </a>
      {launcher && (<><span className="pr-header__sep" aria-hidden>/</span>{launcher}</>)}
      {client && (<><span className="pr-header__sep" aria-hidden>/</span>{client}</>)}
      {nav && <div className="pr-header__nav">{nav}</div>}
      {proshoreOnly && <span className="pr-layer">Proshore only</span>}
      <span className="pr-header__grow" />
      <div className="pr-header__actions">{actions}</div>
      {user}
    </header>
  );
}

/** Client chip and switcher: client logo and name, with the engagement name; menu groups engagements per client. */
export function WorkspaceSwitcher({ clients, value, onChange }: { clients: Client[]; value: Workspace; onChange: (w: Workspace) => void }) {
  const client = clients.find((c) => c.id === value.clientId) ?? clients[0];
  const engagement = client.engagements.find((e) => e.id === value.engagementId) ?? client.engagements[0];
  return (
    <MenuTrigger>
      <Button className="pr-chip" aria-label={`Workspace: ${client.name}, ${engagement.name}. Change`}>
        <ClientMark name={client.name} src={client.logo} size={28} />
        <span className="pr-chip__text"><span className="pr-chip__client">{client.name}</span><span className="pr-chip__eng">{engagement.name}</span></span>
        <ChevronDownIcon aria-hidden />
      </Button>
      <Popover className="pr-popover" placement="bottom start">
        <Menu className="pr-menu" aria-label="Switch client or engagement" onAction={(k) => { const [c, e] = String(k).split("/"); onChange({ clientId: c, engagementId: e }); }}>
          {clients.map((c, i) => (
            <MenuSection key={c.id}>
              {i > 0 && <Separator className="pr-menu__sep" />}
              <Header className="pr-menu__head"><ClientMark name={c.name} src={c.logo} size={22} /> {c.name}</Header>
              {c.engagements.map((e) => {
                const on = c.id === value.clientId && e.id === value.engagementId;
                return (<MenuItem key={`${c.id}/${e.id}`} id={`${c.id}/${e.id}`} className="pr-menu__item" textValue={`${c.name} ${e.name}`}>
                  <span className="pr-menu__check" aria-hidden>{on && <CheckIcon />}</span><span>{e.name}</span>{on && <span className="sr-only"> (current)</span>}
                </MenuItem>);
              })}
            </MenuSection>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

const themeIcon = { system: <DesktopIcon aria-hidden />, light: <SunIcon aria-hidden />, dark: <MoonIcon aria-hidden /> };

/**
 * UserMenu: avatar button. Menu shows who you are (name, email, role, organisation), appearance, and, for
 * demos only, a "view as" switch. Staff get the Proshore mark on the avatar.
 */
export function UserMenu({ user, theme, onTheme, personas, onPersona, onSwitchAccount, onSignOut }: {
  user: HeaderUser; theme: ThemePreference; onTheme: (t: ThemePreference) => void; personas?: HeaderUser[]; onPersona?: (id: string) => void;
  /** Opens the account chooser again (for example Google's). Shown only when provided. */ onSwitchAccount?: () => void;
  /** Ends the session. Shown only when provided. */ onSignOut?: () => void;
}) {
  return (
    <MenuTrigger>
      <Button className="pr-userbtn" aria-label={`Account menu for ${user.name}`}>
        <Avatar name={user.name} src={user.avatar} proshore={user.staff} size={34} decorative />
      </Button>
      <Popover className="pr-popover" placement="bottom end">
        <Menu className="pr-menu" aria-label="Account">
          <MenuSection>
            <Header className="pr-menu__identity">
              <Avatar name={user.name} src={user.avatar} proshore={user.staff} size={44} decorative />
              <span className="pr-menu__who"><strong>{user.name}</strong><span>{user.email}</span><span>{user.role} · {user.org}</span></span>
            </Header>
          </MenuSection>
          <Separator className="pr-menu__sep" />
          <MenuSection selectionMode="single" selectedKeys={[theme]} onSelectionChange={(k) => { const v = [...(k as Set<string>)][0]; if (v) onTheme(v as ThemePreference); }} aria-label="Appearance">
            <Header className="pr-menu__head">Appearance</Header>
            {(["system", "light", "dark"] as const).map((t) => (
              <MenuItem key={t} id={t} className="pr-menu__item" textValue={t}>
                <span className="pr-menu__check" aria-hidden>{theme === t && <CheckIcon />}</span>{themeIcon[t]}<span style={{ textTransform: "capitalize" }}>{t}</span>
              </MenuItem>
            ))}
          </MenuSection>
          {personas && onPersona && (<>
            <Separator className="pr-menu__sep" />
            <MenuSection selectionMode="single" selectedKeys={[user.id]} onSelectionChange={(k) => { const v = [...(k as Set<string>)][0]; if (v) onPersona(String(v)); }} aria-label="View as (demo)">
              <Header className="pr-menu__head">Demo: view as</Header>
              {personas.map((p) => (
                <MenuItem key={p.id} id={p.id} className="pr-menu__item" textValue={`${p.name} ${p.role}`}>
                  <span className="pr-menu__check" aria-hidden>{p.id === user.id && <CheckIcon />}</span>
                  <span className="pr-menu__who"><span>{p.name}</span><span className="pr-menu__sub">{p.role} · {p.org}</span></span>
                </MenuItem>
              ))}
            </MenuSection>
          </>)}
          {(onSwitchAccount || onSignOut) && (<>
            <Separator className="pr-menu__sep" />
            <MenuSection aria-label="Session">
              {onSwitchAccount && <MenuItem id="switch-account" className="pr-menu__item" textValue="Switch account" onAction={onSwitchAccount}><span className="pr-menu__check" aria-hidden /><span>Switch account</span></MenuItem>}
              {onSignOut && <MenuItem id="sign-out" className="pr-menu__item" textValue="Sign out" onAction={onSignOut}><span className="pr-menu__check" aria-hidden /><span>Sign out</span></MenuItem>}
            </MenuSection>
          </>)}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

/** Proshore-only navigation (setup, design library). Only render it for Proshore staff; real access control is server-side. */
export function ProshoreMenu({ items }: { items: { href: string; label: string }[] }) {
  return (
    <MenuTrigger>
      <Button className="pr-navbtn" aria-label="Proshore tools"><span className="pr-navbtn__dot" aria-hidden />Proshore <ChevronDownIcon aria-hidden /></Button>
      <Popover className="pr-popover" placement="bottom start">
        <Menu className="pr-menu" aria-label="Proshore tools">
          <MenuSection><Header className="pr-menu__head">Proshore only</Header>
            {items.map((i) => (<MenuItem key={i.href} id={i.href} href={i.href} className="pr-menu__item" textValue={i.label}><span>{i.label}</span></MenuItem>))}
          </MenuSection>
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

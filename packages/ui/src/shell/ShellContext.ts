import { createContext, useContext } from "react";

/** What AppShell shares with the parts of a page: the current nav label (PageHeader hides an eyebrow that repeats it) and the dock slot (SlideOver docks into it). */
export type ShellContextValue = {
  navLabel: string; setNavLabel: (label: string) => void;
  dockSlot: HTMLElement | null; docked: boolean; setDocked: (docked: boolean) => void;
  /** The page title (a text title in PageHeader) and whether it has scrolled out of view: the bar then shows it in place of the app name and client. */
  pageTitle: string; setPageTitle: (title: string) => void; titleOut: boolean; setTitleOut: (out: boolean) => void;
};
export const ShellContext = createContext<ShellContextValue | null>(null);
/** Null outside an AppShell. */
export const useShell = () => useContext(ShellContext);

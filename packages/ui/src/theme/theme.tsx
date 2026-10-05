import { useEffect, type ReactNode } from "react";

export type Appearance = "light" | "dark";

/**
 * SherpaTheme: applies the light or dark token set. The page-level theme (root) also sets html[data-theme] so
 * anything rendered into <body> (menus, popovers, dialogs, toasts) inherits the tokens. Nested themes
 * (`root={false}`) only scope their own subtree, for side-by-side previews.
 */
export function SherpaTheme({ appearance, children, root = true }: { appearance: Appearance; children: ReactNode; root?: boolean }) {
  useEffect(() => { if (root) document.documentElement.dataset.theme = appearance; }, [appearance, root]);
  return <div className="sherpa-theme" data-theme={appearance} data-root={root || undefined}>{children}</div>;
}

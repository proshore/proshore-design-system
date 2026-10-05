import { useEffect, type ReactNode } from "react";

export type Appearance = "light" | "dark";

/**
 * ProshoreTheme: applies the light or dark token set. The page-level theme (root) also sets html[data-theme] so
 * anything rendered into <body> (menus, popovers, dialogs, toasts) inherits the tokens. Nested themes
 * (`root={false}`) only scope their own subtree, for side-by-side previews.
 */
export function ProshoreTheme({ appearance, children, root = true }: { appearance: Appearance; children: ReactNode; root?: boolean }) {
  useEffect(() => { if (root) document.documentElement.dataset.theme = appearance; }, [appearance, root]);
  return <div className="pr-theme" data-theme={appearance} data-root={root || undefined}>{children}</div>;
}

/** @deprecated Old name of ProshoreTheme. Removed in 0.6.0. */
export const SherpaTheme: typeof ProshoreTheme = (props) => <ProshoreTheme {...props} />;

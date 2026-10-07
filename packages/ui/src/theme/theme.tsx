import { useEffect, type ReactNode } from "react";

export type Appearance = "light" | "dark";

/**
 * ProshoreTheme: applies the light or dark token set. The page-level theme (root) also sets html[data-theme] so
 * anything rendered into <body> (menus, popovers, dialogs, toasts) inherits the tokens. Nested themes
 * (`root={false}`) only scope their own subtree, for side-by-side previews.
 */
export type Density = "compact" | "comfortable";

export function ProshoreTheme({ appearance, children, root = true, density = "compact" }: { appearance: Appearance; children: ReactNode; root?: boolean; /** Spacing of headers and page rhythm. Compact (default) uses less vertical space; comfortable is the roomier layout of 0.6.x and earlier. */ density?: Density }) {
  useEffect(() => { if (root) document.documentElement.dataset.theme = appearance; }, [appearance, root]);
  return <div className="pr-theme" data-theme={appearance} data-root={root || undefined} data-density={density}>{children}</div>;
}


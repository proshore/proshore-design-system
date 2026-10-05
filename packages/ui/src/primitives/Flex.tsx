import type { CSSProperties, ElementType, ReactNode } from "react";
import { spaceStyle, splitSpace } from "./space";
import type { Space, SpaceProps } from "./space";

/**
 * Flex: one-off flex container. Prefer Stack, Cluster or Grid from the layout primitives; use this
 * when a simple row or column needs alignment that they do not offer.
 */
export function Flex({ as: As = "div", direction = "row", gap, align, justify, wrap, style, className, children, ...rest }: SpaceProps & {
  as?: ElementType; direction?: "row" | "column"; gap?: Space; align?: "start" | "center" | "end" | "baseline" | "stretch"; justify?: "start" | "center" | "end" | "between";
  wrap?: boolean | "wrap"; style?: CSSProperties; className?: string; children?: ReactNode; id?: string; role?: string;
}) {
  const [sp, other] = splitSpace(rest);
  const map = { start: "flex-start", end: "flex-end", between: "space-between", center: "center", baseline: "baseline", stretch: "stretch" } as const;
  const base: CSSProperties = { display: "flex", flexDirection: direction, gap: gap === undefined ? undefined : `var(--space-${gap})`, alignItems: align ? map[align] : undefined, justifyContent: justify ? map[justify] : undefined, flexWrap: wrap ? "wrap" : undefined };
  return <As className={className} style={spaceStyle(sp, { ...base, ...style })} {...other}>{children}</As>;
}

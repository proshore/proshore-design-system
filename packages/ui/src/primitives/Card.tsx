import type { CSSProperties, ElementType, ReactNode } from "react";
import { spaceStyle, splitSpace } from "./space";
import type { SpaceProps } from "./space";

/** Card: soft-shadow surface. Use `as` for the right element (article, li, a); interactive cards should be a link or button inside. */
export function Card({ as: As = "div", className, style, children, dashed, ...rest }: SpaceProps & { as?: ElementType; className?: string; style?: CSSProperties; children?: ReactNode; dashed?: boolean; "aria-labelledby"?: string; "aria-label"?: string; id?: string }) {
  const [sp, other] = splitSpace(rest);
  return <As className={`pr-card${className ? " " + className : ""}`} data-dashed={dashed || undefined} style={spaceStyle(sp, style)} {...other}>{children}</As>;
}

type BadgeColor = "gray" | "green" | "amber" | "red" | "indigo";
/** Badge: small label. `color` maps to semantic tokens (green confirmed, amber inferred, red danger, indigo accent, gray neutral). */
export function Badge({ variant = "soft", size = "1", color = "indigo", className, style, children }: { variant?: "soft" | "outline" | "solid"; size?: "1" | "2"; color?: BadgeColor; className?: string; style?: CSSProperties; children?: ReactNode }) {
  return <span className={`pr-badge${className ? " " + className : ""}`} data-variant={variant} data-size={size} data-color={color} style={style}>{children}</span>;
}

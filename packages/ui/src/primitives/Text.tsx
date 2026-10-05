import type { CSSProperties, ElementType, ReactNode } from "react";
import { spaceStyle, splitSpace } from "./space";
import type { SpaceProps } from "./space";

type Size = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Common = SpaceProps & { as?: ElementType; className?: string; style?: CSSProperties; children?: ReactNode; id?: string; role?: string; htmlFor?: string };

/**
 * Text: sized from the type scale (1 = 12px ... 5 = 20px, 6 to 9 = display steps).
 * `color="gray"` is the muted text colour; default inherits. `weight` regular, medium or bold. `mono` uses Geist Mono.
 */
export function Text({ as: As = "span", size = "3", weight, color, mono, align, className, style, children, ...rest }: Common & { size?: Size; weight?: "regular" | "medium" | "bold"; color?: "gray" | "accent"; mono?: boolean; align?: "left" | "center" | "right" }) {
  const [sp, other] = splitSpace(rest);
  return (
    <As className={`pr-text${className ? " " + className : ""}`} data-size={size} data-weight={weight} data-color={color} data-mono={mono || undefined} data-align={align} style={spaceStyle(sp, style)} {...other}>{children}</As>
  );
}

/** Heading: bold by default, same scale as Text. Use `as` for the real level (h1 to h6) and `size` for the look. */
export function Heading({ as: As = "h2", size = "5", weight, className, style, children, ...rest }: Common & { size?: Size; weight?: "regular" | "medium" | "bold" }) {
  const [sp, other] = splitSpace(rest);
  return (
    <As className={`pr-heading${className ? " " + className : ""}`} data-size={size} data-weight={weight} style={spaceStyle(sp, style)} {...other}>{children}</As>
  );
}

/**
 * Inline monospace code.
 */
export function Code({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <code className={`pr-code${className ? " " + className : ""}`} style={style}>{children}</code>;
}

/** Loading placeholder. Decorative: put the real label on the container (aria-busy or a visually hidden status). */
export function Skeleton({ height = 16, width, style, className }: { height?: number | string; width?: number | string; style?: CSSProperties; className?: string }) {
  return <span className={`pr-skeleton${className ? " " + className : ""}`} aria-hidden style={{ height, width, ...style }} />;
}

import type { CSSProperties, ReactNode } from "react";
import { Button as RACButton, Link as RACLink, Tooltip as RACTooltip, TooltipTrigger } from "react-aria-components";

type Variant = "solid" | "soft" | "outline" | "ghost";
type Size = "1" | "2" | "3";
type Common = {
  variant?: Variant; size?: Size; color?: "gray"; disabled?: boolean; className?: string; style?: CSSProperties; children?: ReactNode;
  "aria-label"?: string; "aria-pressed"?: boolean; "aria-expanded"?: boolean; id?: string; title?: string;
};

/**
 * Button (React Aria). One primary (solid) per view; outline for alternatives; soft and ghost for quiet actions.
 * With `href` it renders a real link that looks like a button (navigation), otherwise a button (action).
 * Keyboard, press and focus behaviour come from React Aria; state is exposed as data attributes for CSS.
 *
 * @example
 * <Button variant="solid" onClick={() => save()}>Save changes</Button>
 * <Button variant="outline" href="#/settings">Open settings</Button>
 */
export function Button({ variant = "solid", size = "2", color, disabled, className, style, children, href, onClick, type = "button", ...aria }: Common & { href?: string; onClick?: () => void; type?: "button" | "submit" | "reset" }) {
  const cls = `pr-btn${className ? " " + className : ""}`;
  const data = { "data-variant": variant, "data-size": size, "data-color": color };
  if (href) return <RACLink href={href} className={cls} style={style} isDisabled={disabled} {...data} {...aria}>{children}</RACLink>;
  return <RACButton className={cls} style={style} isDisabled={disabled} onPress={onClick} type={type} {...data} {...aria}>{children}</RACButton>;
}

/** Icon-only button. `aria-label` is required: an icon alone has no accessible name. */
export function IconButton({ variant = "ghost", size = "2", color, disabled, className, style, children, onClick, "aria-label": label, ...aria }: Omit<Common, "aria-label"> & { "aria-label": string; onClick?: () => void }) {
  return (
    <RACButton className={`pr-btn pr-iconbtn${className ? " " + className : ""}`} style={style} isDisabled={disabled} onPress={onClick} aria-label={label}
      data-variant={variant} data-size={size} data-color={color} {...aria}>{children}</RACButton>
  );
}

/** Tooltip on hover and keyboard focus. The trigger must be a React Aria pressable (our Button or IconButton). Never the only place for essential information. */
export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <TooltipTrigger delay={350} closeDelay={80}>
      {children}
      <RACTooltip className="pr-tooltip" offset={6}>{content}</RACTooltip>
    </TooltipTrigger>
  );
}

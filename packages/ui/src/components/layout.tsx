import { Ridgeline } from "./Motifs";
import { Card } from "../primitives/Card";
import { Flex } from "../primitives/Flex";
import { Heading, Text } from "../primitives/Text";
import { Children, isValidElement, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useMessages } from "../i18n/I18nProvider";
import { Eyebrow } from "./Bits";
import { Breadcrumbs } from "../primitives/Breadcrumbs";

/**
 * Layout primitives. Every screen is built from these so spacing and alignment come from ONE place.
 * Rhythm (Relume 4/8/16/24/32 scale): 24px between blocks in a grid, 32px between sections, 8px inside clusters.
 * Nothing should set its own margins or widths: put it in a Grid, Stack or Cluster instead.
 */

/**
 * Page: hero band (a PageHeader or PageHero child) full-bleed on top, then the padded content body.
 * `pull` lifts the first content block over the hero (px), used for stat cards and a data table.
 */
export function Page({ children, narrow = false, pull = 0 }: { children: ReactNode; narrow?: boolean; pull?: number }) {
  const all = Children.toArray(children);
  const idx = all.findIndex((c) => isValidElement(c) && (c.type === PageHeader || c.type === PageHero));
  const hero = idx >= 0 ? all[idx] : null;
  const rest = idx >= 0 ? all.filter((_, i) => i !== idx) : all;
  return (
    <div className="l-page" data-narrow={narrow || undefined}>
      {hero}
      <div className="l-body" data-pull={pull || undefined} style={{ "--l-pull": `${pull}px` } as CSSProperties}>{rest}</div>
    </div>
  );
}

/** Navy hero band. `size="lg"` for landing screens (display type, room for overlapping cards). */
export function PageHero({ eyebrow, children, size = "lg", motif = true }: { eyebrow?: ReactNode; children: ReactNode; size?: "md" | "lg"; /** The mountain ridgeline. On by default for the hero, which is for key pages such as a dashboard. */ motif?: boolean }) {
  return (
    <div className="pr-hero" data-size={size}>
      {motif && <Ridgeline className="pr-hero__ridge" />}<div className="pr-hero__in">{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}{children}</div>
    </div>
  );
}

/**
 * The description under a page title. In the compact density it shows one line; when the text is longer, a "More" button
 * shows the rest (the full text is always in the page, so screen readers read all of it). In the comfortable density it is never clamped.
 */
function PageDescription({ children }: { children: ReactNode }) {
  const { t } = useMessages();
  const ref = useRef<HTMLParagraphElement>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [over, setOver] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => { if (!open) setOver(el.scrollHeight > el.clientHeight + 1); };
    measure(); const ro = new ResizeObserver(measure); ro.observe(el); return () => ro.disconnect();
  }, [open, children]);
  return (
    <div className="pr-hero__descwrap">
      <p ref={ref} id={id} className="pr-hero__desc" data-open={open || undefined}>{children}</p>
      {(over || open) && <button type="button" className="pr-hero__more" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>{open ? t("pageHeader.less") : t("pageHeader.more")}</button>}
    </div>
  );
}

/** Page title block. The mountain motif is off by default: turn it on (`motif`) only for key pages such as the dashboard or the home page. */
export function PageHeader({ eyebrow, title, description, actions, meta, breadcrumbs, motif = false }: {
  eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode; meta?: ReactNode; breadcrumbs?: { label: string; href?: string }[]; motif?: boolean;
}) {
  return (
    <header className="pr-hero" data-size="md">
      {motif && <Ridgeline className="pr-hero__ridge" />}
      <div className="pr-hero__in">
        <div className="l-pageheader">
          <div className="l-pageheader__text">
            {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h1 className="pr-hero__title">{title}</h1>
            {description && <PageDescription>{description}</PageDescription>}
            {meta && <div className="l-cluster">{meta}</div>}
          </div>
          {actions && <div className="l-pageheader__actions">{actions}</div>}
        </div>
      </div>
    </header>
  );
}

/** Titled block. Title left, actions right, content below on the same left edge. */
export function Section({ id, eyebrow, title, description, actions, children }: {
  id?: string; eyebrow?: ReactNode; title?: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode;
}) {
  const hid = id ? `${id}-h` : undefined;
  return (
    <section className="l-section" aria-labelledby={title ? hid : undefined} id={id}>
      {(title || actions) && (
        <div className="l-section__head">
          <div className="l-section__text">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {title && <h2 className="l-section__title" id={hid}>{title}</h2>}
            {description && <p className="l-section__desc">{description}</p>}
          </div>
          {actions && <div className="l-cluster">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Responsive equal-column grid. `min` is the narrowest a column may get before it wraps; `cap` limits the total width (px) for blocks that are not data, such as figure cards. */
export function Grid({ children, min = 260, gap = 5, align = "stretch", cap }: { children: ReactNode; min?: number; gap?: 3 | 4 | 5 | 6; align?: "stretch" | "start"; cap?: number }) {
  return <div className="l-grid" data-cap={cap ? "" : undefined} style={{ "--l-min": `${min}px`, "--l-gap": `var(--space-${gap})`, "--l-cap": cap ? `${cap}px` : undefined, alignItems: align === "start" ? "start" : "stretch" } as CSSProperties}>{children}</div>;
}

/** Main column plus a fixed-width aside (filters, checklist, summary). Stacks under 960px. */
export function WithAside({ children, aside, asideWidth = 300, asideFirst = false }: { children: ReactNode; aside: ReactNode; asideWidth?: number; asideFirst?: boolean }) {
  return (
    <div className="l-aside" data-first={asideFirst || undefined} style={{ "--l-aside": `${asideWidth}px` } as CSSProperties}>
      <div className="l-aside__main">{children}</div>
      <aside className="l-aside__side">{aside}</aside>
    </div>
  );
}

/**
 * Vertical stack of items with a gap from the spacing scale.
 */
export function Stack({ children, gap = 4 }: { children: ReactNode; gap?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  return <div className="l-stack" style={{ "--l-gap": `var(--space-${gap})` } as CSSProperties}>{children}</div>;
}

/**
 * Horizontal row of items that wraps, with a gap from the spacing scale.
 */
export function Cluster({ children, gap = 2, justify = "start", align = "center" }: { children: ReactNode; gap?: 1 | 2 | 3 | 4; justify?: "start" | "between" | "end"; align?: "center" | "start" }) {
  return <div className="l-cluster" style={{ "--l-gap": `var(--space-${gap})`, justifyContent: justify === "between" ? "space-between" : justify === "end" ? "flex-end" : "flex-start", alignItems: align === "start" ? "flex-start" : "center" } as CSSProperties}>{children}</div>;
}

/** Card with a fixed header/footer structure so every card lines up the same way. */
export function Panel({ title, eyebrow, actions, footer, children, tone, tight = false }: {
  title?: ReactNode; eyebrow?: ReactNode; actions?: ReactNode; footer?: ReactNode; children?: ReactNode; tone?: "review" | "warning"; tight?: boolean;
}) {
  return (
    <Card className="l-panel" data-tone={tone} data-tight={tight || undefined}>
      {(title || eyebrow || actions) && (
        <div className="l-panel__head">
          <div>{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}{title && <Heading as="h3" size="3">{title}</Heading>}</div>
          {actions && <div className="l-cluster">{actions}</div>}
        </div>
      )}
      {children !== undefined && <div className="l-panel__body">{children}</div>}
      {footer && <div className="l-panel__foot">{footer}</div>}
    </Card>
  );
}

/** Aligned label/value pairs. Labels share one column so values line up down the page. */
export function KeyValue({ items, labelWidth = 150 }: { items: { label: string; value: ReactNode }[]; labelWidth?: number }) {
  return (
    <dl className="l-kv" style={{ "--l-label": `${labelWidth}px` } as CSSProperties}>
      {items.map((i) => (<div key={i.label} className="l-kv__row"><dt>{i.label}</dt><dd>{i.value}</dd></div>))}
    </dl>
  );
}

/** Small numeric summary with an honest caveat line. Never a bare number without scope. */
export function StatCard({ label, value, caveat, trend }: { label: string; value: ReactNode; caveat?: ReactNode; trend?: ReactNode }) {
  return (
    <Panel tight>
      <Stack gap={1}>
        <Eyebrow>{label}</Eyebrow>
        <Flex align="baseline" gap="2"><Text size="8" weight="bold" className="l-stat">{value}</Text>{trend}</Flex>
        {caveat && <Text size="1" color="gray">{caveat}</Text>}
      </Stack>
    </Panel>
  );
}

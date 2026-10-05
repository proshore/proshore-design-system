import { useEffect, useRef, type ReactNode } from "react";
import { Tab, TabList, TabPanel, Tabs as RACTabs } from "react-aria-components";

/**
 * Tabs: switch between views of the SAME item (overview, activity and settings of one record).
 * Use links, not tabs, to move to a different item or page. Arrow keys move and select; the panel is linked automatically.
 */
export function Tabs({ label, items, value, defaultValue, onChange }: {
  label: string; items: { id: string; label: string; content: ReactNode }[]; value?: string; defaultValue?: string; onChange?: (id: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  // Slide the indicator under the selected tab. Measured, so it follows any label width and window size.
  useEffect(() => {
    const el = listRef.current; if (!el) return;
    const place = () => { const t = el.querySelector<HTMLElement>('[data-selected]'); if (t) { el.style.setProperty("--ind-x", `${t.offsetLeft}px`); el.style.setProperty("--ind-w", `${t.offsetWidth}px`); } };
    place(); const ro = new ResizeObserver(place); ro.observe(el); const mo = new MutationObserver(place); mo.observe(el, { attributes: true, subtree: true, attributeFilter: ["data-selected"] });
    return () => { ro.disconnect(); mo.disconnect(); };
  }, [items.length]);
  return (
    <RACTabs selectedKey={value} defaultSelectedKey={defaultValue ?? items[0]?.id} onSelectionChange={(k) => onChange?.(String(k))} className="pr-tabs">
      <TabList ref={listRef} aria-label={label} className="pr-tablist">
        {items.map((i) => <Tab key={i.id} id={i.id} className="pr-tab">{i.label}</Tab>)}
      </TabList>
      {items.map((i) => <TabPanel key={i.id} id={i.id} className="pr-tabpanel">{i.content}</TabPanel>)}
    </RACTabs>
  );
}

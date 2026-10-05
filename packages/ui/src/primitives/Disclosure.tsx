import { ChevronDownIcon } from "../icons";
import type { ReactNode } from "react";
import { Button, Disclosure as RACDisclosure, DisclosurePanel, Heading } from "react-aria-components";

/** Disclosure: secondary detail that most people do not need. Collapsed by default; the panel opens with a smooth height animation. */
export function Disclosure({ title, children, defaultExpanded = false }: { title: string; children: ReactNode; defaultExpanded?: boolean }) {
  return (
    <RACDisclosure className="pr-disclosure" defaultExpanded={defaultExpanded}>
      <Heading level={3} className="pr-disclosure__h"><Button slot="trigger" className="pr-disclosure__btn"><span>{title}</span><ChevronDownIcon aria-hidden className="pr-disclosure__chev" /></Button></Heading>
      <DisclosurePanel className="pr-disclosure__panel"><div className="pr-disclosure__inner">{children}</div></DisclosurePanel>
    </RACDisclosure>
  );
}

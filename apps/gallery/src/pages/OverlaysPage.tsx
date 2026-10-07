import { useState } from "react";
import { Rules } from "../doc/Doc";
import { Button, Cluster, Note, Page, PageHeader, Section, SlideGroup, SlideOver, Tooltip, toast } from "@proshore/ui";

export function OverlaysPage() {
  const [open, setOpen] = useState(false);
  return (
    <Page>
      <PageHeader eyebrow="Components" title="Overlays and menus" description="The account menu is in the header: appearance, switch account, sign out. Details open in a slide-over so people keep their place in the list." />
      <Section>
        <Cluster><Button onClick={() => setOpen(true)}>Open slide-over</Button><Tooltip content="Tooltips repeat, never replace, a visible label."><Button variant="outline">Hover or focus me</Button></Tooltip><Button variant="soft" onClick={() => toast.show("Copied (demo)", { tone: "success" })}>Toast</Button></Cluster>
        <Note tone="info">Esc closes the slide-over, focus returns to the button that opened it.</Note>
        <Rules dos={["Give the slide-over previous and next when it opens from a list.", "Use a toast only for events that pass: saved, sent, marked.", "Keep the primary action in the slide-over footer."]} donts={["Do not put anything a person must read only in a toast: it disappears.", "Do not stack a second slide-over on top of the first.", "Do not use tabs to move to a different item: use links."]} />
      </Section>
      <SlideOver open={open} onOpenChange={setOpen} eyebrow="REQ-204" title="Laptop replacement" footer={<Button onClick={() => setOpen(false)}>Done</Button>}>
        <SlideGroup title="Details"><p>Requested by Alex Voorbeeld. Waiting for approval.</p></SlideGroup>
      </SlideOver>
    </Page>
  );
}

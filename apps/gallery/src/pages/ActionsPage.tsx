import { useState } from "react";
import { ArrowRightIcon, Button, Checkbox, Cluster, DownloadIcon, IconButton, Page, PageHeader, Stack, Text, Tooltip } from "@proshore/ui";
import { Demo } from "../doc/Doc";

export function ActionsPage() {
  const [compare, setCompare] = useState(false);
  return (
    <Page>
      <PageHeader eyebrow="Components" title="Actions" description="Buttons and links. One primary action per view; secondary for alternatives, quiet for low emphasis. Pills, sentence case, verbs."
        actions={<Checkbox isSelected={compare} onChange={setCompare}>Compare light and dark</Checkbox>} />
      <Demo compare={compare} title="Hierarchy" use="Solid is the one thing you most want people to do. Outline is the alternative. Ghost is for dismissing and low emphasis."
        dos={["Say what happens: “Confirm mapping”, not “OK”.", "Disable with a visible reason next to it, never hide the action.", "Keep the primary action on the right in a footer, and Cancel before it."]}
        donts={["Do not put two primary buttons in one view.", "Do not use colour alone to mark a destructive action: say so in the label.", "Do not use a button to navigate: use a link."]}>
        <Stack gap={3}>
          <Cluster gap={3}><Button variant="solid">Confirm mapping <ArrowRightIcon aria-hidden /></Button><Button variant="outline">Add context</Button><Button variant="soft">Save draft</Button><Button variant="ghost">Dismiss</Button><Button variant="solid" disabled>Publish to customer</Button></Cluster>
          <Text size="1" color="gray">Solid · Outline · Soft · Ghost · Disabled. Publishing is disabled until coverage is reviewed.</Text>
        </Stack>
      </Demo>
      <Demo compare={compare} title="Sizes" use="Size 2 is the default. Size 1 for dense toolbars and cards, size 3 for hero actions."
        dos={["Keep one size within a group of buttons."]} donts={["Do not mix sizes to show importance: use the variant."]}>
        <Cluster gap={3}><Button size="1">Small</Button><Button size="2">Medium</Button><Button size="3">Large</Button></Cluster>
      </Demo>
      <Demo compare={compare} title="Icon buttons" use="For actions everyone knows. Always carry an aria-label, and add a tooltip when the icon is not obvious."
        dos={["Give every icon-only button an aria-label.", "Use a tooltip that repeats the label."]} donts={["Do not use an icon alone for a rare or destructive action."]}>
        <Cluster gap={3}><Tooltip content="Download"><IconButton variant="soft" aria-label="Download"><DownloadIcon /></IconButton></Tooltip><IconButton variant="ghost" aria-label="Download (quiet)"><DownloadIcon /></IconButton><IconButton variant="outline" aria-label="Download (outline)"><DownloadIcon /></IconButton></Cluster>
      </Demo>
      <Demo compare={compare} title="Links" use="Links go somewhere; buttons do something. A Button with an href renders a real link."
        dos={["Use a link for navigation, so it can be opened in a new tab."]} donts={["Do not style a link as plain text without an underline or other cue."]}>
        <Cluster gap={3}><Button variant="soft" href="#/foundations">Open Foundations <ArrowRightIcon aria-hidden /></Button><a href="#/forms">A text link</a></Cluster>
      </Demo>
    </Page>
  );
}

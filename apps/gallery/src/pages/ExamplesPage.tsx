import { Page, PageHeader, Tabs } from "@proshore/ui";
import { BugReport } from "../examples/BugReport";
import { CardBoard } from "../examples/CardBoard";
import { Kanban } from "../examples/Kanban";
import { UserManagement } from "../examples/UserManagement";

/** Whole screens for typical internal business apps, each with a note on when to use it. All data is fictional. */
export function ExamplesPage() {
  return (
    <Page>
      <PageHeader eyebrow="Templates" title="Examples" description="Typical internal-app screens, built only from the design system. Copy the one that is closest to what you are building." />
      <Tabs label="Example screens" items={[
        { id: "users", label: "User management", content: <UserManagement /> },
        { id: "kanban", label: "Kanban board", content: <Kanban /> },
        { id: "cards", label: "Card board", content: <CardBoard /> },
        { id: "bugs", label: "Bug reporting", content: <BugReport /> },
      ]} />
    </Page>
  );
}

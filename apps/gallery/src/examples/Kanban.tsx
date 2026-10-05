import { useState } from "react";
import { Badge, KanbanBoard, Text } from "@proshore/ui";
import { Usage } from "./Usage";

const cols = [{ id: "todo", label: "To do" }, { id: "doing", label: "In progress" }, { id: "done", label: "Done" }];
type Task = { id: string; title: string; owner: string; col: string; tag: string };
const start: Task[] = [
  { id: "t1", title: "Collect Q3 vendor contracts", owner: "Alex", col: "todo", tag: "Finance" },
  { id: "t2", title: "Review access list", owner: "Sam", col: "doing", tag: "Security" },
  { id: "t3", title: "Update onboarding checklist", owner: "Robin", col: "doing", tag: "People" },
  { id: "t4", title: "Close September books", owner: "Kim", col: "done", tag: "Finance" },
];

export function Kanban() {
  const [tasks, setTasks] = useState(start);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Usage when="Work that moves through stages: tasks, approvals, onboarding, bug triage." parts={["KanbanBoard", "Badge", "SlideOver for the detail"]}
        rules={["The board always offers a way to move a card that is not dragging (a select on each card).", "The move is announced to screen readers.", "A count per column and an empty message for empty columns."]} />
      <KanbanBoard label="Tasks" columns={cols} items={tasks} getId={(t) => t.id} getColumn={(t) => t.col} cardLabel={(t) => t.title}
        onMove={(id, col) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, col } : t)))}
        renderCard={(t) => (<><p style={{ margin: 0, fontSize: 14 }}>{t.title}</p><Text size="1" color="gray">{t.owner} · <Badge>{t.tag}</Badge></Text></>)} />
    </div>
  );
}

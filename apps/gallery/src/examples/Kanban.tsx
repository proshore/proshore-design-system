import { useState } from "react";
import { Badge, Note, Select, Text } from "@proshore/ui";
import { Usage } from "./Usage";

const cols = [{ id: "todo", label: "To do" }, { id: "doing", label: "In progress" }, { id: "done", label: "Done" }] as const;
type Col = (typeof cols)[number]["id"];
type Task = { id: string; title: string; owner: string; col: Col; tag: string };
const start: Task[] = [
  { id: "t1", title: "Collect Q3 vendor contracts", owner: "Alex", col: "todo", tag: "Finance" },
  { id: "t2", title: "Review access list", owner: "Sam", col: "doing", tag: "Security" },
  { id: "t3", title: "Update onboarding checklist", owner: "Robin", col: "doing", tag: "People" },
  { id: "t4", title: "Close September books", owner: "Kim", col: "done", tag: "Finance" },
];

/** Moving a card uses a labelled Select, so it works with keyboard and screen readers. Drag and drop is not included; add it only as an extra, never as the only way. */
export function Kanban() {
  const [tasks, setTasks] = useState(start);
  const [said, setSaid] = useState("");
  const move = (id: string, col: string) => setTasks((ts) => ts.map((t) => { if (t.id !== id) return t; setSaid(`${t.title} moved to ${cols.find((c) => c.id === col)?.label}`); return { ...t, col: col as Col }; }));
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Usage when="Work that moves through stages: tasks, approvals, onboarding, bug triage." parts={["Card-like panels", "Badge", "Select", "Note live"]}
        rules={["One accessible way to move a card that is not dragging (here: a Select).", "Announce the move in a live region.", "Show a count per column and an empty state for empty columns."]} />
      <p role="status" className="sr-skip">{said}</p>
      <div className="kb">
        {cols.map((c) => {
          const items = tasks.filter((t) => t.col === c.id);
          return (
            <section key={c.id} className="kb__col" aria-labelledby={`kb-${c.id}`}>
              <h3 id={`kb-${c.id}`}>{c.label} <Badge>{items.length}</Badge></h3>
              {items.length === 0 && <Text size="2" color="gray">Nothing here.</Text>}
              {items.map((t) => (
                <article key={t.id} className="kb__card">
                  <p>{t.title}</p>
                  <Text size="1" color="gray">{t.owner} · {t.tag}</Text>
                  <Select label={`Move ${t.title}`} hideLabel size="1" value={t.col} onChange={(v) => move(t.id, v)} options={cols.map((x) => ({ value: x.id, label: x.label }))} />
                </article>
              ))}
            </section>
          );
        })}
      </div>
      <Note tone="info">Drag and drop is a nice extra, but the Select above is the part that must always work.</Note>
    </div>
  );
}

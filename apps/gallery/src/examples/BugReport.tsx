import { useState } from "react";
import { Badge, Button, DataTable, Note, Page, Panel, Select, SlideOver, Stack, TextArea, TextField, Timeline, toast } from "@proshore/ui";
import type { ColumnDef } from "@proshore/ui";
import { Usage } from "./Usage";

type Bug = { id: string; title: string; severity: "Critical" | "High" | "Normal"; status: "New" | "Triaged" | "Fixed"; reporter: string };
const bugs: Bug[] = [
  { id: "BUG-12", title: "Export button does nothing on Safari", severity: "High", status: "New", reporter: "Alex" },
  { id: "BUG-11", title: "Wrong total on order with discount", severity: "Critical", status: "Triaged", reporter: "Sam" },
  { id: "BUG-9", title: "Typo in the welcome email", severity: "Normal", status: "Fixed", reporter: "Robin" },
];
const tone = { Critical: "red", High: "amber", Normal: "gray" } as const;
const columns: ColumnDef<Bug>[] = [
  { id: "id", header: "Bug", sticky: true, accessor: (r) => r.id },
  { id: "title", header: "Title", accessor: (r) => r.title },
  { id: "severity", header: "Severity", accessor: (r) => r.severity, filter: { kind: "select" }, cell: (r) => <Badge color={tone[r.severity]}>{r.severity}</Badge> },
  { id: "status", header: "Status", accessor: (r) => r.status, filter: { kind: "select" } },
  { id: "reporter", header: "Reported by", accessor: (r) => r.reporter },
];

export function BugReport() {
  const [sel, setSel] = useState<Bug | null>(null);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Usage when="Reporting and triaging problems in an internal app." parts={["TextField", "TextArea", "Select", "DataTable", "SlideOver", "Timeline", "Note"]}
        rules={["Ask for what happened, what was expected and steps to reproduce; not for a diagnosis.", "Show the error next to the field and say how to fix it.", "Severity is the reporter's view until someone triages it; label it that way."]} />
      <Panel title="Report a bug">
        <Stack gap={4}>
          <TextField label="Short title" value={title} onChange={setTitle} error={error} isRequired />
          <TextArea label="What happened, and what did you expect?" description="Include the steps, so someone else can repeat it." />
          <Select label="How bad is it, in your view?" value="Normal" onChange={() => undefined} options={["Critical", "High", "Normal"].map((v) => ({ value: v, label: v }))} />
          <div><Button onClick={() => { if (!title.trim()) { setError("Give the bug a short title."); return; } setError(""); setTitle(""); toast.show("Bug reported (demo)", { tone: "success" }); }}>Send report</Button></div>
        </Stack>
      </Panel>
      <DataTable caption="Bugs" noun="bugs" columns={columns} rows={bugs} getRowId={(r) => r.id} rowLabel={(r) => r.id} onRowOpen={(r) => setSel(r)} />
      <SlideOver open={!!sel} onOpenChange={(o) => !o && setSel(null)} eyebrow={sel?.id ?? ""} title={sel?.title ?? ""}>
        <Note tone="info">Severity “{sel?.severity}” is as reported, not yet confirmed by triage.</Note>
        <Timeline entries={[{ id: "1", when: "Today 09:12", actor: sel?.reporter ?? "", text: "Reported the bug" }, { id: "2", when: "Today 10:03", actor: "System", text: "Added to the triage queue", kind: "system" }]} />
      </SlideOver>
    </div>
  );
}

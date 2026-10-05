import { useState } from "react";
import { Button, Cluster, ConfirmDialog, FileDropzone, KanbanBoard, ModalDialog, Note, Page, PageHeader, Pagination, Section, StatusPage, TextField, toast } from "@proshore/ui";
import type { StatusKind } from "@proshore/ui";

const kinds: { kind: StatusKind; label: string }[] = [{ kind: "forbidden", label: "No access (403)" }, { kind: "not-found", label: "Not found (404)" }, { kind: "error", label: "Server error (500)" }, { kind: "session-expired", label: "Session expired (401)" }, { kind: "offline", label: "Offline" }];
const cols = [{ id: "todo", label: "To do" }, { id: "doing", label: "In progress" }, { id: "done", label: "Done" }];
type Task = { id: string; title: string; col: string };

export function DialogsPage() {
  const [confirm, setConfirm] = useState(false);
  const [danger, setDanger] = useState(false);
  const [form, setForm] = useState(false);
  const [page, setPage] = useState(0);
  const [files, setFiles] = useState<string[]>([]);
  const [kind, setKind] = useState<StatusKind>("forbidden");
  const [tasks, setTasks] = useState<Task[]>([{ id: "a", title: "Review access list", col: "todo" }, { id: "b", title: "Update checklist", col: "doing" }]);
  return (
    <Page>
      <PageHeader eyebrow="Components" title="Dialogs, status pages and boards" description="Things that stop the person, collect files, split a long list, or move work between stages." />
      <Section title="Dialogs" description="One decision per dialog. The confirm button repeats the action, never just OK.">
        <Cluster>
          <Button variant="outline" onClick={() => setConfirm(true)}>Confirm</Button>
          <Button variant="outline" onClick={() => setDanger(true)}>Confirm (cannot be undone)</Button>
          <Button variant="outline" onClick={() => setForm(true)}>Small form</Button>
        </Cluster>
        <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Send the report to the customer?" description="They get an email with a link. You can still edit it afterwards." confirmLabel="Send report" onConfirm={() => { setConfirm(false); toast.show("Sent (demo)", { tone: "success" }); }} />
        <ConfirmDialog open={danger} onOpenChange={setDanger} tone="danger" title="Suspend Kim Demo?" description="They lose access immediately. Their work stays and you can restore access later." confirmLabel="Suspend access" onConfirm={() => { setDanger(false); toast.show("Suspended (demo)", { tone: "warning" }); }} />
        <ModalDialog open={form} onOpenChange={setForm} title="Rename engagement" footer={<><Button variant="outline" onClick={() => setForm(false)}>Cancel</Button><Button onClick={() => setForm(false)}>Save</Button></>}>
          <TextField label="Name" defaultValue="Ordering landscape" />
        </ModalDialog>
      </Section>
      <Section title="Pagination">
        <Pagination page={page} pageCount={8} onPageChange={setPage} range={`${page * 10 + 1}-${page * 10 + 10} of 80`} label="Example pagination" />
      </Section>
      <Section title="File dropzone" description="Say what is allowed up front; check again on the server.">
        <FileDropzone label="Upload a CSV" accept={[".csv"]} description="CSV, up to 5 MB." onFiles={(f) => setFiles(f.map((x) => x.name))} />
        {files.length > 0 && <Note tone="success" live>Selected: {files.join(", ")}</Note>}
      </Section>
      <Section title="Kanban board">
        <KanbanBoard label="Tasks" columns={cols} items={tasks} getId={(t) => t.id} getColumn={(t) => t.col} cardLabel={(t) => t.title} renderCard={(t) => <p style={{ margin: 0 }}>{t.title}</p>} onMove={(id, col) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, col } : t)))} />
      </Section>
      <Section title="Status pages" description="Shown in the page area, inside the shell. Pick one:">
        <Cluster>{kinds.map((k) => <Button key={k.kind} variant={kind === k.kind ? "solid" : "outline"} onClick={() => setKind(k.kind)}>{k.label}</Button>)}</Cluster>
        <div style={{ border: "1px solid var(--sherpa-line)", borderRadius: 16, overflow: "hidden" }}>
          <StatusPage kind={kind} reference="REQ-7F3A" actions={<><Button variant="outline">Go back</Button><Button>{kind === "session-expired" ? "Sign in again" : "Back to the start"}</Button></>} />
        </div>
      </Section>
    </Page>
  );
}

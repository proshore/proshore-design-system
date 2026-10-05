import { useState } from "react";
import { Avatar, Badge, Button, DataTable, Note, Select, SlideOver, TextField, toast } from "@proshore/ui";
import type { ColumnDef } from "@proshore/ui";
import { Usage } from "./Usage";

type Person = { id: string; name: string; email: string; role: "Admin" | "Member" | "Viewer"; status: "Active" | "Invited" | "Suspended" };
const people: Person[] = [
  { id: "p1", name: "Alex Voorbeeld", email: "alex@proshore.nl", role: "Admin", status: "Active" },
  { id: "p2", name: "Sam Example", email: "sam@proshore.nl", role: "Member", status: "Active" },
  { id: "p3", name: "Robin Test", email: "robin@proshore.nl", role: "Viewer", status: "Invited" },
  { id: "p4", name: "Kim Demo", email: "kim@proshore.nl", role: "Member", status: "Suspended" },
];
const tone = { Active: "green", Invited: "amber", Suspended: "red" } as const;
const columns: ColumnDef<Person>[] = [
  { id: "name", header: "Person", sticky: true, accessor: (r) => r.name, cell: (r) => <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Avatar name={r.name} size={24} decorative />{r.name}</span> },
  { id: "email", header: "Email", accessor: (r) => r.email },
  { id: "role", header: "Role", accessor: (r) => r.role, filter: { kind: "select" } },
  { id: "status", header: "Status", accessor: (r) => r.status, filter: { kind: "select" }, cell: (r) => <Badge color={tone[r.status]}>{r.status}</Badge> },
];

export function UserManagement() {
  const [sel, setSel] = useState<Person | null>(null);
  const [role, setRole] = useState("Member");
  const [invite, setInvite] = useState(false);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Usage when="Managing who can use an internal app: invite, change role, suspend." parts={["DataTable", "SlideOver", "Select", "TextField", "Badge", "Avatar", "toast"]}
        rules={["Sign-in proves who someone is (Google Workspace). Roles here decide what they can do; keep the two separate.", "Confirm before suspending, and say what changes for the person.", "Never remove the last admin."]} />
      <DataTable caption="People" noun="people" columns={columns} rows={people} getRowId={(r) => r.id} rowLabel={(r) => r.name}
        onRowOpen={(r) => { setSel(r); setRole(r.role); }} toolbarRight={<Button onClick={() => setInvite(true)}>Invite person</Button>} />
      <SlideOver open={!!sel} onOpenChange={(o) => !o && setSel(null)} eyebrow={sel?.email ?? ""} title={sel?.name ?? ""}
        footer={<Button onClick={() => { toast.show("Role updated (demo)", { tone: "success" }); setSel(null); }}>Save</Button>}>
        <Select label="Role" value={role} onChange={setRole} options={["Admin", "Member", "Viewer"].map((v) => ({ value: v, label: v }))} />
        <Note tone="warning">Suspending removes access immediately. Their work stays.</Note>
        <Button variant="outline" onClick={() => toast.show("Suspended (demo)", { tone: "warning" })}>Suspend access</Button>
      </SlideOver>
      <SlideOver open={invite} onOpenChange={setInvite} eyebrow="New" title="Invite a person" footer={<Button onClick={() => { toast.show("Invitation sent (demo)", { tone: "success" }); setInvite(false); }}>Send invitation</Button>}>
        <TextField label="Work email" type="email" description="Only @proshore.nl addresses can sign in." placeholder="name@proshore.nl" />
        <Select label="Role" value="Member" onChange={() => undefined} options={["Admin", "Member", "Viewer"].map((v) => ({ value: v, label: v }))} />
      </SlideOver>
    </div>
  );
}

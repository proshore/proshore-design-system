import type { ColumnDef } from "@proshore/ui";

/** Fictional demo data. No real customers, people or amounts. */
export type Request = { id: string; title: string; team: string; status: "Done" | "In progress" | "Waiting"; due: string };
const teams = ["Finance", "Operations", "People", "IT"];
const titles = ["Laptop replacement", "Access to shared drive", "Travel approval", "New starter setup", "Software licence", "Office supplies"];
export const requests: Request[] = Array.from({ length: 37 }, (_, i) => ({
  id: `REQ-${200 + i}`, title: titles[i % titles.length], team: teams[i % 4],
  status: (["Done", "In progress", "Waiting"] as const)[i % 3], due: `2026-${String(1 + (i % 12)).padStart(2, "0")}-${String(1 + (i % 27)).padStart(2, "0")}`,
}));
export const requestColumns: ColumnDef<Request>[] = [
  { id: "id", header: "Request", sticky: true, accessor: (r) => r.id },
  { id: "title", header: "Title", accessor: (r) => r.title },
  { id: "team", header: "Team", accessor: (r) => r.team, filter: { kind: "multi" } },
  { id: "status", header: "Status", accessor: (r) => r.status, filter: { kind: "select" } },
  { id: "due", header: "Due", accessor: (r) => r.due },
];

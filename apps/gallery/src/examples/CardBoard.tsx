import { useState } from "react";
import { Badge, Button, Card, Grid, SearchField, Text } from "@proshore/ui";
import { Usage } from "./Usage";

const items = [
  { id: "a", title: "Expense claims", text: "Submit and track what you spent.", status: "Live" },
  { id: "b", title: "Leave planner", text: "Request time off and see the team calendar.", status: "Live" },
  { id: "c", title: "Equipment requests", text: "Ask for a laptop, monitor or phone.", status: "Beta" },
  { id: "d", title: "Supplier register", text: "Contracts and renewals in one place.", status: "Soon" },
];

export function CardBoard() {
  const [q, setQ] = useState("");
  const shown = items.filter((i) => (i.title + i.text).toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Usage when="An overview of things people pick from: internal tools, projects, templates, customers." parts={["Grid", "Card", "Badge", "SearchField", "Button"]}
        rules={["Whole card is one clear action; do not nest several links in it.", "Status as text, not colour alone.", "Search when there are more than about eight cards."]} />
      <SearchField label="Search tools" value={q} onChange={setQ} onClear={() => setQ("")} placeholder="Search tools" />
      <Grid min={240} cap={1100}>
        {shown.map((i) => (
          <Card key={i.id}><div style={{ display: "grid", gap: 8 }}><div style={{ display: "flex", justifyContent: "space-between" }}><strong>{i.title}</strong><Badge color={i.status === "Live" ? "green" : "gray"}>{i.status}</Badge></div><Text size="2" color="gray">{i.text}</Text><div><Button variant="outline" size="1" disabled={i.status === "Soon"}>Open</Button></div></div></Card>
        ))}
      </Grid>
      {shown.length === 0 && <Text color="gray">No tools match “{q}”.</Text>}
    </div>
  );
}

import { useState } from "react";
import { Rules } from "../doc/Doc";
import { Button, Checkbox, DateRangePicker, Grid, LocaleProvider, MultiSelect, Page, PageHeader, RadioGroup, SearchField, Section, Select, Stack, Switch, TextArea, TextField, useMessages } from "@proshore/ui";
import type { DateRange } from "@proshore/ui";

const teams = [{ value: "fin", label: "Finance" }, { value: "ops", label: "Operations" }, { value: "hr", label: "People" }];

export function FormsPage() {
  const { locale } = useMessages();
  const [range, setRange] = useState<DateRange>(null);
  const [selected, setSelected] = useState<string[]>(["fin"]);
  const [radio, setRadio] = useState("all");
  const [q, setQ] = useState("");
  return (
    <Page>
      <PageHeader eyebrow="Components" title="Forms" description="Every field has a visible label, a hint when needed, and an error that says how to fix it." />
      <Section title="Fields and states" description="React Aria form primitives with visible labels, descriptions, errors and states. Values are plain strings, so apps never touch library types. Dates are ISO strings; wrap in LocaleProvider for Dutch.">
        <Rules dos={["Give every field a visible label; hide it only for search boxes.", "Say what is wrong and how to fix it, next to the field.", "Show the same field states everywhere: default, focus, error, disabled."]} donts={["Do not use placeholder text instead of a label.", "Do not validate on every keystroke before the person has finished.", "Do not clear what someone typed when there is an error."]} />
        <LocaleProvider locale={locale.startsWith("nl") ? "nl-NL" : "en-GB"}>
          <Grid min={300}>
            <Stack gap={4}>
              <TextField label="Full name" placeholder="Alex Voorbeeld" />
              <TextField label="Email" type="email" description="Use the work address." error="Enter an address like name@proshore.nl." defaultValue="alex@" />
              <TextField label="Disabled" isDisabled defaultValue="Read only" />
              <TextArea label="Description" description="What happened, and what did you expect?" />
              <SearchField label="Search" value={q} onChange={setQ} onClear={() => setQ("")} placeholder="Search" />
            </Stack>
            <Stack gap={4}>
              <Select label="Role" value="member" onChange={() => undefined} options={[{ value: "admin", label: "Admin" }, { value: "member", label: "Member" }, { value: "viewer", label: "Viewer" }]} />
              <MultiSelect label="Teams" options={teams} value={selected} onChange={setSelected} description="Type to filter, Enter to choose." />
              <RadioGroup label="Show" value={radio} onChange={setRadio} options={[{ value: "all", label: "Everything", hint: "Default" }, { value: "mine", label: "Only mine" }]} />
              <Stack gap={2}><Checkbox>Send me a summary</Checkbox><Checkbox defaultSelected>Remember this choice</Checkbox><Switch>Notifications</Switch></Stack>
            </Stack>
            <Stack gap={4}><DateRangePicker label="Period" value={range} onChange={setRange} /><Button>Save</Button></Stack>
          </Grid>
        </LocaleProvider>
      </Section>
    </Page>
  );
}

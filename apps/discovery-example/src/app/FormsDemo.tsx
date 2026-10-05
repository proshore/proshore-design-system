import { useState } from "react";
import { Checkbox, DateRangePicker, LocaleProvider, MultiSelect, RadioGroup, SearchField, Select, Stack, Switch, TextArea, TextField } from "@proshore/ui";
import type { DateRange } from "@proshore/ui";
import { Text } from "@proshore/ui";

const apps = [{ value: "ordering", label: "Ordering" }, { value: "inventory", label: "Inventory" }, { value: "billing", label: "Billing" }];

/** Every form primitive with its states. Demo values only. */
export function FormsDemo() {
  const [range, setRange] = useState<DateRange>(null);
  const [selected, setSelected] = useState<string[]>(["ordering"]);
  const [locale, setLocale] = useState<"en-GB" | "nl-NL">("en-GB");
  const [radio, setRadio] = useState("both");
  const [q, setQ] = useState("");
  return (
    <LocaleProvider locale={locale}>
      <div className="l-grid" style={{ "--l-min": "300px", "--l-gap": "var(--space-5)" } as React.CSSProperties}>
        <Stack gap={4}>
          <TextField label="Repository" description="Use owner/repository. Never paste an access token." placeholder="owner/repository" />
          <TextField label="Repository (with error)" error="Use the form owner/repository." defaultValue="https://token@x" />
          <TextField label="Disabled field" isDisabled defaultValue="Read only in this state" />
          <TextArea label="Business question" description="One concrete question." defaultValue="Can the current ordering landscape support expansion?" />
          <SearchField label="Search findings" hideLabel={false} value={q} onChange={setQ} onClear={() => setQ("")} placeholder="Search findings" />
        </Stack>
        <Stack gap={4}>
          <Select label="Assessment period" value="4w" onChange={() => undefined} options={[{ value: "2w", label: "2 weeks" }, { value: "4w", label: "4 weeks" }, { value: "8w", label: "8 weeks" }]} />
          <MultiSelect label="Applications" options={apps} value={selected} onChange={setSelected} description="Type to filter, choose with Enter." />
          <RadioGroup label="Show" value={radio} onChange={setRadio} options={[{ value: "both", label: "Findings and unknowns", hint: "Default" }, { value: "find", label: "Findings only" }, { value: "unk", label: "Unknowns only" }]} />
          <Stack gap={2}><Checkbox>Include end-of-life components</Checkbox><Checkbox defaultSelected>Include hotspots</Checkbox><Checkbox isDisabled>Disabled option</Checkbox><Switch>Notify me about new scans</Switch></Stack>
        </Stack>
        <Stack gap={4}>
          <DateRangePicker label="Detected between" description={locale === "nl-NL" ? "Nederlandse datums en kalender" : "English dates and calendar"} value={range} onChange={setRange} />
          <RadioGroup label="Language" orientation="horizontal" value={locale} onChange={(v) => setLocale(v as "en-GB" | "nl-NL")} options={[{ value: "en-GB", label: "English" }, { value: "nl-NL", label: "Nederlands" }]} />
          <Text size="2" color="gray">Selected range: {range ? `${range.start} to ${range.end}` : "none"}</Text>
        </Stack>
      </div>
    </LocaleProvider>
  );
}

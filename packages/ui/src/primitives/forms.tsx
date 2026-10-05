import { CalendarIcon, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, Cross2Icon, ExclamationTriangleIcon, MagnifyingGlassIcon } from "../icons";
import { parseDate } from "@internationalized/date";
import { useState, type ReactNode } from "react";
import {
  Button as RACButton, CalendarCell, CalendarGrid, CalendarGridBody, CalendarGridHeader, CalendarHeaderCell, Checkbox as RACCheckbox, ComboBox, DateInput, DateRangePicker as RACDateRangePicker,
  DateSegment, Dialog, FieldError, Group, Heading, I18nProvider, Input, Label, ListBox, ListBoxItem, Popover, Radio, RadioGroup as RACRadioGroup, RangeCalendar, SearchField as RACSearchField,
  Select as RACSelect, SelectValue, Switch as RACSwitch, Tag, TagGroup, TagList, Text, TextArea as RACTextArea, TextField as RACTextField,
} from "react-aria-components";

/**
 * Form primitives (React Aria). Every control has a visible label (or `hideLabel` for a visually hidden one),
 * optional description and error, and exposes state through data attributes. Never rely on placeholder as the label.
 * Errors are text with an icon, never colour alone. Values are plain strings or arrays, so apps never touch React Aria types.
 */
type FieldProps = { label: string; hideLabel?: boolean; description?: ReactNode; error?: string; isRequired?: boolean; isDisabled?: boolean; className?: string; id?: string; name?: string };

function Meta({ label, hideLabel, description, error }: Pick<FieldProps, "label" | "hideLabel" | "description" | "error">) {
  return (
    <>
      <Label className={hideLabel ? "pr-label pr-sr" : "pr-label"}>{label}</Label>
      {description && <Text slot="description" className="pr-hint">{description}</Text>}
      <FieldError className="pr-error"><ExclamationTriangleIcon aria-hidden /> {error}</FieldError>
    </>
  );
}

/**
 * TextField: single-line text input with a visible label, optional description and error text (React Aria). Controlled with `value` and `onChange`, or uncontrolled with `defaultValue`.
 *
 * @example
 * <TextField label="Customer name" value={name} onChange={setName} isRequired error={name ? undefined : "Enter a name"} />
 */
export function TextField({ label, hideLabel, description, error, value, defaultValue, onChange, placeholder, type = "text", isRequired, isDisabled, className, id, name, autoComplete, icon }: FieldProps & {
  value?: string; defaultValue?: string; onChange?: (v: string) => void; placeholder?: string; type?: "text" | "email" | "url" | "tel" | "password" | "number"; autoComplete?: string; icon?: ReactNode;
}) {
  return (
    <RACTextField validationBehavior="aria" className={`pr-field${className ? " " + className : ""}`} value={value} defaultValue={defaultValue} onChange={onChange} isInvalid={!!error} isRequired={isRequired} isDisabled={isDisabled} type={type} id={id} name={name} autoComplete={autoComplete}>
      <Label className={hideLabel ? "pr-label pr-sr" : "pr-label"}>{label}</Label>
      <span className="pr-inputwrap">{icon && <span className="pr-inputwrap__icon" aria-hidden>{icon}</span>}<Input className="pr-input" data-icon={icon ? "" : undefined} placeholder={placeholder} /></span>
      {description && <Text slot="description" className="pr-hint">{description}</Text>}
      <FieldError className="pr-error"><ExclamationTriangleIcon aria-hidden /> {error}</FieldError>
    </RACTextField>
  );
}

/**
 * Multi-line text input with a visible label, same field API as TextField.
 */
export function TextArea({ label, hideLabel, description, error, value, defaultValue, onChange, onKeyDown, placeholder, rows = 3, isRequired, isDisabled, className, id }: FieldProps & { value?: string; defaultValue?: string; onChange?: (v: string) => void; onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number }) {
  return (
    <RACTextField validationBehavior="aria" className={`pr-field${className ? " " + className : ""}`} value={value} defaultValue={defaultValue} onChange={onChange} isInvalid={!!error} isRequired={isRequired} isDisabled={isDisabled} id={id}>
      <Meta label={label} hideLabel={hideLabel} description={undefined} error={undefined} />
      <RACTextArea className="pr-input pr-textarea" rows={rows} placeholder={placeholder} onKeyDown={onKeyDown} />
      {description && <Text slot="description" className="pr-hint">{description}</Text>}
      <FieldError className="pr-error"><ExclamationTriangleIcon aria-hidden /> {error}</FieldError>
    </RACTextField>
  );
}

/** Search with a built-in clear button; Esc clears. Wrap it in `role="search"` when it filters a list. */
export function SearchField({ label, hideLabel = true, value, onChange, onClear, placeholder, className, id }: { label: string; hideLabel?: boolean; value?: string; onChange?: (v: string) => void; onClear?: () => void; placeholder?: string; className?: string; id?: string }) {
  return (
    <RACSearchField className={`pr-field pr-search${className ? " " + className : ""}`} value={value} onChange={onChange} onClear={onClear} id={id}>
      <Label className={hideLabel ? "pr-label pr-sr" : "pr-label"}>{label}</Label>
      <span className="pr-inputwrap"><span className="pr-inputwrap__icon" aria-hidden><MagnifyingGlassIcon /></span>
        <Input className="pr-input" data-icon="" placeholder={placeholder} />
        <RACButton className="pr-search__clear" aria-label="Clear search"><Cross2Icon aria-hidden /></RACButton></span>
    </RACSearchField>
  );
}

/**
 * Checkbox with a visible label (React Aria). Controlled with `isSelected` and `onChange`.
 */
export function Checkbox({ children, isSelected, defaultSelected, onChange, isDisabled, isIndeterminate, className, "aria-label": ariaLabel, id }: {
  children?: ReactNode; isSelected?: boolean; defaultSelected?: boolean; onChange?: (v: boolean) => void; isDisabled?: boolean; isIndeterminate?: boolean; className?: string; "aria-label"?: string; id?: string;
}) {
  return (
    <RACCheckbox className={`pr-check${className ? " " + className : ""}`} isSelected={isSelected} defaultSelected={defaultSelected} onChange={onChange} isDisabled={isDisabled} isIndeterminate={isIndeterminate} aria-label={ariaLabel} id={id}>
      {({ isSelected: on, isIndeterminate: ind }) => (<><span className="pr-check__box" aria-hidden>{ind ? <span className="pr-check__dash" /> : on ? <CheckIcon /> : null}</span>{children && <span className="pr-check__label">{children}</span>}</>)}
    </RACCheckbox>
  );
}

/**
 * On/off switch with a visible label (React Aria).
 */
export function Switch({ children, isSelected, onChange, isDisabled }: { children: ReactNode; isSelected?: boolean; onChange?: (v: boolean) => void; isDisabled?: boolean }) {
  return (<RACSwitch className="pr-switch" isSelected={isSelected} onChange={onChange} isDisabled={isDisabled}><span className="pr-switch__track" aria-hidden><span className="pr-switch__thumb" /></span><span>{children}</span></RACSwitch>);
}

/**
 * Radio group with a visible label; `options` are { value, label }.
 */
export function RadioGroup({ label, hideLabel, description, value, onChange, options, orientation = "vertical", isDisabled, className }: {
  label: string; hideLabel?: boolean; description?: ReactNode; value?: string; onChange?: (v: string) => void; options: { value: string; label: ReactNode; hint?: ReactNode }[]; orientation?: "vertical" | "horizontal"; isDisabled?: boolean; className?: string;
}) {
  return (
    <RACRadioGroup className={`pr-field${className ? " " + className : ""}`} value={value} onChange={onChange} orientation={orientation} isDisabled={isDisabled}>
      <Label className={hideLabel ? "pr-label pr-sr" : "pr-label"}>{label}</Label>
      {description && <Text slot="description" className="pr-hint">{description}</Text>}
      <div className="pr-radios" data-orientation={orientation}>
        {options.map((o) => (<Radio key={o.value} value={o.value} className="pr-radio"><span className="pr-radio__dot" aria-hidden /><span className="pr-radio__text">{o.label}{o.hint && <span className="pr-hint">{o.hint}</span>}</span></Radio>))}
      </div>
    </RACRadioGroup>
  );
}

export type Option = { value: string; label: string };

/**
 * Select: pick one option from a list (React Aria), with a visible label. `options` are { value, label }; `onChange` gives the chosen value.
 *
 * @example
 * <Select label="Environment" options={[{ value: "prod", label: "Production" }, { value: "test", label: "Test" }]} value={env} onChange={setEnv} />
 */
export function Select({ label, hideLabel, description, error, options, value, onChange, placeholder = "Select", isDisabled, isRequired, className, size = "2" }: FieldProps & {
  options: Option[]; value?: string | null; onChange?: (v: string) => void; placeholder?: string; size?: "1" | "2";
}) {
  return (
    <RACSelect validationBehavior="aria" className={`pr-field${className ? " " + className : ""}`} selectedKey={value ?? null} onSelectionChange={(k) => k !== null && onChange?.(String(k))} placeholder={placeholder} isDisabled={isDisabled} isRequired={isRequired} isInvalid={!!error}>
      <Label className={hideLabel ? "pr-label pr-sr" : "pr-label"}>{label}</Label>
      <RACButton className="pr-input pr-select" data-size={size}><SelectValue className="pr-select__value">{({ selectedText, isPlaceholder }) => (isPlaceholder ? placeholder : selectedText)}</SelectValue><ChevronDownIcon aria-hidden /></RACButton>
      {description && <Text slot="description" className="pr-hint">{description}</Text>}
      <FieldError className="pr-error"><ExclamationTriangleIcon aria-hidden /> {error}</FieldError>
      <Popover className="pr-popover pr-select-pop"><ListBox className="pr-menu">{options.map((o) => (<ListBoxItem key={o.value} id={o.value} textValue={o.label} className="pr-menu__item"><span className="pr-menu__check" aria-hidden><SelectedMark id={o.value} value={value} /></span>{o.label}</ListBoxItem>))}</ListBox></Popover>
    </RACSelect>
  );
}
const SelectedMark = ({ id, value }: { id: string; value?: string | null }) => (id === value ? <CheckIcon /> : null);

/** Multi-select with type-ahead and removable tags. React Aria has no multiple mode, so it is a ComboBox plus a TagGroup. */
export function MultiSelect({ label, hideLabel, description, options, value, onChange, placeholder = "Type to filter", className }: {
  label: string; hideLabel?: boolean; description?: ReactNode; options: Option[]; value: string[]; onChange: (v: string[]) => void; placeholder?: string; className?: string;
}) {
  const [input, setInput] = useState("");
  const items = options.filter((o) => !value.includes(o.value) && o.label.toLowerCase().includes(input.trim().toLowerCase()));
  return (
    <div className={`pr-field${className ? " " + className : ""}`}>
      <ComboBox className="pr-field" inputValue={input} onInputChange={setInput} selectedKey={null} allowsEmptyCollection menuTrigger="focus"
        onSelectionChange={(k) => { if (k !== null) { onChange([...value, String(k)]); setInput(""); } }}>
        <Label className={hideLabel ? "pr-label pr-sr" : "pr-label"}>{label}</Label>
        <span className="pr-inputwrap"><Input className="pr-input" placeholder={placeholder} /><RACButton className="pr-combo__btn" aria-label={`Show ${label} options`}><ChevronDownIcon aria-hidden /></RACButton></span>
        {description && <Text slot="description" className="pr-hint">{description}</Text>}
        <Popover className="pr-popover pr-select-pop">
          <ListBox className="pr-menu" items={items} renderEmptyState={() => <div className="pr-menu__empty">{options.length === value.length ? "All selected" : "No matches"}</div>}>
            {(o) => <ListBoxItem id={o.value} textValue={o.label} className="pr-menu__item">{o.label}</ListBoxItem>}
          </ListBox>
        </Popover>
      </ComboBox>
      {value.length > 0 && (
        <TagGroup aria-label={`Selected: ${label}`} onRemove={(keys) => onChange(value.filter((v) => !keys.has(v)))}>
          <TagList className="pr-tags">{value.map((v) => (<Tag key={v} id={v} textValue={options.find((o) => o.value === v)?.label} className="pr-tag">{options.find((o) => o.value === v)?.label ?? v}<RACButton slot="remove" className="pr-tag__x" aria-label={`Remove ${options.find((o) => o.value === v)?.label ?? v}`}><Cross2Icon aria-hidden /></RACButton></Tag>))}</TagList>
        </TagGroup>
      )}
    </div>
  );
}

/** Date range as two segmented date fields plus a calendar. Values are ISO dates (yyyy-mm-dd). Wrap the app in LocaleProvider for Dutch. */
export type DateRange = { start: string; end: string } | null;
/**
 * Date range as two segmented date fields with a calendar; `value` is { start, end } or null.
 */
export function DateRangePicker({ label, hideLabel, description, value, onChange, className }: { label: string; hideLabel?: boolean; description?: ReactNode; value: DateRange; onChange: (v: DateRange) => void; className?: string }) {
  return (
    <RACDateRangePicker className={`pr-field${className ? " " + className : ""}`} value={value ? { start: parseDate(value.start), end: parseDate(value.end) } : null}
      onChange={(r) => onChange(r ? { start: r.start.toString(), end: r.end.toString() } : null)}>
      <Label className={hideLabel ? "pr-label pr-sr" : "pr-label"}>{label}</Label>
      <Group className="pr-input pr-dates">
        <DateInput slot="start" className="pr-dateinput">{(s) => <DateSegment segment={s} className="pr-seg" />}</DateInput>
        <span aria-hidden className="pr-dates__sep">–</span>
        <DateInput slot="end" className="pr-dateinput">{(s) => <DateSegment segment={s} className="pr-seg" />}</DateInput>
        <RACButton className="pr-dates__btn" aria-label="Open calendar"><CalendarIcon aria-hidden /></RACButton>
      </Group>
      {description && <Text slot="description" className="pr-hint">{description}</Text>}
      <Popover className="pr-popover">
        <Dialog className="pr-cal">
          <RangeCalendar>
            <header className="pr-cal__head"><RACButton slot="previous" className="pr-cal__nav"><ChevronLeftIcon aria-hidden /></RACButton><Heading className="pr-cal__title" /><RACButton slot="next" className="pr-cal__nav"><ChevronRightIcon aria-hidden /></RACButton></header>
            <CalendarGrid className="pr-cal__grid"><CalendarGridHeader>{(d) => <CalendarHeaderCell className="pr-cal__dow">{d}</CalendarHeaderCell>}</CalendarGridHeader><CalendarGridBody>{(date) => <CalendarCell date={date} className="pr-cal__cell" />}</CalendarGridBody></CalendarGrid>
          </RangeCalendar>
        </Dialog>
      </Popover>
    </RACDateRangePicker>
  );
}

/** Sets locale for dates, numbers and screen-reader strings inside it, for example "nl-NL" or "en-GB". */
export const LocaleProvider = I18nProvider;

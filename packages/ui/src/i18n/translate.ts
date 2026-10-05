import { formatMessage, type Vars } from "./format";
import { messages, type Locale, type Messages, type PartialMessages } from "./messages";

type Paths<T, P extends string = ""> = { [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Paths<T[K], `${P}${K}.`> }[keyof T & string];
/** Dotted key of a message, for example "pagination.previous". */
export type MessageKey = Paths<Messages>;
export type Translate = (key: MessageKey, vars?: Vars) => string;
/** Like Translate, but returns the text with every variable as its own text node, so DOM and glyph layout match JSX such as `{a} of {b}`. For visible text only; no plurals. */
export type TranslateNodes = (key: MessageKey, vars?: Vars) => (string | number)[];

/** The catalogue language for a BCP 47 tag: "nl-NL" gives "nl"; anything without a catalogue falls back to English. */
export function languageOf(locale: string | undefined): Locale {
  const base = (locale ?? "en").toLowerCase().split(/[-_]/)[0];
  return base in messages ? (base as Locale) : "en";
}

/** Catalogue for a language with the app's partial overrides on top. Overrides never remove keys. */
export function resolveMessages(locale: string | undefined, overrides?: PartialMessages): Messages {
  const base = messages[languageOf(locale)];
  if (!overrides) return base;
  const out: Record<string, Record<string, string>> = {};
  for (const group of Object.keys(base) as (keyof Messages)[]) out[group] = { ...base[group], ...(overrides[group] as Record<string, string> | undefined) };
  return out as unknown as Messages;
}

export function createTranslate(catalogue: Messages, locale = "en"): Translate {
  return (key, vars) => {
    const [group, name] = key.split(".") as [keyof Messages, string];
    const text = (catalogue[group] as Record<string, string>)[name];
    return formatMessage(text, vars, locale);
  };
}

export function createTranslateNodes(catalogue: Messages, locale = "en"): TranslateNodes {
  return (key, vars = {}) => {
    const marked = Object.fromEntries(Object.keys(vars).map((k) => [k, `\uE000${k}\uE001`]));
    const [group, name] = key.split(".") as [keyof Messages, string];
    const text = formatMessage((catalogue[group] as Record<string, string>)[name], marked, locale);
    return text.split(/\uE000([^\uE001]*)\uE001/).map((part, i) => (i % 2 ? vars[part] : part)).filter((p) => p !== "");
  };
}

/** English translator, used when there is no provider and by helpers that run outside React. */
export const englishT: Translate = createTranslate(messages.en, "en");

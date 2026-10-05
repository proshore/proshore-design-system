import { createContext, useContext, useMemo, type ReactNode } from "react";
import { I18nProvider as AriaLocaleProvider } from "react-aria-components";
import type { Messages, PartialMessages } from "./messages";
import { createTranslate, createTranslateNodes, englishT, languageOf, resolveMessages, type Translate, type TranslateNodes } from "./translate";

export type I18n = {
  /** The locale tag in use, for example "nl-NL". */ locale: string;
  /** Translate a built-in message: `t("pagination.page", { page: 1, pageCount: 4 })`. */ t: Translate;
  /** Same as `t`, returning text nodes with the variables separate (use for visible text with numbers). */ tn: TranslateNodes;
  /** The resolved catalogue (overrides applied). */ messages: Messages;
  /** @internal The overrides in effect, so a nested provider keeps the app's wording. */ overrides?: PartialMessages;
};

const fallback: I18n = { locale: "en", t: englishT, tn: createTranslateNodes(resolveMessages("en")), messages: resolveMessages("en") };
function merge(a?: PartialMessages, b?: PartialMessages): PartialMessages | undefined {
  if (!a || !b) return a ?? b;
  const out: Record<string, Record<string, string> | undefined> = { ...a };
  for (const k of Object.keys(b)) out[k] = { ...out[k], ...(b as Record<string, Record<string, string>>)[k] };
  return out as PartialMessages;
}
const Ctx = createContext<I18n>(fallback);

/**
 * Sets the language of the design system's built-in text and the locale of dates and numbers (React Aria) for everything inside it.
 * `locale` is a BCP 47 tag ("en", "nl", "nl-NL"); languages without a catalogue show English. `messages` overrides single strings
 * for the app (a nested provider keeps them), for example `messages={{ pagination: { label: "Pages" } }}`. Without a provider everything is English.
 */
export function I18nProvider({ locale = "en", messages, children }: { locale?: string; messages?: PartialMessages; children: ReactNode }) {
  const parent = useContext(Ctx).overrides;
  const value = useMemo<I18n>(() => {
    const overrides = merge(parent, messages);
    const catalogue = resolveMessages(languageOf(locale), overrides);
    return { locale, messages: catalogue, overrides, t: createTranslate(catalogue, locale), tn: createTranslateNodes(catalogue, locale) };
  }, [locale, messages, parent]);
  return <Ctx.Provider value={value}><AriaLocaleProvider locale={locale}>{children}</AriaLocaleProvider></Ctx.Provider>;
}

/** The current language's strings: `const { t } = useMessages();`. English without a provider. */
export function useMessages(): I18n { return useContext(Ctx); }

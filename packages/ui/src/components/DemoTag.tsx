/** Marks invented content. Used on every fixture-derived block. */
import { useMessages } from "../i18n/I18nProvider";

export function DemoTag({ children }: { children?: string }) {
  const { t } = useMessages();
  return <span className="sherpa-demo-tag" style={{ fontSize: "var(--font-size-1)", color: "var(--gray-11)" }}>{children ?? t("common.demoData")}</span>;
}

import { MagnifyingGlassIcon } from "../icons";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useMessages } from "../i18n/I18nProvider";

export type Command = { id: string; label: string; group: string; hint?: string; run: () => void };

/**
 * Jump to anything: pages, apps, records. Opens with Ctrl or Cmd+K. Built as an ARIA combobox: the input keeps focus,
 * arrows move the highlighted option (aria-activedescendant), Enter runs it, Esc closes.
 */
export function CommandPalette({ open, onOpenChange, commands, placeholder: placeholderProp }: { open: boolean; onOpenChange: (o: boolean) => void; commands: Command[]; placeholder?: string }) {
  const { t, tn } = useMessages();
  const placeholder = placeholderProp ?? t("command.placeholder");
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const hits = useMemo(() => {
    const n = q.trim().toLowerCase();
    return commands.filter((c) => !n || `${c.label} ${c.group} ${c.hint ?? ""}`.toLowerCase().includes(n)).slice(0, 10);
  }, [q, commands]);
  useEffect(() => { if (open) { setQ(""); setI(0); } }, [open]);
  useEffect(() => setI(0), [q]);
  useEffect(() => { listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" }); }, [i]);
  const run = (c: Command) => { onOpenChange(false); c.run(); };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(hits.length - 1, x + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
    else if (e.key === "Enter" && hits[i]) { e.preventDefault(); run(hits[i]); }
  };
  return (
    <ModalOverlay isOpen={open} onOpenChange={onOpenChange} isDismissable className="pr-cmd-overlay">
      <Modal className="pr-cmd">
        <Dialog aria-label={t("command.dialog")} className="pr-cmd__dlg">
          <div className="pr-cmd__field">
            <MagnifyingGlassIcon aria-hidden />
            <input autoFocus className="pr-cmd__input" role="combobox" aria-expanded="true" aria-controls="pr-cmd-list" aria-autocomplete="list" aria-label={placeholder}
              aria-activedescendant={hits[i] ? `pr-cmd-${hits[i].id}` : undefined} placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} />
            <kbd className="pr-cmd__kbd">{t("command.esc")}</kbd>
          </div>
          <ul className="pr-cmd__list" id="pr-cmd-list" role="listbox" aria-label={t("command.results")} ref={listRef}>
            {hits.map((c, k) => (
              <li key={c.id} id={`pr-cmd-${c.id}`} role="option" aria-selected={k === i} className="pr-cmd__opt" onMouseMove={() => setI(k)} onClick={() => run(c)}>
                <span className="pr-cmd__label">{c.label}</span>
                {c.hint && <span className="pr-cmd__hint">{c.hint}</span>}
                <span className="pr-cmd__group">{c.group}</span>
              </li>
            ))}
            {hits.length === 0 && <li className="pr-cmd__none" role="presentation">{tn("command.none", { query: q })}</li>}
          </ul>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

/** Toggles the palette with Ctrl or Cmd+K. Call once in the shell. */
export function useCommandShortcut(toggle: () => void) {
  useEffect(() => {
    const on = (e: globalThis.KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); toggle(); } };
    window.addEventListener("keydown", on); return () => window.removeEventListener("keydown", on);
  }, [toggle]);
}

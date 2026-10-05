import { useState, type ReactNode } from "react";
import { Badge } from "../primitives/Card";
import { Select } from "../primitives/forms";
import { Text } from "../primitives/Text";
import { useMessages } from "../i18n/I18nProvider";

export type KanbanColumn = { id: string; label: string };

/**
 * KanbanBoard: work that moves through stages. The app owns the data; the board shows the columns and cards and calls
 * `onMove(id, columnId)`. Moving a card always works with the keyboard and a screen reader (a labelled select on each card)
 * and is announced; drag and drop is not included, and if you add it, keep this as the way that always works.
 * Each column shows a count and an empty message. Keep cards short; open the detail in a SlideOver.
 *
 * @example
 * <KanbanBoard
 *   columns={[{ id: "todo", label: "To do" }, { id: "done", label: "Done" }]}
 *   items={cards} getId={(c) => c.id} getColumn={(c) => c.status} cardLabel={(c) => c.title}
 *   onMove={(id, column) => move(id, column)}
 *   renderCard={(c) => <Text>{c.title}</Text>}
 * />
 */
export function KanbanBoard<T>({ columns, items, getId, getColumn, onMove, renderCard, cardLabel, emptyText, label: labelProp }: {
  columns: KanbanColumn[]; items: T[]; getId: (item: T) => string; getColumn: (item: T) => string;
  onMove: (id: string, columnId: string) => void; renderCard: (item: T) => ReactNode;
  /** Names the card for the move control, for example its title. */ cardLabel: (item: T) => string;
  emptyText?: string; label?: string;
}) {
  const { t } = useMessages();
  const label = labelProp ?? t("kanban.board");
  const [said, setSaid] = useState("");
  const move = (item: T, col: string) => { onMove(getId(item), col); setSaid(t("kanban.moved", { card: cardLabel(item), column: columns.find((c) => c.id === col)?.label ?? "undefined" })); };
  return (
    <div className="pr-kb" role="group" aria-label={label}>
      <p role="status" className="pr-sr">{said}</p>
      {columns.map((c) => {
        const here = items.filter((i) => getColumn(i) === c.id);
        return (
          <section key={c.id} className="pr-kb__col" aria-labelledby={`kb-${label}-${c.id}`}>
            <h3 id={`kb-${label}-${c.id}`} className="pr-kb__head">{c.label} <Badge>{here.length}</Badge></h3>
            {here.length === 0 && <Text size="2" color="gray">{emptyText ?? t("kanban.empty")}</Text>}
            {here.map((i) => (
              <article key={getId(i)} className="pr-kb__card">
                {renderCard(i)}
                <Select label={t("kanban.move", { card: cardLabel(i) })} hideLabel size="1" value={c.id} onChange={(v) => move(i, v)} options={columns.map((x) => ({ value: x.id, label: x.label }))} />
              </article>
            ))}
          </section>
        );
      })}
    </div>
  );
}

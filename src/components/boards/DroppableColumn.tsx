import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column } from "./Column";

type Props = {
  id: string;
  items: string[];
  children: React.ReactNode;
};

export function DroppableColumn({ id, items, children }: Props) {
  const { active, over, setNodeRef } = useSortable({
    id,
    data: {
      type: "column",
      children: items,
    },
  });

  const isOverColumn = over
    ? (id === over.id && active?.data.current?.type !== "container") ||
      items.includes(over.id.toString())
    : false;

  return (
    <SortableContext
      id={id}
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <Column id={id} ref={setNodeRef} isHovering={isOverColumn}>
        {children}
      </Column>
    </SortableContext>
  );
}

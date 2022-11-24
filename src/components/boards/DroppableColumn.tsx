import { UniqueIdentifier } from "@dnd-kit/core";
import {
  hasSortableData,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column } from "./Column";

type Props = {
  id: string;
  index: number;
  items: UniqueIdentifier[];
  children: React.ReactNode;
};

export function DroppableColumn({ id, index, items, children }: Props) {
  const { active, over, setNodeRef } = useSortable({ id });

  console.log("active", active);
  console.log("over", over);

  const isOverColumn =
    hasSortableData(active) && active.data.current.sortable.containerId === id;

  return (
    <SortableContext
      id={id}
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <Column
        id={id}
        index={index}
        ref={setNodeRef}
        isOverColumn={isOverColumn}
      >
        {children}
      </Column>
    </SortableContext>
  );
}

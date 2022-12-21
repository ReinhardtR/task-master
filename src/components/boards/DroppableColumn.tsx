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
  const { setNodeRef, attributes, listeners } = useSortable({ id });

  // const isOverColumn =
  //   hasSortableData(active) && active.data.current.sortable.containerId === id;

  return (
    <SortableContext
      id={id}
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <div ref={setNodeRef} className="flex flex-col">
        <div
          className="flex px-8 items-center text-white text-xl font-bold w-80 h-[6vh]"
          style={{ backgroundColor: "blueviolet" }}
          {...attributes}
          {...listeners}
        >
          {id}
        </div>
        <div className="relative flex-1 flex flex-col space-y-2 p-2 max-h-[88vh] overflow-y-auto column">
          {children}
        </div>
      </div>
    </SortableContext>
  );
}

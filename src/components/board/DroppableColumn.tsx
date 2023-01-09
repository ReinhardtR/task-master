import { Task } from "@/lib/board-store";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ColumnStatus } from "@prisma/client";

type Props = {
  columnStatus: ColumnStatus;
  tasks: Task[];
  children: React.ReactNode;
};

export function DroppableColumn({ columnStatus, tasks, children }: Props) {
  const { setNodeRef } = useDroppable({ id: columnStatus });

  return (
    <SortableContext
      id={columnStatus}
      items={tasks}
      strategy={verticalListSortingStrategy}
    >
      <div ref={setNodeRef} className="flex flex-col">
        <div
          className="flex px-8 items-center text-white text-xl font-bold w-80 h-[6vh]"
          style={{ backgroundColor: "blueviolet" }}
        >
          {columnStatus}
        </div>
        <div className="relative flex-1 flex flex-col space-y-2 p-2 max-h-[88vh] overflow-y-auto column">
          {children}
        </div>
      </div>
    </SortableContext>
  );
}

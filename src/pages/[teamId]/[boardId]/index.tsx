import { DraggableTask } from "@/components/boards/DraggableTask";
import { DroppableColumn } from "@/components/boards/DroppableColumn";
import { Task } from "@/components/boards/Task";
import { useBoardStore } from "@/lib/board-store";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

export default function BoardPage() {
  const { board, taskBeingDragged, onDragEnd, onDragOver, onDragStart } =
    useBoardStore();

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex flex-grow">
        {board.columnOrder.map((columnId, index) => {
          const column = board.columns[columnId];

          return (
            <DroppableColumn
              key={column.id}
              id={column.id}
              items={column.taskIds}
            >
              {column.taskIds.map((taskid) => {
                const task = board.tasks[taskid];

                return (
                  <DraggableTask key={task.id} id={task.id} name={task.name} />
                );
              })}
            </DroppableColumn>
          );
        })}
      </div>

      <DragOverlay>
        {taskBeingDragged ? (
          <Task
            id={taskBeingDragged.id}
            name={taskBeingDragged.name}
            className="cursor-grabbing"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

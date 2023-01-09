import { useSortable } from "@dnd-kit/sortable";
import { Task } from "./Task";
import { CSS } from "@dnd-kit/utilities";
import { type Task as TaskType } from "@/lib/board-store";

type Props = {
  task: TaskType;
};

export function DraggableTask({ task }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Task
      task={task}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    />
  );
}

import { useSortable } from "@dnd-kit/sortable";
import clsx from "clsx";
import { Task } from "./Task";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  id: string;
  name: string;
};

export function DraggableTask({ id, name }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Task
      id={id}
      name={name}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    />
  );
}

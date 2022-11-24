import { useSortable } from "@dnd-kit/sortable";
import clsx from "clsx";
import { Task } from "./Task";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";

type Props = {
  id: UniqueIdentifier;
  title: string;
};

export function DraggableTask({ id, title }: Props) {
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
    opacity: isDragging ? 0 : 1,
  };

  return (
    <Task
      id={id.toString()}
      title={title}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    />
  );
}

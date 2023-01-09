import create from "zustand";
import {
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { hasSortableData } from "@dnd-kit/sortable";
import { z } from "zod";
import { ColumnStatus } from "@prisma/client";
import { insertAtIndex, removeAtIndex, arrayMove } from "@/utils/array";

export const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Task = z.infer<typeof TaskSchema>;

export const BoardSchema = z.object({
  [ColumnStatus.BACKLOG]: z.array(TaskSchema),
  [ColumnStatus.TODO]: z.array(TaskSchema),
  [ColumnStatus.IN_PROGRESS]: z.array(TaskSchema),
  [ColumnStatus.DONE]: z.array(TaskSchema),
  [ColumnStatus.CANCELED]: z.array(TaskSchema),
});

export type Board = z.infer<typeof BoardSchema>;

type BoardState = {
  activeTask: Task | null;
  actions: BoardActions;
};

type BoardActions = {
  onDragStart: (board: Board, event: DragStartEvent) => void;
  onDragOver: (board: Board, event: DragOverEvent) => Board | void;
  onDragEnd: (board: Board, event: DragEndEvent) => Board;
  onDragCancel: (event: DragCancelEvent) => void;
};

const useBoardStore = create<BoardState>()((set, get) => ({
  activeTask: null,
  actions: {
    onDragStart: (board, event) => {
      const activeId = event.active.id;

      if (!hasSortableData(event.active)) {
        throw new Error("Active element is not sortable");
      }

      const activeColumn = event.active.data.current.sortable.containerId;

      const activeTask = board[activeColumn as ColumnStatus].find(
        (task) => task.id === activeId
      );

      set((state) => ({
        ...state,
        activeTask,
      }));
    },
    onDragOver: (board, event) => {
      const { active, over } = event;

      const overId = over?.id;

      if (!overId || !hasSortableData(active)) {
        return;
      }

      const { activeTask } = get();

      const activeContainer = active.data.current.sortable.containerId;
      const overContainer = hasSortableData(over)
        ? over.data.current.sortable.containerId
        : over.id;

      if (activeContainer === overContainer) {
        return;
      }

      const activeIndex = active.data.current.sortable.index;
      const overIndex: number =
        over.id in board
          ? board[overContainer as ColumnStatus].length + 1
          : over.data.current?.sortable.index;

      return moveBetweenColumns(
        board,
        activeContainer as ColumnStatus,
        activeIndex,
        overContainer as ColumnStatus,
        overIndex,
        activeTask!
      );
    },
    onDragEnd: (board, event) => {
      const { active, over } = event;

      if (!over || active.id === over.id || !hasSortableData(active)) {
        set((state) => ({ ...state, activeTask: null }));
        console.log("RETURN SAME BOARD");
        return board;
      }

      const activeContainer = active.data.current.sortable
        .containerId as ColumnStatus;
      const overContainer = hasSortableData(over)
        ? over.data.current.sortable.containerId
        : over.id;

      const activeIndex = active.data.current.sortable.index;
      const overIndex: number =
        over.id in board
          ? board[overContainer as ColumnStatus].length + 1
          : over.data.current?.sortable.index;

      const { activeTask } = get();
      set((state) => ({ ...state, activeTask: null }));

      return activeContainer === overContainer
        ? {
            ...board,
            [overContainer]: arrayMove(
              board[overContainer],
              activeIndex,
              overIndex
            ),
          }
        : moveBetweenColumns(
            board,
            activeContainer,
            activeIndex,
            overContainer as ColumnStatus,
            overIndex,
            activeTask!
          );
    },
    onDragCancel: (event) => {
      set((state) => ({ ...state, activeTask: null }));
    },
  },
}));

const moveBetweenColumns = (
  board: Board,
  activeContainer: ColumnStatus,
  activeIndex: number,
  overContainer: ColumnStatus,
  overIndex: number,
  item: Task
): Board => {
  return {
    ...board,
    [activeContainer]: removeAtIndex(board[activeContainer], activeIndex),
    [overContainer]: insertAtIndex(board[overContainer], overIndex, item),
  };
};

export const useActiveTask = () => useBoardStore((state) => state.activeTask);
export const useBoardActions = () => useBoardStore((state) => state.actions);

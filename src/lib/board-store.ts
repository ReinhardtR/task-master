import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { hasSortableData } from "@dnd-kit/sortable";
import create from "zustand";

const data: Board = {
  columns: {
    "column-1": {
      id: "column-1",
      title: "To do",
      taskIds: ["task-1", "task-2", "task-3", "task-4"],
    },
    "column-2": {
      id: "column-2",
      title: "In progress",
      taskIds: ["task-5", "task-6", "task-7"],
    },
  },
  columnOrder: ["column-1", "column-2"],
  tasks: {
    "task-1": { id: "task-1", name: "Take out the garbage" },
    "task-2": { id: "task-2", name: "Watch my favorite show" },
    "task-3": { id: "task-3", name: "Charge my phone" },
    "task-4": { id: "task-4", name: "Cook dinner" },
    "task-5": { id: "task-5", name: "Do the dishes" },
    "task-6": { id: "task-6", name: "Take a shower" },
    "task-7": { id: "task-7", name: "Go to bed" },
  },
};

type Column = {
  id: string;
  title: string;
  taskIds: string[];
};

type Task = {
  id: string;
  name: string;
};

type Board = {
  columns: Record<string, Column>;
  columnOrder: string[];
  tasks: Record<string, Task>;
};

interface BoardState {
  board: Board;
  taskBeingDragged: Task | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export const useBoardStore = create<BoardState>()((set, get) => ({
  board: data,
  taskBeingDragged: null,
  onDragStart: (event) => {
    const { active } = event;
    const task = get().board.tasks[active.id];
    set({ taskBeingDragged: task });
  },
  onDragOver: (event) => {
    const { over, active } = event;

    if (!over || !hasSortableData(active) || !hasSortableData(over)) {
      return;
    }

    const activeContainer = active.data.current.sortable.containerId.toString();
    const overContainer = over.data.current.sortable.containerId.toString();

    if (activeContainer !== overContainer) {
      const activeIndex = active.data.current.sortable.index;
      const overIndex = over.data.current.sortable.index;

      set((state) => ({
        board: {
          ...state.board,
          columns: moveBetweenColumns(
            state.board.columns,
            activeContainer,
            activeIndex,
            overContainer,
            overIndex,
            active.id.toString()
          ),
        },
      }));
    }
  },
  onDragEnd: (event) => {
    const { active, over } = event;

    if (!over || !hasSortableData(over) || !hasSortableData(active))
      return set({ taskBeingDragged: null });

    if (active.id !== over.id) {
      const activeContainer = active.data.current.sortable.containerId;
      const overContainer = over.data.current?.sortable.containerId || over.id;

      const activeIndex = active.data.current.sortable.index;
      const overIndex = over.data.current.sortable.index; // maybe wrong?

      if (activeContainer === overContainer) {
        const taskIds = get().board.columns[activeContainer].taskIds;
        const newTaskIds = moveTask(taskIds, activeIndex, overIndex);

        set((state) => ({
          board: {
            ...state.board,
            columns: {
              ...state.board.columns,
              [activeContainer]: {
                ...state.board.columns[activeContainer],
                taskIds: newTaskIds,
              },
            },
          },
        }));

        return set({ taskBeingDragged: null });
      }

      const activeTaskIds = get().board.columns[activeContainer].taskIds;
      const overTaskIds = get().board.columns[overContainer].taskIds;

      const newActiveTaskIds = Array.from(activeTaskIds);
      const [removed] = newActiveTaskIds.splice(activeIndex, 1);

      const newOverTaskIds = Array.from(overTaskIds);
      newOverTaskIds.splice(overIndex, 0, removed);

      set((state) => ({
        board: {
          ...state.board,
          columns: {
            ...state.board.columns,
            [activeContainer]: {
              ...state.board.columns[activeContainer],
              taskIds: newActiveTaskIds,
            },
            [overContainer]: {
              ...state.board.columns[overContainer],
              taskIds: newOverTaskIds,
            },
          },
        },
      }));

      set({ taskBeingDragged: null });
      return;
    }
  },
}));

function moveTask(
  taskIds: string[],
  sourceIndex: number,
  destinationIndex: number
) {
  const newTaskIds = Array.from(taskIds);
  const [removed] = newTaskIds.splice(sourceIndex, 1);
  newTaskIds.splice(destinationIndex, 0, removed);

  return newTaskIds;
}

function moveBetweenColumns(
  columns: Record<string, Column>,
  sourceColumn: string,
  sourceIndex: number,
  destinationColumn: string,
  destinationIndex: number,
  draggableId: string
) {
  const sourceTaskIds = Array.from(columns[sourceColumn].taskIds);
  const [removed] = sourceTaskIds.splice(sourceIndex, 1);
  const destinationTaskIds = Array.from(columns[destinationColumn].taskIds);
  destinationTaskIds.splice(destinationIndex, 0, removed);

  const newColumns: Record<string, Column> = {
    ...columns,
    [sourceColumn]: {
      ...columns[sourceColumn],
      taskIds: sourceTaskIds,
    },
    [destinationColumn]: {
      ...columns[destinationColumn],
      taskIds: destinationTaskIds,
    },
  };

  return newColumns;
}

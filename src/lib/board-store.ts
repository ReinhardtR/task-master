import { liveblocks, type WithLiveblocks } from "@liveblocks/zustand";
import create from "zustand";
import { createClient } from "@liveblocks/client";
import {
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export type Column = {
  id: string;
};

export type Task = {
  id: number;
  title: string;
};

export type Shape = Record<Column["id"], Task["id"][]>;

export type Board = {
  columns: Record<Column["id"], Column>;
  tasks: Record<Task["id"], Task>;
};

export const initialBoard: Board = {
  columns: {
    "To do": { id: "To do" },
    "In Progress": { id: "In Progress" },
    Done: { id: "Done" },
  },
  tasks: {
    1: { id: 1, title: "Take out the garbage" },
    2: { id: 2, title: "Watch my favorite show" },
    3: { id: 3, title: "Charge my phone" },
    4: { id: 4, title: "Cook dinner" },
    5: { id: 5, title: "Do the dishes" },
    6: { id: 6, title: "Take a shower" },
    7: { id: 7, title: "Go to bed" },
    8: { id: 8, title: "Go to work" },
    9: { id: 9, title: "Go to the gym" },
    10: { id: 10, title: "Go to the store" },
    11: { id: 11, title: "Go to the bank" },
    12: { id: 12, title: "Go to the post office" },
    13: { id: 13, title: "Go to the library" },
    14: { id: 14, title: "Go to the park" },
    15: { id: 15, title: "Go to the beach" },
  },
};

export const initialShape: Shape = {
  "To do": [1, 2, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15],
  "In Progress": [5, 6, 7],
  Done: [],
};

export type BoardState = {
  board: Board;
  shape: Shape;
  activeId: UniqueIdentifier | null;
  clonedShape: Shape | null;
  actions: BoardActions;
};

type BoardActions = {
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: (event: DragCancelEvent) => void;
};

const client = createClient({
  // add to public NEXT_PUBLIC env vars
  publicApiKey:
    "pk_dev_Q2YwLiSDIm6tYx9BlsI6kFousMcMAYgtzoqp0O72heStKBIZjoX10VMDpCeZJI5D",
});

const useBoardStore = create<WithLiveblocks<BoardState>>()(
  liveblocks(
    (set, get) => ({
      board: initialBoard,
      shape: initialShape,
      activeId: null,
      clonedShape: null,
      actions: {
        onDragStart: (event) =>
          set((state) => ({
            ...state,
            activeId: event.active.id,
            clonedShape: state.shape,
          })),
        onDragOver: (event) => {
          const { board, shape } = get();

          const overId = event.over?.id;
          const active = event.active;

          if (overId == null || active.id in shape) {
            return;
          }

          const overContainer = findContainer(overId, shape);
          const activeContainer = findContainer(active.id, shape);

          if (
            overContainer == null ||
            activeContainer == null ||
            overContainer == activeContainer
          ) {
            return;
          }

          set((state) => {
            const over = event.over;
            const prevShape = state.shape;

            const activeItems = prevShape[activeContainer];
            const overItems = prevShape[overContainer];
            const overIndex = overItems.indexOf(Number(overId));
            const activeIndex = activeItems.indexOf(Number(active.id));

            let newIndex: number;

            if (overId in prevShape) {
              newIndex = overItems.length + 1;
            } else {
              const isBelowOverItem =
                over &&
                active.rect.current.translated &&
                active.rect.current.translated.top >
                  over.rect.top + over.rect.height;

              const modifier = isBelowOverItem ? 1 : 0;

              newIndex =
                overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
              ...state,
              shape: {
                ...prevShape,
                [activeContainer]: prevShape[activeContainer].filter(
                  (task) => task !== active.id
                ),
                [overContainer]: [
                  ...prevShape[overContainer].slice(0, newIndex),
                  prevShape[activeContainer][activeIndex],
                  ...prevShape[overContainer].slice(
                    newIndex,
                    prevShape[overContainer].length
                  ),
                ],
              },
            };
          });
        },
        onDragEnd: (event) => {
          const { shape } = get();

          const active = event.active;
          const over = event.over;

          if (active.id in shape && over?.id) {
            set((state) => {
              const oldShapeKeysOrder = Object.keys(shape);

              const activeIndex = oldShapeKeysOrder.indexOf(
                active.id as string
              );
              const overIndex = oldShapeKeysOrder.indexOf(over.id as string);

              const shapeKeysOrder = arrayMove(
                oldShapeKeysOrder,
                activeIndex,
                overIndex
              );

              const newShape: Shape = {};

              shapeKeysOrder.forEach((key) => {
                newShape[key] = shape[key];
              });

              return {
                ...state,
                shape: newShape,
              };
            });
          }

          const activeContainer = findContainer(active.id, shape);

          if (activeContainer) {
            set((state) => ({
              ...state,
              activeId: null,
            }));

            return;
          }

          const overId = over?.id;

          if (!overId) {
            set((state) => ({
              ...state,
              activeId: null,
            }));

            return;
          }

          const overContainer = findContainer(overId, shape);

          if (overContainer) {
            const activeIndex = shape[overContainer].indexOf(Number(active.id));
            const overIndex = shape[overContainer].indexOf(Number(overId));

            if (activeIndex !== overIndex) {
              set((state) => ({
                shape: {
                  ...shape,
                  [overContainer]: arrayMove(
                    shape[overContainer],
                    activeIndex,
                    overIndex
                  ),
                },
              }));
            }
          }

          set((state) => ({
            ...state,
            activeId: null,
          }));
        },
        onDragCancel: (event) =>
          set((state) => ({
            ...state,
            shape: state.clonedShape || state.shape,
            activeId: null,
            clonedShape: null,
          })),
      },
    }),
    {
      client,
      storageMapping: {
        board: true,
        shape: true,
      },
    }
  )
);

const findContainer = (id: UniqueIdentifier, shape: Shape) => {
  if (id in shape) {
    return id;
  }

  return Object.keys(shape).find((key) => shape[key].includes(Number(id)));
};

export const useBoardState = () =>
  useBoardStore((state) => ({
    activeId: state.activeId,
    board: state.board,
    shape: state.shape,
  }));

export const useBoardActions = () => useBoardStore((state) => state.actions);

export const useBoardLiveblocks = () =>
  useBoardStore((state) => state.liveblocks);

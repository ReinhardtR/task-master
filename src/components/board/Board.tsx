import { DraggableTask } from "@/components/board/DraggableTask";
import { DroppableColumn } from "@/components/board/DroppableColumn";
import { Task } from "@/components/board/Task";
import { Board, type Task as TaskType } from "@/lib/board-store";
import { type Board as BoardType } from "@/lib/board-store";
import {
  useBoardShapeChangedEvent,
  usePusherSocketId,
} from "@/lib/pusher-store";
import { ColumnStatus } from "@prisma/client";
import {
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  hasSortableData,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { RouterOutputs, trpc } from "@/utils/trpc";

import { useEffect, useState } from "react";
import { arrayMove, insertAtIndex, removeAtIndex } from "@/utils/array";
import { unstable_batchedUpdates } from "react-dom";

type Props = {
  boardId: string;
  boardShape: BoardType;
};

export function Board({ boardId, boardShape }: Props) {
  const socketId = usePusherSocketId();
  const [activeTask, setActiveTask] = useState<TaskType>();

  const [localBoard, setLocalBoard] = useState<Board>(boardShape);

  useEffect(() => {
    console.log("update board shape");
    setLocalBoard(boardShape);
  }, [boardShape]);

  const utils = trpc.useContext();
  const taskDraggedMutation = trpc.boards.taskDragged.useMutation({
    async onMutate(newBoard) {
      console.log("Task dragged mutation");
      await utils.boards.findById.cancel({
        boardId: newBoard.boardId,
      });

      const prevBoard = utils.boards.findById.getData({
        boardId: newBoard.boardId,
      });

      utils.boards.findById.setData({ boardId: newBoard.boardId }, (old) => ({
        ...old!,
        tasks: getTasks(newBoard.board),
      }));

      return { prevBoard, newBoard };
    },
    onError(err, newBoard, ctx) {
      console.log("error");
      utils.boards.findById.setData(
        { boardId: ctx?.newBoard.boardId! },
        ctx?.prevBoard
      );
    },
    onSettled(newBoard, err, ctx) {
      console.log("settled");
      utils.boards.findById.invalidate({ boardId: ctx.boardId });
    },
  });

  useBoardShapeChangedEvent(boardId, ({ board }) => {
    console.log("Board shape changed event");
    setLocalBoard(board);
  });

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function findContainer(id: string) {
    if (id in localBoard) {
      return id;
    }

    return Object.keys(localBoard).find(
      (key) =>
        localBoard[key as ColumnStatus].find((task) => task.id === id) != null
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    setLocalBoard(boardShape);

    const activeId = event.active.id;

    if (!hasSortableData(event.active)) {
      throw new Error("Active element is not sortable");
    }

    const activeColumn = event.active.data.current.sortable.containerId;

    const newActiveTask = localBoard[activeColumn as ColumnStatus].find(
      (task) => task.id === activeId
    );

    setActiveTask(newActiveTask);
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    setActiveTask(undefined);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!active.id || !over?.id) {
      return;
    }

    const activeContainer = findContainer(active.id.toString());
    const overContainer = findContainer(over.id.toString());

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setLocalBoard((oldBoard) => {
      const activeTasks = oldBoard[activeContainer as ColumnStatus];
      const overTasks = oldBoard[overContainer as ColumnStatus];

      const activeIndex = activeTasks.indexOf(
        activeTasks.find((task) => task.id === active.id.toString())!
      );

      const overIndex = overTasks.indexOf(
        overTasks.find((task) => task.id === over.id.toString())!
      );

      let newIndex: number;

      if (over.id in oldBoard) {
        // We're at the root droppable of a container
        newIndex = overTasks.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overTasks.length + 1;
      }

      return {
        ...localBoard,
        [activeContainer]: localBoard[activeContainer as ColumnStatus].filter(
          (task) => task.id !== active.id.toString()
        ),
        [overContainer]: [
          ...localBoard[overContainer as ColumnStatus].slice(0, newIndex),
          localBoard[activeContainer as ColumnStatus][activeIndex],
          ...localBoard[overContainer as ColumnStatus].slice(
            newIndex,
            localBoard[overContainer as ColumnStatus].length
          ),
        ],
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!active.id || !over?.id) {
      setActiveTask(undefined);
      return;
    }

    const activeContainer = findContainer(active.id.toString());
    const overContainer = findContainer(over.id.toString());

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      setActiveTask(undefined);
      return;
    }

    const activeIndex = localBoard[activeContainer as ColumnStatus].findIndex(
      (task) => task.id === active.id.toString()
    );
    const overIndex = localBoard[overContainer as ColumnStatus].findIndex(
      (task) => task.id === over.id.toString()
    );

    console.log(activeIndex, overIndex);

    let newBoard = localBoard;

    if (activeIndex !== overIndex) {
      console.log("local", localBoard);
      newBoard = {
        ...localBoard,
        [overContainer]: arrayMove(
          localBoard[overContainer as ColumnStatus],
          activeIndex,
          overIndex
        ),
      };
      console.log("new", newBoard);

      unstable_batchedUpdates(() => {
        setLocalBoard(newBoard);
        setActiveTask(undefined);
      });
    } else {
      setActiveTask(undefined);
    }

    try {
      await taskDraggedMutation.mutateAsync({
        boardId,
        board: newBoard,
        socketId,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={async (event) => await handleDragEnd(event)}
      onDragCancel={handleDragCancel}
      collisionDetection={pointerWithin}
    >
      <div className="flex flex-grow overflow-x-auto h-screen">
        {Object.entries(localBoard ?? boardShape).map(
          ([columnStatus, tasks]) => {
            return (
              <DroppableColumn
                key={columnStatus}
                columnStatus={columnStatus as ColumnStatus}
                tasks={tasks}
              >
                {tasks.map((task) => {
                  return <DraggableTask key={task.id} task={task} />;
                })}
              </DroppableColumn>
            );
          }
        )}
      </div>

      <DragOverlay>{activeTask && <Task task={activeTask} />}</DragOverlay>
    </DndContext>
  );
}

const moveBetweenColumns = (
  board: Board,
  activeContainer: ColumnStatus,
  activeIndex: number,
  overContainer: ColumnStatus,
  overIndex: number,
  task: TaskType
): Board => {
  return {
    ...board,
    [activeContainer]: removeAtIndex(board[activeContainer], activeIndex),
    [overContainer]: insertAtIndex(board[overContainer], overIndex, task),
  };
};

type Tasks = RouterOutputs["boards"]["findById"]["tasks"];

export const getBoardShape = (tasks: Tasks) => {
  const board: BoardType = {
    [ColumnStatus.BACKLOG]: [],
    [ColumnStatus.TODO]: [],
    [ColumnStatus.IN_PROGRESS]: [],
    [ColumnStatus.DONE]: [],
    [ColumnStatus.CANCELED]: [],
  };

  return tasks
    .sort((a, b) => a.index - b.index)
    .reduce((acc, task) => {
      acc[task.status].push({
        id: task.id,
        name: task.name,
      });

      return acc;
    }, board);
};

export const getTasks = (board: BoardType) => {
  const tasks = Object.entries(board).flatMap(([status, tasks]) => {
    return tasks.map((task, index) => ({
      id: task.id,
      name: task.name,
      status: status as ColumnStatus,
      index,
    }));
  });

  return tasks;
};

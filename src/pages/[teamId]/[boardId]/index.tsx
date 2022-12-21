import { Column } from "@/components/boards/Column";
import { DraggableTask } from "@/components/boards/DraggableTask";
import { DroppableColumn } from "@/components/boards/DroppableColumn";
import { Task } from "@/components/boards/Task";
import {
  useBoardActions,
  useBoardLiveblocks,
  useBoardState,
} from "@/lib/board-store";
import {
  closestCenter,
  CollisionDetection,
  DndContext,
  DragOverlay,
  getFirstCollision,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function BoardPage() {
  const router = useRouter();

  const { board, shape, activeId } = useBoardState();
  const boardActions = useBoardActions();
  const boardLiveblocks = useBoardLiveblocks();

  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const columnIds = Object.keys(board.columns);

  // const isSortingContainer =
  //   activeId && typeof activeId === "string"
  //     ? columnIds.includes(activeId)
  //     : false;

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in shape) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in shape
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        //  if (overId === TRASH_ID) {
        //    // If the intersecting droppable is the trash, return early
        //    // Remove this if you're not using trashable functionality in your app
        //    return intersections;
        //  }

        if (overId in shape) {
          const containerItems = shape[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.includes(Number(container.id))
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, shape]
  );

  useEffect(() => {
    const { teamId, boardId } = router.query;

    if (!teamId || !boardId) {
      return;
    }

    const roomId = `${teamId}-${boardId}`;

    console.log(roomId);

    boardLiveblocks.enterRoom(roomId);

    return () => {
      boardLiveblocks.leaveRoom(roomId);
    };
  }, [boardLiveblocks.enterRoom, boardLiveblocks.leaveRoom, router.query]);

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [shape]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={boardActions.onDragStart}
      onDragOver={boardActions.onDragOver}
      onDragEnd={boardActions.onDragEnd}
      onDragCancel={boardActions.onDragCancel}

      // cancelDrop={cancelDrop}
      // modifiers={modifiers}
    >
      <div className="flex flex-grow overflow-x-auto">
        {Object.keys(shape).map((columnId, index) => {
          const column = board.columns[columnId];
          const taskIds = shape[columnId];

          return (
            <DroppableColumn
              key={column.id}
              id={column.id}
              index={index}
              items={taskIds}
            >
              {taskIds.map((taskId) => {
                const task = board.tasks[taskId];

                return (
                  <DraggableTask
                    key={task.id}
                    id={task.id}
                    title={task.title}
                  />
                );
              })}
            </DroppableColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeId
          ? board.columns[activeId]
            ? renderColumnDragOverlay(activeId as string)
            : renderTaskDragOverlay(activeId as number)
          : null}
      </DragOverlay>
    </DndContext>
  );

  function renderTaskDragOverlay(id: number) {
    const task = board.tasks[id];
    return <Task id={task.id.toString()} title={task.title} />;
  }

  function renderColumnDragOverlay(id: string) {
    return (
      <Column id={id}>
        {shape[id].map((taskId, index) => {
          const task = board.tasks[taskId];

          return (
            <Task key={index} id={task.id.toString()} title={task.title} />
          );
        })}
      </Column>
    );
  }
}

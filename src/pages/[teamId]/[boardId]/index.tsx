import { DraggableTask } from "@/components/boards/DraggableTask";
import { DroppableColumn } from "@/components/boards/DroppableColumn";
import { Task } from "@/components/boards/Task";
import { initialBoard, initialShape } from "@/lib/board-store";
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
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback, useEffect, useRef, useState } from "react";

type Column = {
  id: string;
};

type Task = {
  id: number;
  title: string;
};

type Shape = Record<Column["id"], Task["id"][]>;

type Board = {
  columns: Record<Column["id"], Column>;
  tasks: Record<Task["id"], Task>;
};

export default function BoardPage() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [shape, setShape] = useState<Shape>(initialShape);
  const [containers, setContainers] = useState(
    Object.keys(shape) as UniqueIdentifier[]
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const columnIds = Object.keys(board.columns);

  const isSortingContainer =
    activeId && typeof activeId === "string"
      ? columnIds.includes(activeId)
      : false;

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

  const [clonedShape, setClonedShape] = useState<Shape | null>(null);

  const findContainer = (id: UniqueIdentifier) => {
    if (id in shape) {
      return id;
    }

    return Object.keys(shape).find((key) => shape[key].includes(Number(id)));
  };

  const getIndex = (id: UniqueIdentifier) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = shape[container].indexOf(Number(id));

    return index;
  };

  const onDragCancel = () => {
    if (clonedShape) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setShape(clonedShape);
    }

    setActiveId(null);
    setClonedShape(null);
  };

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
      onDragStart={({ active }) => {
        setActiveId(active.id);
        setClonedShape(shape);
      }}
      onDragOver={({ active, over }) => {
        const overId = over?.id;

        // if (overId == null || overId === TRASH_ID || active.id in items) {
        //   return;
        // }

        if (overId == null || active.id in shape) {
          return;
        }

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id);

        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          setShape((prevShape) => {
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

            recentlyMovedToNewContainer.current = true;

            return {
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
            };
          });
        }
      }}
      onDragEnd={({ active, over }) => {
        if (active.id in shape && over?.id) {
          setContainers((containers) => {
            const activeIndex = containers.indexOf(active.id);
            const overIndex = containers.indexOf(over.id);

            return arrayMove(containers, activeIndex, overIndex);
          });
        }

        const activeContainer = findContainer(active.id);

        if (!activeContainer) {
          setActiveId(null);
          return;
        }

        const overId = over?.id;

        if (overId == null) {
          setActiveId(null);
          return;
        }

        // if (overId === TRASH_ID) {
        //   setItems((items) => ({
        //     ...items,
        //     [activeContainer]: items[activeContainer].filter(
        //       (id) => id !== activeId
        //     ),
        //   }));
        //   setActiveId(null);
        //   return;
        // }

        // if (overId === PLACEHOLDER_ID) {
        //   const newContainerId = getNextContainerId();

        //   unstable_batchedUpdates(() => {
        //     setContainers((containers) => [...containers, newContainerId]);
        //     setItems((items) => ({
        //       ...items,
        //       [activeContainer]: items[activeContainer].filter(
        //         (id) => id !== activeId
        //       ),
        //       [newContainerId]: [active.id],
        //     }));
        //     setActiveId(null);
        //   });
        //   return;
        // }

        const overContainer = findContainer(overId);

        if (overContainer) {
          const activeIndex = shape[activeContainer].indexOf(Number(active.id));
          const overIndex = shape[overContainer].indexOf(Number(overId));

          if (activeIndex !== overIndex) {
            setShape((prevShape) => ({
              ...prevShape,
              [overContainer]: arrayMove(
                prevShape[overContainer],
                activeIndex,
                overIndex
              ),
            }));
          }
        }

        setActiveId(null);
      }}
      onDragCancel={onDragCancel}

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
        {activeId ? (
          <Task
            id={activeId.toString()}
            title={board.tasks[Number(activeId)].title}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

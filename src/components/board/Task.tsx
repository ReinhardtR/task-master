import clsx from "clsx";
import { forwardRef, Ref } from "react";
import { type Task as TaskType } from "@/lib/board-store";

type Props = {
  task: TaskType;
  className?: string;
  style?: React.CSSProperties;
};

export const Task = forwardRef<HTMLDivElement, Props>(
  ({ task, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "w-full p-4 bg-gray-12 text-gray-1 border border-gray-border rounded-lg text-white min-h-[100px] max-h-[200px] shadow font-medium flex flex-col space-y-2 justify-center items-center",
          className
        )}
        {...props}
      >
        <p className="font-bold text-gray-text">{task.id}</p>
        <p>{task.title}</p>
      </div>
    );
  }
);

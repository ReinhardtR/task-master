import clsx from "clsx";
import { forwardRef, Ref } from "react";

type Props = {
  id: string;
  name: string;
  style?: React.CSSProperties;
  className?: string;
};

export const Task = forwardRef<HTMLDivElement, Props>(
  ({ id, name, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "w-full p-4 bg-black border border-gray-border rounded-lg text-white min-h-[100px] max-h-[200px] shadow font-medium flex flex-col space-y-2 justify-center items-center",
          className
        )}
        {...props}
      >
        <p className="font-bold text-gray-text">{id}</p>
        <p>{name}</p>
      </div>
    );
  }
);

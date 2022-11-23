import clsx from "clsx";
import { forwardRef, Ref } from "react";

type Props = {
  id: string;
  isHovering?: boolean;
  children: React.ReactNode;
};

export const Column = forwardRef<HTMLDivElement, Props>(
  ({ id, isHovering = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "flex flex-col h-full",
          isHovering ? "bg-black" : "bg-gray-background"
        )}
        {...props}
      >
        <div
          className="flex px-8 items-center text-white text-xl font-bold w-80 h-16"
          style={{ backgroundColor: "blueviolet" }}
        >
          {id}
        </div>
        <div className="flex-1 flex flex-col space-y-2 p-2">{children}</div>
      </div>
    );
  }
);

import clsx from "clsx";
import { forwardRef, Ref } from "react";
import { motion } from "framer-motion";

type Props = {
  id: string;
  index: number;
  isOverColumn?: boolean;
  children: React.ReactNode;
};

export const Column = forwardRef<HTMLDivElement, Props>(
  ({ id, index, isOverColumn = false, children, ...props }, ref) => {
    return (
      <div ref={ref} className="flex flex-col h-full" {...props}>
        <div
          className="flex px-8 items-center text-white text-xl font-bold w-80 h-16"
          style={{ backgroundColor: "blueviolet" }}
        >
          {id}
        </div>
        <div className="relative flex-1 flex flex-col space-y-2 p-2 overflow-y-auto">
          {isOverColumn && (
            <motion.div
              layoutId="column-background"
              transition={{ duration: 0.2 }}
              className="bg-black/20 absolute inset-0 w-full h-full"
            />
          )}
          {children}
        </div>
      </div>
    );
  }
);

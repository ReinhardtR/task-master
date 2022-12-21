import clsx from "clsx";
import { forwardRef, Ref } from "react";
import { motion } from "framer-motion";

type Props = {
  id: string;
  children: React.ReactNode;
};

export const Column = forwardRef<HTMLDivElement, Props>(
  ({ id, children, ...props }, ref) => {
    return (
      <div ref={ref} className="flex flex-col" {...props}>
        <div
          className="flex px-8 items-center text-white text-xl font-bold w-80 h-[6vh]"
          style={{ backgroundColor: "blueviolet" }}
        >
          {id}
        </div>
        <div className="relative flex-1 flex flex-col space-y-2 p-2 max-h-[88vh] overflow-y-auto column">
          {/* {isOverColumn && (
            <motion.div
              layoutId="column-background"
              transition={{ duration: 0.2 }}
              className="bg-black/20 absolute inset-0"
            />
          )} */}
          {children}
        </div>
      </div>
    );
  }
);

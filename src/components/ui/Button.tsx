import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { forwardRef } from "react";

const styles = cva(
  "rounded font-medium tracking-wide text-sm flex justify-center items-center",
  {
    variants: {
      variant: {
        primary: [
          "bg-white hover:bg-transparent",
          "border border-white",
          "text-black hover:text-white",
        ],
        secondary: [
          "bg-black",
          "text-gray-text hover:text-white",
          "border border-gray-500 hover:border-white",
        ],
        ghost: [
          "bg-transparent",
          "text-gray-text hover:text-white font-normal",
        ],
      },
      size: {
        sm: "py-1 px-3",
        md: "px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  }
);

export type ButtonProps = VariantProps<typeof styles> &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ variant, className, ...props }, ref) => {
  const classNames = clsx(styles({ variant }), className);

  return (
    <button className={classNames} {...props} ref={ref}>
      {props.children}
    </button>
  );
});

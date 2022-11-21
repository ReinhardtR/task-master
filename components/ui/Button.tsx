import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";

const styles = cva("rounded font-medium tracking-wide text-sm", {
  variants: {
    variant: {
      primary: [
        "bg-white hover:bg-transparent",
        "border border-white",
        "text-black hover:text-white",
      ],
      secondary: [
        "bg-black",
        "text-gray-500 hover:text-white",
        "border border-gray-500 hover:border-white",
      ],
      ghost: ["bg-transparent", "text-gray-500 hover:text-white font-normal"],
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
});

type ButtonProps = VariantProps<typeof styles> &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = ({ variant, ...props }) => {
  const classNames = clsx(styles({ variant }), props.className);

  return (
    <button className={classNames} {...props}>
      {props.children}
    </button>
  );
};

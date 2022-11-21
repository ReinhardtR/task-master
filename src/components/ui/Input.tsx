"use client";

import { ComponentProps, forwardRef } from "react";
import { FieldError } from "./Form";

interface Props extends ComponentProps<"input"> {
  label: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, type = "text", ...props },
  ref
) {
  return (
    <label>
      <div className="font-medium text-white mb-1">{label}</div>
      <input
        className="bg-black text-white w-full rounded px-4 py-2 border-2 focus:border-white focus:ring-white disabled:opacity-60 disabled:bg-black/80 disabled:bg-opacity-20 mb-2"
        type={type}
        ref={ref}
        {...props}
      />

      <FieldError name={props.name} />
    </label>
  );
});

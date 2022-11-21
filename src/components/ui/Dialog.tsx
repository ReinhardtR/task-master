"use client";

import { tw } from "@/utils/tw";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Fragment, useState } from "react";
import { Button } from "./Button";
import { Transition } from "@headlessui/react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { Form, FormProps } from "./Form";
import { SubmitButton } from "./SubmitButton";

interface Props extends FormProps {
  title: string;
  description: string;
  submitLabel: string;
  trigger: React.ReactNode;
}

export const Dialog = ({
  title,
  description,
  submitLabel,
  trigger,
  form,
  onSubmit,
  children,
  ...props
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSubmitHandler: SubmitHandler<FieldValues> = async (values) => {
    await onSubmit(values);
    setIsOpen(false);
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <Transition.Root show={isOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogPrimitive.Overlay
            forceMount
            className="fixed inset-0 z-20 bg-black/50"
          />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPrimitive.Content
            forceMount
            className="w-[95vw] max-w-md bg-black p-8 pb-4 md:w-full m-1 border border-gray-border fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded"
          >
            <DialogPrimitive.Title className="text-white font-medium text-xl">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-gray-text text-sm mb-6">
              {description}
            </DialogPrimitive.Description>

            <Form form={form} onSubmit={onSubmitHandler}>
              {/* Inputs */}
              {children}
              <SubmitButton formState={form.formState}>
                {submitLabel}
              </SubmitButton>
            </Form>

            <DialogPrimitive.Close asChild className="absolute top-7 right-7">
              <Button variant="ghost" size="md">
                X
              </Button>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </Transition.Child>
      </Transition.Root>
    </DialogPrimitive.Root>
  );
};

"use client"

import * as React from "react"
import {
  useFormContext,
  FormProvider,
  Controller,
  type FieldValues,
  type UseFormReturn
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { FormFieldProps, FormProps } from "@/types";


function Form<TFieldValues extends FieldValues = FieldValues>({
  form,
  onSubmit,
  className,
  children,
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit ?? (() => {}))}
        className={cn(className)}
      >
        {children}
      </form>
    </FormProvider>
  );
}



function FormField({ name, children }: FormFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) =>
        children({
          ...field,
          error: (errors?.[name] as any)?.message || undefined,
        })
      }
    />
  );
}

// =========================
// ✅ Layout helper components
// =========================
function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />
}

function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  )
}

function FormMessage({ className, children }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null
  return (
    <p className={cn("text-sm text-red-500", className)}>
      {children}
    </p>
  )
}

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
}

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900",
        "placeholder:text-ink-400",
        "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
        "disabled:cursor-not-allowed disabled:bg-ink-50",
        "aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-300",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900",
      "placeholder:text-ink-400",
      "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
      "disabled:cursor-not-allowed disabled:bg-ink-50",
      "aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-300",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium text-ink-700", className)} {...props} />
  );
}

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm text-red-600">
      {children}
    </p>
  );
}

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300",
  secondary:
    "bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 active:bg-ink-100 disabled:text-ink-300",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200 disabled:text-ink-300",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
};

/**
 * Omite os handlers de drag/animação que o HTML tipa de um jeito e a Motion
 * de outro (conflito de tipos conhecido ao trocar `<button>` por
 * `motion.button`) — nenhum deles é usado neste componente.
 */
export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
        transition={{ duration: 0.1 }}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

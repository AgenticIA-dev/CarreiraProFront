"use client";

import { motion } from "motion/react";

/** Barra de progresso que anima a largura ao montar, em vez de aparecer pronta. */
export function AnimatedBar({
  percent,
  delay = 0,
  className = "bg-brand-600",
}: {
  percent: number;
  delay?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-2 rounded-full bg-ink-100">
      <motion.div
        className={`h-2 rounded-full ${className}`}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
      />
    </div>
  );
}

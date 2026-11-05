"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

/**
 * Revela o conteúdo com um leve fade + deslocamento vertical, com atraso
 * opcional — usado para mostrar seções de feedback em sequência (nota geral
 * primeiro, depois cada critério) em vez de tudo aparecer de uma vez.
 * Sutil de propósito: nada de bounce ou escala exagerada.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

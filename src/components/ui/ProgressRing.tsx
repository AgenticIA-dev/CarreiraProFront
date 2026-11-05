"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Anel de progresso animado (substitui o conic-gradient estático).
 * Usa um `motion.circle` com `strokeDashoffset`: ao montar, anima de 0 até o
 * valor de `score`. Respeita `prefers-reduced-motion` (sem animação, já no
 * valor final).
 */
export function ProgressRing({
  score,
  size = 64,
  strokeWidth = 6,
  accent = "brand",
  label,
  children,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  /** "brand" (azul petróleo, padrão) ou "gold" (destaque — nível avançado/conquista). */
  accent?: "brand" | "gold";
  label: string;
  children?: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = circumference * (1 - clamped / 100);
  const color = accent === "gold" ? "#C9A227" : "#0F3B4D";

  return (
    <div
      role="img"
      aria-label={label}
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: prefersReducedMotion ? target : circumference }}
          animate={{ strokeDashoffset: target }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

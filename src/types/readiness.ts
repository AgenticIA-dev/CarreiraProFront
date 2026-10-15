/**
 * Formato da "prontidão de treinamento" devolvida por
 * `GET /api/dashboard/readiness` no backend. O cálculo em si (fórmula,
 * pesos) vive só no backend (`src/lib/scoring/readiness.ts` daquele
 * projeto) — aqui ficamos só com o formato do resultado, para tipar a UI.
 */
export interface ReadinessResult {
  /** Métrica interna de treinamento, 0–100. NUNCA é probabilidade de contratação. */
  score: number;
  level: "iniciante" | "em progresso" | "consistente" | "avançado";
  practicedQuestions: number;
  starDrafts: number;
}

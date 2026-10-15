import { Card } from "@/components/ui/Card";
import type { ReadinessResult } from "@/types/readiness";

export function ReadinessCard({ readiness }: { readiness: ReadinessResult }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink-500">Prontidão para entrevista</p>
          <p className="mt-1 text-3xl font-semibold text-ink-900">
            {readiness.score}
            <span className="text-lg font-normal text-ink-400">/100</span>
          </p>
        </div>
        <div
          role="img"
          aria-label={`Prontidão ${readiness.score} de 100`}
          className="relative flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#2563EB ${readiness.score * 3.6}deg, #E2E8F0 0deg)`,
          }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xs font-semibold text-ink-900">
            {readiness.level === "avançado" ? "🔥" : readiness.level === "consistente" ? "👍" : "🌱"}
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm capitalize text-ink-500">Nível: {readiness.level}</p>
      <p className="mt-3 text-xs leading-relaxed text-ink-400">
        Esta é uma métrica interna de treinamento, baseada no seu volume e qualidade de prática —
        não é uma previsão de contratação.
      </p>
    </Card>
  );
}

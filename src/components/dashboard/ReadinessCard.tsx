import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { InfoTooltip } from "@/components/ui/Tooltip";
import type { ReadinessResult } from "@/types/readiness";

export function ReadinessCard({ readiness }: { readiness: ReadinessResult }) {
  const isAvancado = readiness.level === "avançado";
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
        <ProgressRing
          score={readiness.score}
          size={64}
          accent={isAvancado ? "gold" : "brand"}
          label={`Prontidão ${readiness.score} de 100`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xs font-semibold text-ink-900">
            {isAvancado ? "🔥" : readiness.level === "consistente" ? "👍" : "🌱"}
          </div>
        </ProgressRing>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-sm capitalize text-ink-500">
        Nível: {readiness.level}
        <InfoTooltip label="Esta é uma métrica interna de treinamento, baseada no seu volume e qualidade de prática — não é uma previsão de contratação." />
      </p>
    </Card>
  );
}

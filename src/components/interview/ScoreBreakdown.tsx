import { Card } from "@/components/ui/Card";
import type { ScoreBreakdown as ScoreBreakdownType } from "@/types/database";

const labels: Record<keyof ScoreBreakdownType, string> = {
  estrutura: "Estrutura",
  clareza: "Clareza",
  objetividade: "Objetividade",
  resultado: "Resultado",
};

export function ScoreBreakdownCard({
  score,
  breakdown,
  feedback,
}: {
  score: number;
  breakdown: ScoreBreakdownType;
  feedback: string;
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink-500">Qualidade da resposta de treinamento</p>
          <p className="text-2xl font-semibold text-ink-900">{score}/100</p>
        </div>
      </div>

      <div className="space-y-3">
        {(Object.keys(labels) as (keyof ScoreBreakdownType)[]).map((key) => (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-xs text-ink-500">
              <span>{labels[key]}</span>
              <span>{breakdown[key]}/25</span>
            </div>
            <div className="h-2 rounded-full bg-ink-100">
              <div
                className="h-2 rounded-full bg-brand-600"
                style={{ width: `${(breakdown[key] / 25) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 whitespace-pre-wrap rounded-xl bg-ink-50 p-3 text-sm text-ink-700">
        {feedback}
      </div>

      <p className="mt-3 text-xs text-ink-400">
        Esta pontuação avalia a qualidade da sua resposta de treinamento — não é uma previsão de
        contratação.
      </p>
    </Card>
  );
}

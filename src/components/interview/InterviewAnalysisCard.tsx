import { AlertTriangle, CheckCircle2, MessageCircleQuestion, Sparkles, TrendingUp, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { ScoreBreakdown } from "@/types/database";

/** Espelha `InterviewAnalysis` do backend (src/lib/ai/AIProvider.ts). */
export interface InterviewAnalysis {
  answerMaturity: "inicial" | "em desenvolvimento" | "sólida" | "sênior";
  verdict: string;
  criteria: { key: keyof ScoreBreakdown; score: number; justification: string; evidence?: string }[];
  starCoverage: { situacao: boolean; tarefa: boolean; acao: boolean; resultado: boolean };
  seniorSignals: string[];
  redFlags: string[];
  improvedAnswer: string;
  followUpQuestions: string[];
  engine: "ai" | "heuristic";
}

export interface InterviewEvaluation {
  score: number;
  breakdown: ScoreBreakdown;
  strengths: string[];
  improvements: string[];
  nextAction: string;
  analysis?: InterviewAnalysis;
}

const criteriaLabels: Record<keyof ScoreBreakdown, string> = {
  estrutura: "Estrutura",
  clareza: "Clareza",
  objetividade: "Objetividade",
  resultado: "Resultado",
};

const maturityStyle: Record<InterviewAnalysis["answerMaturity"], string> = {
  inicial: "bg-red-50 text-red-700 border-red-200",
  "em desenvolvimento": "bg-amber-50 text-amber-800 border-amber-200",
  sólida: "bg-brand-50 text-brand-700 border-brand-200",
  sênior: "bg-positive-50 text-positive-700 border-positive-100",
};

function BulletList({ items, icon: Icon, tone }: { items: string[]; icon: typeof CheckCircle2; tone: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-ink-700">
          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Análise completa no padrão de um entrevistador sênior: parecer, nota por
 * critério com justificativa e evidência, cobertura STAR, sinais de
 * senioridade, alertas, resposta reestruturada e perguntas de follow-up.
 */
export function InterviewAnalysisCard({ evaluation }: { evaluation: InterviewEvaluation }) {
  const a = evaluation.analysis;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink-500">Qualidade da resposta de treinamento</p>
            <p className="text-3xl font-semibold text-ink-900">{evaluation.score}/100</p>
          </div>
          {a && (
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${maturityStyle[a.answerMaturity]}`}>
              Maturidade da resposta: {a.answerMaturity}
            </span>
          )}
        </div>
        {a?.verdict && <p className="mt-3 text-sm leading-relaxed text-ink-700">{a.verdict}</p>}

        {a && (
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Cobertura do método STAR">
            {(
              [
                ["situacao", "Situação"],
                ["tarefa", "Tarefa"],
                ["acao", "Ação"],
                ["resultado", "Resultado"],
              ] as const
            ).map(([key, label]) => (
              <span
                key={key}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${
                  a.starCoverage[key] ? "bg-positive-50 text-positive-700" : "bg-red-50 text-red-700"
                }`}
              >
                {a.starCoverage[key] ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {label}
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-ink-900">Avaliação por critério</h2>
        <div className="space-y-4">
          {(Object.keys(criteriaLabels) as (keyof ScoreBreakdown)[]).map((key) => {
            const value = evaluation.breakdown[key];
            const detail = a?.criteria.find((c) => c.key === key);
            return (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between text-xs text-ink-500">
                  <span className="font-medium text-ink-700">{criteriaLabels[key]}</span>
                  <span>{value}/25</span>
                </div>
                <div className="h-2 rounded-full bg-ink-100">
                  <div className="h-2 rounded-full bg-brand-600" style={{ width: `${(value / 25) * 100}%` }} />
                </div>
                {detail?.justification && <p className="mt-1.5 text-sm text-ink-600">{detail.justification}</p>}
                {detail?.evidence && (
                  <blockquote className="mt-1 border-l-2 border-ink-200 pl-2 text-xs italic text-ink-500">
                    “{detail.evidence}”
                  </blockquote>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {evaluation.strengths.length > 0 && (
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Pontos fortes</h2>
            <BulletList items={evaluation.strengths} icon={CheckCircle2} tone="text-positive-600" />
          </Card>
        )}
        {evaluation.improvements.length > 0 && (
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink-900">O que melhorar (e como)</h2>
            <BulletList items={evaluation.improvements} icon={TrendingUp} tone="text-amber-600" />
          </Card>
        )}
        {a && a.seniorSignals.length > 0 && (
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Sinais de senioridade</h2>
            <BulletList items={a.seniorSignals} icon={Sparkles} tone="text-brand-600" />
          </Card>
        )}
        {a && a.redFlags.length > 0 && (
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Pontos de atenção do entrevistador</h2>
            <BulletList items={a.redFlags} icon={AlertTriangle} tone="text-red-600" />
          </Card>
        )}
      </div>

      {a?.improvedAnswer && (
        <Card>
          <h2 className="text-sm font-semibold text-ink-900">Sua resposta, reestruturada</h2>
          <p className="mt-1 text-xs text-ink-500">
            Montada só com o que você disse. Complete os trechos entre [colchetes] com seus dados reais.
          </p>
          <p className="mt-3 whitespace-pre-wrap rounded-xl bg-ink-50 p-3 text-sm leading-relaxed text-ink-800">
            {a.improvedAnswer}
          </p>
        </Card>
      )}

      {a && a.followUpQuestions.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Prepare-se para o aprofundamento</h2>
          <BulletList items={a.followUpQuestions} icon={MessageCircleQuestion} tone="text-ink-500" />
        </Card>
      )}

      <Card>
        <p className="text-sm font-semibold text-ink-900">Próxima ação</p>
        <p className="mt-1 text-sm text-ink-700">{evaluation.nextAction}</p>
        <p className="mt-3 text-xs text-ink-400">
          {a?.engine === "heuristic" ? "Análise automática por regras (IA não configurada). " : ""}
          Esta pontuação avalia a qualidade da sua resposta de treinamento — não é uma previsão de contratação.
        </p>
      </Card>
    </div>
  );
}

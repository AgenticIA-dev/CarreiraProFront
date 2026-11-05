"use client";

import { AlertTriangle, CheckCircle2, MessageCircleQuestion, Sparkles, TrendingUp, XCircle } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Disclosure } from "@/components/ui/Disclosure";
import { AudioPlayButton } from "@/components/ui/AudioPlayButton";
import { apiFetch } from "@/lib/api/client";
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
 * Análise completa no padrão de um entrevistador sênior. Nota, veredito e o
 * radar de critérios ficam sempre visíveis; o detalhe mais extenso (sinais de
 * senioridade, alertas, resposta reestruturada, follow-up) fica em seções que
 * abrem sob demanda, para a tela não virar uma parede de texto de cara.
 */
export function InterviewAnalysisCard({ evaluation }: { evaluation: InterviewEvaluation }) {
  const a = evaluation.analysis;

  const radarData = (Object.keys(criteriaLabels) as (keyof ScoreBreakdown)[]).map((key) => {
    const detail = a?.criteria.find((c) => c.key === key);
    return {
      key,
      label: criteriaLabels[key],
      value: evaluation.breakdown[key],
      justification: detail?.justification,
      evidence: detail?.evidence,
    };
  });
  const hasCriteriaDetail = radarData.some((d) => d.justification || d.evidence);

  const hasMoreDetails = Boolean(
    a && (a.seniorSignals.length > 0 || a.redFlags.length > 0 || a.improvedAnswer || a.followUpQuestions.length > 0)
  );

  // Resumo curto (não a análise inteira) para o botão de voz.
  const speechSummary = [a?.verdict, evaluation.nextAction].filter(Boolean).join(" ");

  return (
    <div className="space-y-4">
      <Reveal>
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
      </Reveal>

      <Reveal delay={0.1}>
        <Card>
          <h2 className="mb-1 text-sm font-semibold text-ink-900">Avaliação por critério</h2>
          <div className="h-56 w-full sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="label" tick={{ fill: "#334155", fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 25]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="#0F3B4D" fill="#0F3B4D" fillOpacity={0.22} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink-600 sm:grid-cols-4">
            {radarData.map((d) => (
              <div key={d.key} className="flex items-center justify-between gap-2">
                <span>{d.label}</span>
                <span className="font-semibold text-ink-900">{d.value}/25</span>
              </div>
            ))}
          </div>
          {hasCriteriaDetail && (
            <div className="mt-4 border-t border-ink-100 pt-3">
              <Disclosure title="Ver justificativa de cada critério">
                <div className="space-y-3">
                  {radarData
                    .filter((d) => d.justification || d.evidence)
                    .map((d) => (
                      <div key={d.key}>
                        <p className="text-xs font-semibold text-ink-700">
                          {d.label} — {d.value}/25
                        </p>
                        {d.justification && <p className="mt-1 text-sm text-ink-600">{d.justification}</p>}
                        {d.evidence && (
                          <blockquote className="mt-1 border-l-2 border-ink-200 pl-2 text-xs italic text-ink-500">
                            “{d.evidence}”
                          </blockquote>
                        )}
                      </div>
                    ))}
                </div>
              </Disclosure>
            </div>
          )}
        </Card>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2">
        {evaluation.strengths.length > 0 && (
          <Reveal delay={0.15}>
            <Card>
              <h2 className="mb-3 text-sm font-semibold text-ink-900">Pontos fortes</h2>
              <BulletList items={evaluation.strengths} icon={CheckCircle2} tone="text-positive-600" />
            </Card>
          </Reveal>
        )}
        {evaluation.improvements.length > 0 && (
          <Reveal delay={0.15}>
            <Card>
              <div className="mb-3 flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold text-ink-900">O que melhorar (e como)</h2>
                <AudioPlayButton
                  label="Ouvir"
                  fetchAudio={() =>
                    apiFetch("/api/audio/speak", {
                      method: "POST",
                      body: JSON.stringify({ text: evaluation.improvements.join(". ") }),
                    })
                  }
                />
              </div>
              <BulletList items={evaluation.improvements} icon={TrendingUp} tone="text-amber-600" />
            </Card>
          </Reveal>
        )}
      </div>

      {hasMoreDetails && a && (
        <Reveal delay={0.2}>
          <Card className="divide-y divide-ink-100">
            <h2 className="pb-3 text-sm font-semibold text-ink-900">Mais detalhes</h2>
            {a.seniorSignals.length > 0 && (
              <div className="py-3">
                <Disclosure title="Sinais de senioridade" summary={`${a.seniorSignals.length} identificado(s)`}>
                  <BulletList items={a.seniorSignals} icon={Sparkles} tone="text-gold-600" />
                </Disclosure>
              </div>
            )}
            {a.redFlags.length > 0 && (
              <div className="py-3">
                <Disclosure title="Pontos de atenção do entrevistador" summary={`${a.redFlags.length} identificado(s)`}>
                  <BulletList items={a.redFlags} icon={AlertTriangle} tone="text-red-600" />
                </Disclosure>
              </div>
            )}
            {a.improvedAnswer && (
              <div className="py-3">
                <Disclosure title="Sua resposta, reestruturada" summary="Versão sugerida disponível">
                  <p className="text-xs text-ink-500">
                    Montada só com o que você disse. Complete os trechos entre [colchetes] com seus dados reais.
                  </p>
                  <p className="mt-3 whitespace-pre-wrap rounded-xl bg-ink-50 p-3 text-sm leading-relaxed text-ink-800">
                    {a.improvedAnswer}
                  </p>
                </Disclosure>
              </div>
            )}
            {a.followUpQuestions.length > 0 && (
              <div className="py-3">
                <Disclosure title="Prepare-se para o aprofundamento" summary={`${a.followUpQuestions.length} pergunta(s)`}>
                  <BulletList items={a.followUpQuestions} icon={MessageCircleQuestion} tone="text-ink-500" />
                </Disclosure>
              </div>
            )}
          </Card>
        </Reveal>
      )}

      <Reveal delay={0.25}>
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-900">Próxima ação</p>
              <p className="mt-1 text-sm text-ink-700">{evaluation.nextAction}</p>
            </div>
            <AudioPlayButton
              label="Ouvir resumo"
              fetchAudio={() =>
                apiFetch("/api/audio/speak", {
                  method: "POST",
                  body: JSON.stringify({ text: speechSummary }),
                })
              }
            />
          </div>
          <p className="mt-3 text-xs text-ink-400">
            {a?.engine === "heuristic" ? "Análise automática por regras (IA não configurada). " : ""}
            Esta pontuação avalia a qualidade da sua resposta de treinamento — não é uma previsão de contratação.
          </p>
        </Card>
      </Reveal>
    </div>
  );
}

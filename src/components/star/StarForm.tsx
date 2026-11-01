"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ClipboardCopy, HelpCircle, Mic, Sparkles, TrendingUp, Wand2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api/client";

type FieldKey = "situation" | "task" | "action" | "result";

const fields: { key: FieldKey; label: string; hint: string; placeholder: string; rows: number }[] = [
  {
    key: "situation",
    label: "Situação",
    hint: "Contexto em 1–2 frases: onde, quando e qual era o problema. Inclua a escala (pessoas, clientes, valor, prazo).",
    placeholder: "Ex.: Na empresa onde eu trabalhava, o fechamento mensal atrasava e afetava outras áreas…",
    rows: 3,
  },
  {
    key: "task",
    label: "Tarefa",
    hint: "Qual era a SUA responsabilidade e o que estava em jogo se nada fosse feito?",
    placeholder: "Ex.: Eu precisava reduzir o prazo antes da auditoria…",
    rows: 2,
  },
  {
    key: "action",
    label: "Ação",
    hint: "O que VOCÊ fez, passo a passo, e POR QUE escolheu esse caminho. Quem você envolveu ou convenceu?",
    placeholder: "Ex.: Mapeei o processo, priorizei as etapas manuais porque eram o gargalo e alinhei com o gestor…",
    rows: 5,
  },
  {
    key: "result",
    label: "Resultado",
    hint: "O que mudou depois? Use números reais (antes × depois, %, prazo, valor). Se puder, diga o que aprendeu.",
    placeholder: "Ex.: O fechamento passou de X para Y dias. Aprendi que…",
    rows: 3,
  },
];

interface StarAnalysis {
  pitch: string;
  sections: { situacao: string; tarefa: string; acao: string; resultado: string; aprendizado: string };
  competencies: string[];
  checklist: { criterion: string; ok: boolean; tip?: string }[];
  seniorEnhancements: string[];
  missingData: string[];
  followUpQuestions: string[];
  qualityScore: number;
  engine: "ai" | "heuristic";
}

const sectionLabels: [keyof StarAnalysis["sections"], string][] = [
  ["situacao", "Situação"],
  ["tarefa", "Tarefa"],
  ["acao", "Ação"],
  ["resultado", "Resultado"],
  ["aprendizado", "Aprendizado"],
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // área de transferência bloqueada — ignora
        }
      }}
    >
      <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
      {copied ? "Copiado!" : "Copiar"}
    </Button>
  );
}

/** Destaca os trechos [entre colchetes] que o usuário precisa completar. */
function WithGaps({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("[") && part.endsWith("]") ? (
          <mark key={i} className="rounded bg-amber-100 px-1 text-amber-900">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function StarForm({ questionId }: { questionId?: string | null }) {
  const [values, setValues] = useState({ situation: "", task: "", action: "", result: "" });
  const [targetQuestion, setTargetQuestion] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<StarAnalysis | null>(null);
  const [view, setView] = useState<"completa" | "curta" | "partes">("completa");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGenerated(null);
    setAnalysis(null);

    const empty = fields.filter((f) => !values[f.key].trim()).map((f) => f.label);
    if (empty.length > 0) {
      setError(`Preencha: ${empty.join(", ")}. Se não tiver um dado exato, descreva com suas palavras.`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch("/api/star/generate", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          questionId: questionId ?? null,
          targetQuestion: targetQuestion.trim() || null,
          targetRole: targetRole.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Não foi possível gerar sua resposta agora.");
        return;
      }
      setGenerated(data.starResponse?.generated_response ?? "");
      setNotes(data.notes ?? []);
      setAnalysis(data.analysis ?? null);
      setView("completa");
    } catch {
      setError("Não foi possível gerar sua resposta agora. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  const visibleText =
    view === "curta" && analysis?.pitch ? analysis.pitch : generated ?? "";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="targetQuestion">Pergunta que você quer responder (opcional)</Label>
            <Input
              id="targetQuestion"
              value={targetQuestion}
              maxLength={500}
              placeholder="Ex.: Fale de uma vez em que você resolveu um problema complexo"
              onChange={(e) => setTargetQuestion(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="targetRole">Cargo/nível pretendido (opcional)</Label>
            <Input
              id="targetRole"
              value={targetRole}
              maxLength={200}
              placeholder="Ex.: Coordenador financeiro, sênior"
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </div>
        </div>

        {fields.map((field) => (
          <div key={field.key}>
            <Label htmlFor={field.key}>{field.label}</Label>
            <p className="-mt-1 mb-1.5 text-xs text-ink-400">{field.hint}</p>
            <Textarea
              id={field.key}
              rows={field.rows}
              value={values[field.key]}
              placeholder={field.placeholder}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
            />
          </div>
        ))}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={isLoading}>
          <Wand2 className="h-4 w-4" aria-hidden="true" />
          {isLoading ? "Estruturando no padrão sênior…" : "Estruturar minha resposta"}
        </Button>
      </form>

      {generated !== null && (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-ink-900">Sua resposta STAR</h2>
              {analysis && (
                <span className="rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-600">
                  Qualidade da história: {analysis.qualityScore}/100
                </span>
              )}
            </div>

            {analysis && (
              <div className="mt-3 flex flex-wrap gap-1" role="tablist" aria-label="Formato da resposta">
                {(
                  [
                    ["completa", "Completa (~2 min)"],
                    ["curta", "Curta (~40 s)"],
                    ["partes", "Por etapa"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={view === key}
                    onClick={() => setView(key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                      view === key ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {view === "partes" && analysis ? (
              <dl className="mt-3 space-y-3">
                {sectionLabels
                  .filter(([key]) => analysis.sections[key])
                  .map(([key, label]) => (
                    <div key={key} className="rounded-xl bg-ink-50 p-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-brand-700">{label}</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-sm text-ink-800">
                        <WithGaps text={analysis.sections[key]} />
                      </dd>
                    </div>
                  ))}
              </dl>
            ) : (
              <>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-800">
                  <WithGaps text={visibleText} />
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CopyButton text={visibleText} />
                  <Link
                    href="/app/simulador"
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                  >
                    <Mic className="h-4 w-4" aria-hidden="true" />
                    Treinar em voz alta no simulador
                  </Link>
                </div>
              </>
            )}

            {/\[[^\]]+\]/.test(generated) && (
              <p className="mt-3 text-xs text-amber-800">
                Os trechos destacados entre [colchetes] são lacunas: complete com seus dados reais antes de usar.
              </p>
            )}
          </Card>

          {analysis && analysis.checklist.length > 0 && (
            <Card>
              <h2 className="mb-3 text-sm font-semibold text-ink-900">Checklist de senioridade</h2>
              <ul className="space-y-2">
                {analysis.checklist.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    {item.ok ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-positive-600" aria-label="Atendido" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-label="Não atendido" />
                    )}
                    <span>
                      <span className="font-medium text-ink-900">{item.criterion}</span>
                      {!item.ok && item.tip && <span className="block text-ink-600">{item.tip}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {analysis && analysis.seniorEnhancements.length > 0 && (
              <Card>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <TrendingUp className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  Como levar ao nível sênior
                </h2>
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-700">
                  {analysis.seniorEnhancements.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </Card>
            )}
            {analysis && analysis.missingData.length > 0 && (
              <Card>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <HelpCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  Responda para completar sua história
                </h2>
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-700">
                  {analysis.missingData.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </Card>
            )}
            {analysis && analysis.competencies.length > 0 && (
              <Card>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <Sparkles className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  Competências que esta história demonstra
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.competencies.map((c) => (
                    <span key={c} className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
                      {c}
                    </span>
                  ))}
                </div>
              </Card>
            )}
            {analysis && analysis.followUpQuestions.length > 0 && (
              <Card>
                <h2 className="mb-3 text-sm font-semibold text-ink-900">Prepare-se para o aprofundamento</h2>
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-700">
                  {analysis.followUpQuestions.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {!analysis && notes.length > 0 && (
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-800">Observações</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-amber-800">
                {notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis?.engine === "heuristic" && (
            <p className="text-xs text-ink-400">
              Estruturação automática por regras (IA não configurada). Com a IA ativa, a resposta é
              reescrita com transições, justificativas e fechamento no padrão sênior.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

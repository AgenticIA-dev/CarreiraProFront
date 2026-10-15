"use client";

import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { QuestionRow } from "@/types/database";

const categoryLabels: Record<string, string> = {
  comportamental: "Comportamental",
  star: "Método STAR",
  tecnica: "Técnica",
  situacional: "Situacional",
  fit_cultural: "Fit cultural",
  lideranca: "Liderança",
};

const difficultyLabels: Record<string, string> = {
  iniciante: "Iniciante",
  intermediaria: "Intermediária",
  avancada: "Avançada",
};

export function QuestionCard({
  question,
  isFavorite,
  onToggleFavorite,
}: {
  question: QuestionRow;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-ink-200 bg-white shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Badge tone="brand">{categoryLabels[question.category] ?? question.category}</Badge>
            <Badge tone="neutral">{difficultyLabels[question.difficulty]}</Badge>
          </div>
          <p className="text-sm font-medium text-ink-900">{question.question}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onToggleFavorite && (
            <span
              role="button"
              tabIndex={0}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(question.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onToggleFavorite(question.id);
                }
              }}
              className="rounded-lg p-1.5 hover:bg-ink-100"
            >
              <Star
                className={cn("h-4 w-4", isFavorite ? "fill-amber-400 text-amber-400" : "text-ink-300")}
              />
            </span>
          )}
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 text-ink-400 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </div>
      </button>

      {open && (
        <div className="space-y-3 border-t border-ink-100 p-4 text-sm text-ink-600">
          {question.evaluates && (
            <div>
              <p className="font-medium text-ink-900">O que o entrevistador está avaliando</p>
              <p className="mt-0.5">{question.evaluates}</p>
            </div>
          )}
          {question.ideal_structure && (
            <div>
              <p className="font-medium text-ink-900">Estrutura recomendada</p>
              <p className="mt-0.5">{question.ideal_structure}</p>
            </div>
          )}
          {question.tips && question.tips.length > 0 && (
            <div>
              <p className="font-medium text-ink-900">Dicas</p>
              <ul className="mt-0.5 list-disc space-y-0.5 pl-5">
                {question.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
          {question.things_to_avoid && question.things_to_avoid.length > 0 && (
            <div>
              <p className="font-medium text-ink-900">Erros comuns a evitar</p>
              <ul className="mt-0.5 list-disc space-y-0.5 pl-5">
                {question.things_to_avoid.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

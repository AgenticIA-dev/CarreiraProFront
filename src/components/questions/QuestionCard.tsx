"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Lock, Mic, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AudioPlayButton } from "@/components/ui/AudioPlayButton";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { QuestionRow } from "@/types/database";

const categoryLabels: Record<string, string> = {
  comportamental: "Comportamental",
  star: "Método STAR",
  tecnica: "Técnica",
  situacional: "Situacional",
  fit_cultural: "Fit cultural",
  lideranca: "Liderança",
  aumento_promocao: "Aumento e promoção",
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
  question: QuestionRow & { locked?: boolean };
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"como" | "dicas">("como");
  const hasComo = Boolean(question.evaluates || question.ideal_structure);
  const hasDicas = Boolean(question.tips?.length || question.things_to_avoid?.length);
  const showTabs = hasComo && hasDicas;
  // Perguntas de fallback local (sem linha no banco) não têm áudio para gerar.
  const hasAudio = !question.id.startsWith("seed-");
  // Amostra grátis: só a 1ª pergunta de cada competência vem destravada (ver
  // questions/list.ts no backend).
  const locked = Boolean(question.locked);

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
            {locked && (
              <Badge tone="warning">
                <Lock className="mr-1 inline h-3 w-3" aria-hidden="true" />
                Amostra
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium text-ink-900">{question.question}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onToggleFavorite && (
            <motion.span
              role="button"
              tabIndex={0}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              whileTap={{ scale: 1.3 }}
              transition={{ duration: 0.15 }}
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
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorite ? "fill-gold-500 text-gold-500" : "text-ink-300"
                )}
              />
            </motion.span>
          )}
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 text-ink-400 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
        <div className="space-y-3 border-t border-ink-100 p-4 text-sm text-ink-600">
          {locked ? (
            <div className="rounded-xl bg-amber-50 p-3 text-amber-900">
              <p className="font-medium">Conteúdo bloqueado na amostra grátis</p>
              <p className="mt-0.5 text-amber-800">
                Assine o VoceUP para ver como responder, dicas e treinar esta pergunta no simulador.
              </p>
              <Link
                href="/comprar"
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Assinar o VoceUP
              </Link>
            </div>
          ) : (
            <>
          {hasAudio && (
            <AudioPlayButton
              label="Ouvir pergunta"
              fetchAudio={() => apiFetch(`/api/questions/${question.id}/audio/question`)}
            />
          )}
          {showTabs && (
            <div className="flex gap-1 rounded-lg bg-ink-50 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setTab("como")}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 transition-colors",
                  tab === "como" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700"
                )}
              >
                Como responder
              </button>
              <button
                type="button"
                onClick={() => setTab("dicas")}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 transition-colors",
                  tab === "dicas" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700"
                )}
              >
                Dicas e erros
              </button>
            </div>
          )}
          {hasComo && (!showTabs || tab === "como") ? (
            <>
              {question.evaluates && (
                <div>
                  <p className="font-medium text-ink-900">O que o entrevistador está avaliando</p>
                  <p className="mt-0.5">{question.evaluates}</p>
                </div>
              )}
              {question.ideal_structure && (
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-ink-900">Estrutura recomendada</p>
                    {hasAudio && (
                      <AudioPlayButton
                        label="Ouvir"
                        fetchAudio={() => apiFetch(`/api/questions/${question.id}/audio/ideal`)}
                      />
                    )}
                  </div>
                  <p className="mt-0.5">{question.ideal_structure}</p>
                </div>
              )}
            </>
          ) : null}
          {hasDicas && (!showTabs || tab === "dicas") ? (
            <>
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
            </>
          ) : null}
          {!question.id.startsWith("seed-") && (
            <Link
              href={`/app/simulador?pergunta=${question.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              <Mic className="h-4 w-4" aria-hidden="true" />
              Treinar no simulador
            </Link>
          )}
            </>
          )}
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

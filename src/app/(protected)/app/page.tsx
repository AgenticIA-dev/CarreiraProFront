import Link from "next/link";
import type { Metadata } from "next";
import { ClipboardList, Mic, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { apiFetchServer } from "@/lib/api/server";
import { ReadinessCard } from "@/components/dashboard/ReadinessCard";
import { Card } from "@/components/ui/Card";
import type { ReadinessResult } from "@/types/readiness";

export const metadata: Metadata = { title: "Dashboard" };

const nextSteps = [
  {
    href: "/app/perguntas",
    icon: ClipboardList,
    title: "Praticar uma pergunta",
    description: "Explore o banco de perguntas por categoria e dificuldade.",
  },
  {
    href: "/app/star",
    icon: Sparkles,
    title: "Estruturar uma resposta",
    description: "Organize uma experiência real com o método STAR.",
  },
  {
    href: "/app/simulador",
    icon: Mic,
    title: "Fazer uma simulação",
    description: "Responda por áudio e receba feedback estruturado.",
  },
];

const fallbackReadiness: ReadinessResult = {
  score: 0,
  level: "iniciante",
  practicedQuestions: 0,
  starDrafts: 0,
};

export default async function DashboardPage() {
  const { profile } = await requireUser();

  // O cálculo em si (fórmula/pesos) vive no backend — este Server Component
  // só exibe o resultado, já que este frontend não lê mais as tabelas
  // diretamente.
  const response = await apiFetchServer("/api/dashboard/readiness");
  const readiness: ReadinessResult = response.ok
    ? ((await response.json()) as { readiness: ReadinessResult }).readiness
    : fallbackReadiness;

  const firstName = profile.name?.split(" ")[0] ?? null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">
          Olá{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="mt-1 text-sm text-ink-500">Continue sua preparação para a próxima entrevista.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <ReadinessCard readiness={readiness} />
        </div>
        <Card className="sm:col-span-2">
          <p className="text-sm font-medium text-ink-500">Resumo de prática</p>
          <dl className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-ink-500">Simulações concluídas</dt>
              <dd className="text-xl font-semibold text-ink-900">{readiness.practicedQuestions}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">Respostas STAR criadas</dt>
              <dd className="text-xl font-semibold text-ink-900">{readiness.starDrafts}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-ink-900">Qual é o próximo passo?</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {nextSteps.map((step) => (
            <Link key={step.href} href={step.href}>
              <Card className="h-full transition-colors hover:border-brand-300">
                <step.icon className="mb-3 h-5 w-5 text-brand-600" aria-hidden="true" />
                <p className="text-sm font-semibold text-ink-900">{step.title}</p>
                <p className="mt-1 text-sm text-ink-500">{step.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

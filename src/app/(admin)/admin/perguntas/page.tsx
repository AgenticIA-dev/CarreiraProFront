import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { apiFetchServer } from "@/lib/api/server";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import type { QuestionRow } from "@/types/database";

export const metadata: Metadata = { title: "Perguntas — Admin" };

/**
 * Listagem administrativa de perguntas. A criação/edição completa (CRUD via
 * formulário) fica como próximo passo documentado em docs/DOCUMENTATION.md
 * — fora do escopo enxuto do MVP (PROMPT MESTRE §50), mas a leitura já usa
 * dados reais do banco, com escrita disponível diretamente no PostgreSQL
 * ou pelo script `npm run seed` (backend) enquanto o CRUD não é
 * implementado.
 */
export default async function AdminPerguntasPage() {
  await requireAdmin();

  const response = await apiFetchServer("/api/admin/questions");
  const questions: QuestionRow[] = response.ok
    ? ((await response.json()) as { questions: QuestionRow[] }).questions
    : [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-900">Perguntas</h1>
        <p className="text-sm text-ink-500">{questions?.length ?? 0} no total</p>
      </div>

      {!questions || questions.length === 0 ? (
        <EmptyState
          title="Nenhuma pergunta cadastrada"
          description="Rode `npm run` do script de seed (scripts/seed-questions.ts) para popular o banco com o conteúdo inicial."
        />
      ) : (
        <ul className="space-y-2">
          {questions.map((q) => (
            <li key={q.id} className="rounded-xl border border-ink-200 bg-white p-3">
              <div className="mb-1 flex items-center gap-2">
                <Badge tone="brand">{q.category}</Badge>
                <Badge tone="neutral">{q.difficulty}</Badge>
                {!q.is_published && <Badge tone="warning">Não publicada</Badge>}
              </div>
              <p className="text-sm text-ink-900">{q.question}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

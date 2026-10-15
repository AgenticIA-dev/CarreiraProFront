import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { apiFetchServer } from "@/lib/api/server";
import { Card } from "@/components/ui/Card";
import { DataRequestForm } from "@/components/profile/DataRequestForm";
import { formatDate } from "@/lib/utils";
import type { DataRequestRow } from "@/types/database";

export const metadata: Metadata = { title: "Privacidade e meus dados" };

const requestTypeLabels: Record<string, string> = {
  access: "Acesso aos dados",
  correction: "Correção de dados",
  deletion: "Eliminação de dados",
};

const statusLabels: Record<string, string> = {
  open: "Aberta",
  in_review: "Em análise",
  completed: "Concluída",
  rejected: "Recusada",
};

export default async function PrivacidadeDadosPage() {
  await requireUser();

  const response = await apiFetchServer("/api/account/data-requests");
  const requests: DataRequestRow[] = response.ok
    ? ((await response.json()) as { requests: DataRequestRow[] }).requests
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Privacidade e meus dados</h1>
        <p className="mt-1 text-sm text-ink-500">
          Em conformidade com a LGPD, você pode solicitar acesso, correção ou eliminação dos seus
          dados pessoais.
        </p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-ink-900">O que armazenamos</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-600">
          <li>Dados de cadastro (nome, e-mail).</li>
          <li>Respostas estruturadas pelo método STAR.</li>
          <li>Transcrições e pontuações de sessões do simulador de entrevista.</li>
          <li>Histórico de compra vinculado ao seu acesso.</li>
          <li>Preferências de cookies e consentimento.</li>
        </ul>
        <p className="mt-3 text-xs text-ink-400">
          Veja detalhes completos na nossa Política de Privacidade.
        </p>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-ink-900">Nova solicitação</h2>
        <DataRequestForm />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-ink-900">Suas solicitações</h2>
        {!requests || requests.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">Nenhuma solicitação registrada ainda.</p>
        ) : (
          <ul className="mt-2 divide-y divide-ink-100">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium text-ink-900">{requestTypeLabels[r.type] ?? r.type}</p>
                  <p className="text-xs text-ink-400">{formatDate(r.created_at)}</p>
                </div>
                <span className="text-xs text-ink-500">{statusLabels[r.status] ?? r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { apiFetchServer } from "@/lib/api/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { TesterInviteForm } from "@/components/admin/TesterInviteForm";

export const metadata: Metadata = { title: "Testadores — Admin" };

interface Tester {
  id: string;
  email: string;
  name: string | null;
  status: string;
  last_login_at: string | null;
  access_expires_at: string | null;
  courtesy_granted_at: string | null;
}

const date = (v: string | null) =>
  v ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short" }).format(new Date(v)) : "—";

export default async function AdminTestadoresPage() {
  await requireAdmin();

  const response = await apiFetchServer("/api/admin/testers");
  const data = response.ok
    ? ((await response.json()) as { testers: Tester[]; defaultDays: number })
    : { testers: [], defaultDays: 7 };
  const now = Date.now();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Testadores (acesso de cortesia)</h1>
        <p className="mt-1 text-sm text-ink-500">
          A pessoa recebe por e-mail o convite para criar a senha e usa o VoceUP completo pelos dias definidos, sem
          pagamento. O uso e o custo de IA aparecem em{" "}
          <Link href="/admin/uso" className="text-brand-600 underline">
            Uso e custos
          </Link>
          , marcados como cortesia e fora da receita.
        </p>
      </div>

      <Card>
        <TesterInviteForm defaultDays={data.defaultDays} />
      </Card>

      {data.testers.length === 0 ? (
        <EmptyState title="Nenhum testador ainda" description="Convide alguém pelo formulário acima." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">Testador</th>
                <th className="px-4 py-3">Convidado em</th>
                <th className="px-4 py-3">Acesso até</th>
                <th className="px-4 py-3">Último login</th>
                <th className="px-4 py-3">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {data.testers.map((t) => {
                const expired = t.access_expires_at ? new Date(t.access_expires_at).getTime() < now : false;
                const active = t.status === "active" && !expired;
                return (
                  <tr key={t.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{t.name ?? "—"}</p>
                      <p className="text-xs text-ink-500">{t.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{date(t.courtesy_granted_at)}</td>
                    <td className="px-4 py-3 text-ink-600">{date(t.access_expires_at)}</td>
                    <td className="px-4 py-3 text-ink-600">{t.last_login_at ? date(t.last_login_at) : "Nunca entrou"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={active ? "positive" : "neutral"}>{active ? "Ativo" : "Encerrado"}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-ink-500">
        Para estender um teste, convide o mesmo e-mail de novo: o prazo recomeça a contar a partir de hoje. Se o testador
        comprar, ele vira cliente automaticamente.
      </p>
    </div>
  );
}

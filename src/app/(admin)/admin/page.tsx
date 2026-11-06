import Link from "next/link";
import type { Metadata } from "next";
import { BarChart3, FlaskConical, Handshake, ListChecks, Settings, Tag, Users, Wallet } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { apiFetchServer } from "@/lib/api/server";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminHomePage() {
  await requireAdmin();

  const response = await apiFetchServer("/api/admin/stats");
  const stats = response.ok
    ? ((await response.json()) as { userCount: number; questionCount: number })
    : { userCount: 0, questionCount: 0 };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-ink-900">Administração</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/usuarios">
          <Card className="transition-colors hover:border-brand-300">
            <Users className="mb-2 h-5 w-5 text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink-900">Usuários</p>
            <p className="text-sm text-ink-500">{stats.userCount} cadastrados</p>
          </Card>
        </Link>
        <Link href="/admin/uso">
          <Card className="transition-colors hover:border-brand-300">
            <BarChart3 className="mb-2 h-5 w-5 text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink-900">Uso e custos</p>
            <p className="text-sm text-ink-500">Por usuário, com upsell e planilha</p>
          </Card>
        </Link>
        <Link href="/admin/testadores">
          <Card className="transition-colors hover:border-brand-300">
            <FlaskConical className="mb-2 h-5 w-5 text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink-900">Testadores</p>
            <p className="text-sm text-ink-500">Acesso de cortesia com convite</p>
          </Card>
        </Link>
        <Link href="/admin/perguntas">
          <Card className="transition-colors hover:border-brand-300">
            <ListChecks className="mb-2 h-5 w-5 text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink-900">Perguntas</p>
            <p className="text-sm text-ink-500">{stats.questionCount} no banco</p>
          </Card>
        </Link>
        <Link href="/admin/parceiros">
          <Card className="transition-colors hover:border-brand-300">
            <Handshake className="mb-2 h-5 w-5 text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink-900">Parceiros</p>
            <p className="text-sm text-ink-500">Cupom, desconto e amostra grátis</p>
          </Card>
        </Link>
        <Link href="/admin/comissoes">
          <Card className="transition-colors hover:border-brand-300">
            <Wallet className="mb-2 h-5 w-5 text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink-900">Comissões</p>
            <p className="text-sm text-ink-500">Vendas de parceiros e pagamento</p>
          </Card>
        </Link>
        <Link href="/admin/configuracoes">
          <Card className="transition-colors hover:border-brand-300">
            <Settings className="mb-2 h-5 w-5 text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink-900">Configurações</p>
            <p className="text-sm text-ink-500">Preço, duração do acesso e título</p>
          </Card>
        </Link>
        <Link href="/admin/campanhas">
          <Card className="transition-colors hover:border-brand-300">
            <Tag className="mb-2 h-5 w-5 text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink-900">Campanhas</p>
            <p className="text-sm text-ink-500">Descontos promocionais e cupons</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}

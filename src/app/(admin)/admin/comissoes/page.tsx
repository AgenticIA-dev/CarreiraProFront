import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { apiFetchServer } from "@/lib/api/server";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { CommissionPayButton } from "@/components/admin/CommissionPayButton";
import type { PartnerCommissionRow } from "@/types/database";

export const metadata: Metadata = { title: "Comissões — Admin" };

const date = (v: string | null) =>
  v ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short" }).format(new Date(v)) : "—";
const brl = (v: number | string) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function AdminComissoesPage() {
  await requireAdmin();

  const response = await apiFetchServer("/api/admin/partner-commissions");
  const data = response.ok
    ? ((await response.json()) as { commissions: PartnerCommissionRow[] })
    : { commissions: [] };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Comissões de parceiros</h1>
        <p className="mt-1 text-sm text-ink-500">
          Uma linha por venda aprovada atribuída a um parceiro (cupom usado ou indicação da amostra grátis), com o
          percentual da faixa de meta vigente na hora da venda. O pagamento é sempre manual: clique em "Pagar" e
          informe a conta Mercado Pago do parceiro.
        </p>
      </div>

      {data.commissions.length === 0 ? (
        <EmptyState
          title="Nenhuma comissão ainda"
          description="Comissões aparecem aqui automaticamente quando uma venda com cupom de parceiro é aprovada."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">Parceiro</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Venda nº</th>
                <th className="px-4 py-3">%</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Situação</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {data.commissions.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-ink-900">{c.partner_name ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-600">{c.user_email ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-600">{c.sale_number}ª</td>
                  <td className="px-4 py-3 text-ink-600">{c.percent_applied}%</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{brl(c.amount_brl)}</td>
                  <td className="px-4 py-3 text-ink-600">{date(c.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={c.status === "paid" ? "positive" : "warning"}>
                      {c.status === "paid" ? `Pago em ${date(c.paid_at)}` : "Pendente"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.status === "pending" && <CommissionPayButton id={c.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

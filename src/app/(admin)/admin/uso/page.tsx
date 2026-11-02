import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { apiFetchServer } from "@/lib/api/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Uso e custos — Admin" };

interface UsageRow {
  userId: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  purchasedAt: string | null;
  paymentMethod: string | null;
  installments: number | null;
  amountPaidBrl: number;
  mpFeeBrl: number;
  refunded: boolean;
  accessExpiresAt: string | null;
  daysLeft: number | null;
  logins: number;
  lastLoginAt: string | null;
  activeDays: number;
  simulationsInterview: number;
  simulationsRaise: number;
  audioMinutes: number;
  starCount: number;
  favorites: number;
  avgScore: number | null;
  weakestCompetency: string | null;
  usageFirst7Days: number;
  aiCostBrl: number;
  totalCostBrl: number;
  marginBrl: number;
  signals: string[];
}

interface UsageReport {
  generatedAt: string;
  usdBrlRate: number;
  totals: {
    users: number;
    activeUsers: number;
    revenueBrl: number;
    mpFeesBrl: number;
    aiCostBrl: number;
    marginBrl: number;
    refunds: number;
  };
  users: UsageRow[];
}

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const date = (v: string | null) =>
  v ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short" }).format(new Date(v)) : "—";

const statusTone: Record<string, "positive" | "neutral" | "warning" | "danger"> = {
  active: "positive",
  pending: "neutral",
  inactive: "neutral",
  refunded: "warning",
  cancelled: "warning",
  blocked: "danger",
};

function signalTone(signal: string): "warning" | "danger" | "brand" {
  if (/Reembolsado|risco|intenso/i.test(signal)) return "danger";
  if (/Renovação|Expirado/i.test(signal)) return "warning";
  return "brand";
}

export default async function AdminUsoPage() {
  await requireAdmin();

  const response = await apiFetchServer("/api/admin/usage");
  if (!response.ok) {
    return (
      <div className="mx-auto max-w-4xl">
        <ErrorState title="Não foi possível carregar o relatório" description="Tente novamente em instantes." />
      </div>
    );
  }
  const report = (await response.json()) as UsageReport;
  const t = report.totals;

  const summary = [
    { label: "Clientes", value: `${t.users} (${t.activeUsers} ativos)` },
    { label: "Receita", value: brl(t.revenueBrl) },
    { label: "Taxas Mercado Pago", value: brl(t.mpFeesBrl) },
    { label: "Custo de IA", value: brl(t.aiCostBrl) },
    { label: "Margem", value: brl(t.marginBrl) },
    { label: "Reembolsos", value: String(t.refunds) },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Uso e custos por usuário</h1>
          <p className="text-sm text-ink-500">
            Custo de IA estimado pelos tokens/minutos informados pela OpenAI (câmbio US$ 1 = R${" "}
            {report.usdBrlRate.toFixed(2).replace(".", ",")}). Uso anterior a 02/11/2026 aparece sem custo.
          </p>
        </div>
        <Link
          href="/admin/uso/exportar"
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Exportar planilha
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {summary.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs uppercase text-ink-500">{s.label}</p>
            <p className="mt-1 text-lg font-semibold text-ink-900">{s.value}</p>
          </Card>
        ))}
      </div>

      {report.users.length === 0 ? (
        <EmptyState title="Nenhum usuário ainda" description="Os dados aparecem após a primeira compra." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-3 py-3">Usuário</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Compra</th>
                <th className="px-3 py-3">Acesso até</th>
                <th className="px-3 py-3 text-right">Logins</th>
                <th className="px-3 py-3 text-right">Dias ativos</th>
                <th className="px-3 py-3 text-right">Simulações</th>
                <th className="px-3 py-3 text-right">STAR</th>
                <th className="px-3 py-3 text-right">Nota média</th>
                <th className="px-3 py-3 text-right">Pago</th>
                <th className="px-3 py-3 text-right">Custo (IA + taxa)</th>
                <th className="px-3 py-3 text-right">Margem</th>
                <th className="px-3 py-3">Sinais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {report.users.map((u) => (
                <tr key={u.userId} className="align-top">
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink-900">{u.name ?? "—"}</p>
                    <p className="text-xs text-ink-500">{u.email}</p>
                    {u.role === "admin" ? <p className="text-xs text-brand-600">admin</p> : null}
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={statusTone[u.status] ?? "neutral"}>{u.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-ink-600">
                    {date(u.purchasedAt)}
                    {u.paymentMethod ? (
                      <p className="text-xs text-ink-400">
                        {u.paymentMethod}
                        {u.installments && u.installments > 1 ? ` · ${u.installments}x` : ""}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-ink-600">
                    {date(u.accessExpiresAt)}
                    {u.daysLeft !== null && u.role !== "admin" ? (
                      <p className="text-xs text-ink-400">{u.daysLeft >= 0 ? `${u.daysLeft} dias` : "expirado"}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-right text-ink-700">
                    {u.logins}
                    <p className="text-xs text-ink-400">{date(u.lastLoginAt)}</p>
                  </td>
                  <td className="px-3 py-3 text-right text-ink-700">{u.activeDays}</td>
                  <td className="px-3 py-3 text-right text-ink-700">
                    {u.simulationsInterview + u.simulationsRaise}
                    {u.simulationsRaise > 0 ? (
                      <p className="text-xs text-ink-400">{u.simulationsRaise} aumento/promoção</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-right text-ink-700">{u.starCount}</td>
                  <td className="px-3 py-3 text-right text-ink-700">
                    {u.avgScore ?? "—"}
                    {u.weakestCompetency ? <p className="text-xs text-ink-400">fraca: {u.weakestCompetency}</p> : null}
                  </td>
                  <td className="px-3 py-3 text-right text-ink-700">{brl(u.amountPaidBrl)}</td>
                  <td className="px-3 py-3 text-right text-ink-700">
                    {brl(u.totalCostBrl)}
                    <p className="text-xs text-ink-400">IA {brl(u.aiCostBrl)}</p>
                  </td>
                  <td className={`px-3 py-3 text-right font-medium ${u.marginBrl < 0 ? "text-red-600" : "text-ink-900"}`}>
                    {brl(u.marginBrl)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex max-w-[16rem] flex-wrap gap-1">
                      {u.signals.map((s) => (
                        <Badge key={s} tone={signalTone(s)}>
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-ink-500">
        A planilha traz todas as colunas (inclusive minutos de áudio, favoritas, uso nos 7 primeiros dias e custo em
        US$). Abra no Excel ou no Google Planilhas.
      </p>
    </div>
  );
}

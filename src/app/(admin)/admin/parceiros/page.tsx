import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { apiFetchServer } from "@/lib/api/server";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import { EmptyState } from "@/components/ui/States";
import { PartnerForm } from "@/components/admin/PartnerForm";
import { PartnerActiveToggle } from "@/components/admin/PartnerActiveToggle";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import type { PartnerRow } from "@/types/database";

export const metadata: Metadata = { title: "Parceiros — Admin" };

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function AdminParceirosPage() {
  await requireAdmin();

  const response = await apiFetchServer("/api/admin/partners");
  const data = response.ok ? ((await response.json()) as { partners: PartnerRow[] }) : { partners: [] };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Parceiros (programa de influenciadores)</h1>
        <p className="mt-1 text-sm text-ink-500">
          Cada parceiro tem um cupom de desconto para divulgar e um link de amostra grátis. As vendas que usarem o
          cupom (ou que vierem de alguém que se cadastrou pela amostra grátis) geram comissão, calculada pelas
          faixas de meta abaixo e paga manualmente em{" "}
          <Link href="/admin/comissoes" className="text-brand-600 underline">
            Comissões
          </Link>
          .
        </p>
      </div>

      <Card>
        <CardTitle>Novo parceiro</CardTitle>
        <div className="mt-3">
          <PartnerForm />
        </div>
      </Card>

      {data.partners.length === 0 ? (
        <EmptyState title="Nenhum parceiro ainda" description="Cadastre o primeiro parceiro pelo formulário acima." />
      ) : (
        <div className="space-y-3">
          {data.partners.map((p) => (
            <Card key={p.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-900">{p.name}</p>
                    <Badge tone={p.active ? "positive" : "neutral"}>{p.active ? "Ativo" : "Desativado"}</Badge>
                  </div>
                  {p.email && <p className="text-sm text-ink-500">{p.email}</p>}
                  <p className="mt-1 text-sm text-ink-600">
                    Cupom <span className="font-mono font-medium">{p.coupon_code}</span> · {p.discount_percent}% de
                    desconto
                  </p>
                </div>
                <PartnerActiveToggle id={p.id} active={p.active} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <CopyLinkButton path={`/amostra/${p.coupon_code}`} />
                <span className="text-xs text-ink-400">Link da amostra grátis para o parceiro divulgar</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-ink-50 p-3 text-center">
                <div>
                  <p className="text-lg font-semibold text-ink-900">{p.salesCount}</p>
                  <p className="text-xs text-ink-500">vendas</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-ink-900">{brl(p.totalCommissionBrl)}</p>
                  <p className="text-xs text-ink-500">comissão total</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-amber-700">{brl(p.pendingCommissionBrl)}</p>
                  <p className="text-xs text-ink-500">pendente de pagar</p>
                </div>
              </div>

              <div className="mt-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-500">Faixas de comissão</p>
                {p.tiers.length === 0 ? (
                  <p className="text-sm text-ink-400">Nenhuma faixa cadastrada — vendas ficam com 0% até cadastrar.</p>
                ) : (
                  <ul className="space-y-0.5 text-sm text-ink-600">
                    {p.tiers
                      .slice()
                      .sort((a, b) => a.min_sale_number - b.min_sale_number)
                      .map((t) => (
                        <li key={t.id}>
                          Da {t.min_sale_number}ª {t.max_sale_number ? `até a ${t.max_sale_number}ª venda` : "venda em diante"}:{" "}
                          <span className="font-medium">{t.percent}%</span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div className="mt-4 border-t border-ink-100 pt-3">
                <Disclosure title="Editar parceiro">
                  <PartnerForm partner={p} />
                </Disclosure>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

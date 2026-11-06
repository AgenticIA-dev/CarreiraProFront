import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { apiFetchServer } from "@/lib/api/server";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import { EmptyState } from "@/components/ui/States";
import { CampaignForm } from "@/components/admin/CampaignForm";
import { CampaignActiveToggle } from "@/components/admin/CampaignActiveToggle";
import type { CampaignRow } from "@/types/database";

export const metadata: Metadata = { title: "Campanhas — Admin" };

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("pt-BR");
}

export default async function AdminCampanhasPage() {
  await requireAdmin();

  const response = await apiFetchServer("/api/admin/campaigns");
  const data = response.ok ? ((await response.json()) as { campaigns: CampaignRow[] }) : { campaigns: [] };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Campanhas promocionais</h1>
        <p className="mt-1 text-sm text-ink-500">
          Desconto independente do programa de parceiros (sem comissão). Sem código, o desconto é aplicado direto
          no preço da página de compra; com código, funciona como um cupom. Nunca acumula com o cupom de parceiro
          nem entre campanhas — vale sempre o maior desconto no momento da compra.
        </p>
      </div>

      <Card>
        <CardTitle>Nova campanha</CardTitle>
        <div className="mt-3">
          <CampaignForm />
        </div>
      </Card>

      {data.campaigns.length === 0 ? (
        <EmptyState
          title="Nenhuma campanha ainda"
          description="Cadastre a primeira campanha pelo formulário acima."
        />
      ) : (
        <div className="space-y-3">
          {data.campaigns.map((c) => {
            const starts = formatDate(c.starts_at);
            const ends = formatDate(c.ends_at);
            return (
              <Card key={c.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink-900">
                        {c.code ? <span className="font-mono">{c.code}</span> : "Desconto automático (sem código)"}
                      </p>
                      <Badge tone={c.active ? "positive" : "neutral"}>{c.active ? "Ativa" : "Desativada"}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-600">
                      {c.discount_percent}% de desconto
                      {(starts || ends) && (
                        <>
                          {" · "}
                          {starts ? `de ${starts}` : "sem início definido"} até {ends ?? "sem fim definido"}
                        </>
                      )}
                    </p>
                  </div>
                  <CampaignActiveToggle id={c.id} active={c.active} />
                </div>

                <div className="mt-4 border-t border-ink-100 pt-3">
                  <Disclosure title="Editar campanha">
                    <CampaignForm campaign={c} />
                  </Disclosure>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

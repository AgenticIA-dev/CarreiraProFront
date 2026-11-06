import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { apiFetchServer } from "@/lib/api/server";
import { Card, CardTitle } from "@/components/ui/Card";
import { CheckoutSettingsForm } from "@/components/admin/CheckoutSettingsForm";
import type { CheckoutSettingsRow } from "@/types/database";

export const metadata: Metadata = { title: "Configurações — Admin" };

interface EffectiveConfig {
  configured: boolean;
  price: number | null;
  priceFormatted: string | null;
  title: string;
  accessMonths: number | null;
  accessLabel: string | null;
}

const fallbackEffective: EffectiveConfig = {
  configured: false,
  price: null,
  priceFormatted: null,
  title: "",
  accessMonths: null,
  accessLabel: null,
};

export default async function AdminConfiguracoesPage() {
  await requireAdmin();

  const response = await apiFetchServer("/api/admin/settings");
  const data = response.ok
    ? ((await response.json()) as { settings: CheckoutSettingsRow | null; effective: EffectiveConfig })
    : { settings: null, effective: fallbackEffective };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Configurações da oferta</h1>
        <p className="mt-1 text-sm text-ink-500">
          Preço, duração do acesso e título exibido no pagamento. Altera na hora a página de compra — não precisa
          de novo deploy.
        </p>
      </div>

      {!data.effective.configured && (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          O checkout ainda não está configurado (nem aqui, nem por variável de ambiente) — as vendas ficam
          desativadas até preencher o preço e a duração abaixo.
        </div>
      )}

      <Card>
        <CardTitle>Em uso agora</CardTitle>
        <p className="mt-2 text-sm text-ink-600">
          {data.effective.priceFormatted ?? "Preço não definido"} ·{" "}
          {data.effective.accessLabel ?? "Duração não definida"}
        </p>
      </Card>

      <Card>
        <CardTitle>Editar</CardTitle>
        <div className="mt-3">
          <CheckoutSettingsForm settings={data.settings} />
        </div>
      </Card>
    </div>
  );
}

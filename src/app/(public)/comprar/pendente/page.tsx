import Link from "next/link";
import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Pagamento em análise",
  description: "Pagamento em análise no CarreiraPro.",
};

/**
 * Página de retorno do Mercado Pago para pagamento pendente/em análise
 * (`back_urls.pending` — ex.: boleto ou pagamentos que dependem de
 * aprovação do meio de pagamento escolhido). O acesso é liberado pelo
 * webhook assim que o status mudar para aprovado.
 */
export default function CompraPendentePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
      <Card>
        <Clock className="mx-auto mb-3 h-10 w-10 text-amber-600" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-ink-900">Pagamento em análise</h1>
        <p className="mt-2 text-sm text-ink-500">
          Seu pagamento está sendo processado pelo Mercado Pago. Assim que for aprovado, você
          recebe por e-mail o convite de acesso ao CarreiraPro — isso pode levar alguns minutos
          (ou mais, dependendo do meio de pagamento escolhido).
        </p>
        <Link href="/" className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-ink-200 px-5 text-sm font-medium text-ink-900 hover:bg-ink-50">
          Voltar ao início
        </Link>
      </Card>
    </div>
  );
}

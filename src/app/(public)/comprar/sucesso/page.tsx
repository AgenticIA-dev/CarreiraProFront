import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Pagamento aprovado",
  description: "Pagamento aprovado no CarreiraPro.",
};

/**
 * Página de retorno do Mercado Pago para pagamento aprovado
 * (`back_urls.success`). O acesso em si é liberado pelo webhook, de forma
 * assíncrona — esta página nunca concede acesso por si mesma, apenas informa
 * o próximo passo.
 */
export default function CompraSucessoPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
      <Card>
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-ink-900">Pagamento aprovado!</h1>
        <p className="mt-2 text-sm text-ink-500">
          Em poucos minutos você receberá um e-mail de convite para criar sua senha e acessar o
          CarreiraPro. Se não encontrar, verifique também a caixa de spam.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Ir para a tela de entrada
        </Link>
      </Card>
    </div>
  );
}

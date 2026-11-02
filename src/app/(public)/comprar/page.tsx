"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { apiUrl } from "@/lib/api/client";
import { company, companyComplete, LEGAL_VERSION, orPending } from "@/lib/legal/company";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
});

interface CheckoutInfo {
  configured: boolean;
  priceFormatted: string | null;
  title: string;
  accessLabel: string | null;
  termsVersion: string;
}

const included = [
  "Banco com 146 perguntas reais: 126 de entrevista (6 competências × 3 níveis) e 20 de aumento e promoção",
  "Gerador de respostas pelo método STAR no padrão sênior",
  "Simulador por áudio com análise detalhada da sua resposta",
  "Modo de preparação para pedir aumento ou promoção",
];

/**
 * Checkout direto do VoceUP: mostra preço e condições (Decreto 7.962/2013),
 * exige o aceite dos Termos e da Política de Privacidade e redireciona ao
 * Checkout Pro do Mercado Pago. O acesso é liberado automaticamente (convite
 * por e-mail) depois que o pagamento é aprovado, via webhook.
 */
export default function ComprarPage() {
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState<CheckoutInfo | null>(null);
  const [infoError, setInfoError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl("/api/checkout/info"))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: CheckoutInfo) => !cancelled && setInfo(data))
      .catch(() => !cancelled && setInfoError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const termsMismatch = Boolean(info && info.termsVersion !== LEGAL_VERSION);
  const canSell = Boolean(info?.configured) && companyComplete && !termsMismatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldError(null);

    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Informe um e-mail válido.");
      return;
    }
    if (!accepted) {
      setFormError("Para continuar, aceite os Termos de Uso e a Política de Privacidade.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(apiUrl("/api/checkout/create-preference"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.data.email, acceptedTerms: true, termsVersion: LEGAL_VERSION }),
      });

      const data = (await response.json().catch(() => null)) as { initPoint?: string; error?: string } | null;

      if (!response.ok || !data?.initPoint) {
        setFormError(data?.error ?? "Não foi possível iniciar o pagamento agora. Tente novamente em instantes.");
        return;
      }

      window.location.href = data.initPoint;
    } catch {
      setFormError("Não foi possível iniciar o pagamento agora. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink-900">Garantir acesso ao VoceUP</h1>
      <p className="mt-1.5 text-sm text-ink-500">
        Informe o e-mail que você vai usar para entrar na plataforma. Depois de confirmado o
        pagamento, enviamos o convite de acesso para ele.
      </p>

      {/* Resumo da oferta — preço e condições antes do pagamento (Decreto 7.962/2013). */}
      <Card className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-ink-900">{info?.title ?? "VoceUP — Acesso completo"}</p>
          <p className="text-2xl font-semibold text-ink-900">
            {info?.priceFormatted ?? (infoError ? "—" : "…")}
          </p>
        </div>
        <p className="mt-1 text-sm text-ink-600">
          {info?.accessLabel ?? "Duração do acesso a definir"} · pagamento único, sem renovação automática ·
          Pix, cartão de débito ou cartão de crédito à vista ou em até 3x (juros do parcelamento por conta do
          comprador), no Mercado Pago
        </p>
        <ul className="mt-4 space-y-1.5">
          {included.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-ink-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-positive-600" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-lg bg-ink-50 p-3 text-xs leading-relaxed text-ink-600">
          <strong className="text-ink-800">Direito de arrependimento:</strong> você pode desistir da compra em
          até 7 dias corridos a partir da confirmação do pagamento e receber o valor integral de volta (art. 49
          do Código de Defesa do Consumidor). Basta pedir pelo e-mail {orPending(company.supportEmail)}. Veja
          os detalhes nos{" "}
          <Link href="/termos" className="underline">
            Termos de Uso
          </Link>
          .
        </p>
      </Card>

      <Card className="mt-4">
        {!canSell ? (
          <p role="status" className="text-sm text-ink-600">
            {infoError
              ? "Não conseguimos carregar as condições de compra agora. Tente novamente em instantes."
              : !info
                ? "Carregando condições…"
                : termsMismatch
                  ? "Os termos foram atualizados. Recarregue a página para ver a versão atual."
                  : "As vendas ainda não estão abertas. Volte em breve."}
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={fieldError ? "email-error" : undefined}
                placeholder="seuemail@exemplo.com"
              />
              <FieldError>{fieldError}</FieldError>
            </div>

            <label className="flex items-start gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0"
                required
              />
              <span>
                Li e aceito os{" "}
                <Link href="/termos" target="_blank" className="font-medium text-brand-600 underline">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link href="/privacidade" target="_blank" className="font-medium text-brand-600 underline">
                  Política de Privacidade
                </Link>
                .
              </span>
            </label>

            {formError && (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading} disabled={!accepted}>
              Ir para pagamento{info?.priceFormatted ? ` · ${info.priceFormatted}` : ""}
            </Button>

            <p className="flex items-start gap-2 text-xs text-ink-400">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Pagamento processado pelo Mercado Pago. O VoceUP não armazena dados do seu cartão.
            </p>
          </form>
        )}
      </Card>

      <p className="mt-4 text-xs leading-relaxed text-ink-400">
        Vendido por {orPending(company.legalName)} · CNPJ/CPF {orPending(company.document)} ·{" "}
        {orPending(company.address)} · Atendimento: {orPending(company.supportEmail)}
      </p>

      <p className="mt-6 text-center text-sm text-ink-500">
        Já comprou?{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

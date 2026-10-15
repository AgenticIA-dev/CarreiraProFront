"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { apiUrl } from "@/lib/api/client";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
});

/**
 * Checkout direto do CarreiraPro: o comprador informa o e-mail que vai usar
 * para acessar a plataforma, e é redirecionado ao Checkout Pro do Mercado
 * Pago para concluir o pagamento. O acesso é liberado automaticamente
 * (convite por e-mail) depois que o pagamento é aprovado, via webhook.
 */
export default function ComprarPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldError(null);

    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Informe um e-mail válido.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(apiUrl("/api/checkout/create-preference"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.data.email }),
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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink-900">Garantir acesso ao CarreiraPro</h1>
      <p className="mt-1.5 text-sm text-ink-500">
        Informe o e-mail que você vai usar para entrar na plataforma. Depois de confirmado o
        pagamento, enviamos o convite de acesso para ele.
      </p>

      <Card className="mt-6">
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

          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Ir para pagamento
          </Button>

          <p className="flex items-start gap-2 text-xs text-ink-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Pagamento processado pelo Mercado Pago. O CarreiraPro não armazena dados do seu
            cartão.
          </p>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-500">
        Já comprou?{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

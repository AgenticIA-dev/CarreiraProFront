"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/api/client";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

/**
 * Fluxo de recuperação de senha (PROMPT MESTRE §45).
 *
 * Importante: a mensagem de retorno é sempre genérica, para não revelar se
 * um e-mail existe ou não na base.
 */
export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "E-mail inválido.");
      return;
    }

    setIsLoading(true);
    try {
      // O backend monta o link de redefinição (nunca aceita a URL do cliente)
      // e sempre responde igual, exista ou não o e-mail.
      await fetch(apiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
    } catch {
      // Independentemente de erro técnico, não revelamos detalhes: a UI
      // sempre mostra a mensagem genérica de sucesso a seguir.
    } finally {
      setIsLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink-900">Esqueci minha senha</h1>
      <p className="mt-1.5 text-sm text-ink-500">
        Informe seu e-mail para receber instruções de redefinição de senha.
      </p>

      <Card className="mt-6">
        {submitted ? (
          <p role="status" className="text-sm text-ink-700">
            Se houver uma conta associada a este e-mail, enviaremos instruções para redefinir sua
            senha.
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
                aria-invalid={Boolean(error)}
              />
              <FieldError>{error}</FieldError>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Enviar instruções
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

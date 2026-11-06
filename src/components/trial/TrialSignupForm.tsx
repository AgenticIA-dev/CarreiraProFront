"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { apiUrl } from "@/lib/api/client";

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  name: z.string().trim().max(120).optional(),
});

/** Cadastro da amostra grátis (link de parceiro) — envia e-mail/nome para `POST /api/trial/signup`. */
export function TrialSignupForm({ code }: { code: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState<{ email: string; days: number; emailSent: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldError(null);

    const parsed = schema.safeParse({ email, name: name || undefined });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Informe um e-mail válido.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(apiUrl("/api/trial/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email: parsed.data.email, name: parsed.data.name ?? null }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; email?: string; days?: number; emailSent?: boolean; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setFormError(data?.error ?? "Não foi possível liberar a amostra grátis agora.");
        return;
      }
      setDone({ email: data.email ?? parsed.data.email, days: data.days ?? 1, emailSent: data.emailSent !== false });
    } catch {
      setFormError("Não foi possível liberar a amostra grátis agora. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-positive-200 bg-positive-50 p-5 text-sm text-positive-900">
        <p className="font-medium">Amostra grátis liberada para {done.email}!</p>
        <p className="mt-1.5">
          {done.emailSent
            ? `Enviamos um e-mail para você criar sua senha. O acesso dura ${done.days} ${
                done.days === 1 ? "dia" : "dias"
              }.`
            : 'O acesso foi liberado, mas não conseguimos enviar o e-mail agora. Use "Esqueci minha senha" na tela de login para criar sua senha.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="trial-email">E-mail</Label>
        <Input
          id="trial-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(fieldError)}
          placeholder="seuemail@exemplo.com"
        />
        <FieldError>{fieldError}</FieldError>
      </div>
      <div>
        <Label htmlFor="trial-name">Nome (opcional)</Label>
        <Input id="trial-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      {formError && (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      )}
      <Button type="submit" className="w-full" isLoading={isLoading}>
        Começar amostra grátis
      </Button>
    </form>
  );
}

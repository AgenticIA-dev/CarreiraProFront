"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

const ERROR_MESSAGES: Record<string, string> = {
  inativo:
    "Seu acesso não está ativo no momento. Se você concluiu a compra recentemente, aguarde alguns minutos ou contate o suporte.",
  perfil: "Não encontramos seu perfil. Contate o suporte para verificarmos seu acesso.",
  configuracao: "Não foi possível validar seu acesso agora. Tente novamente em instantes.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/app";
  const urlError = searchParams.get("erro");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) {
        setFormError("E-mail ou senha incorretos.");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setFormError("Não foi possível entrar agora. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink-900">Entrar</h1>
      <p className="mt-1.5 text-sm text-ink-500">
        Use o e-mail e a senha enviados após a confirmação da sua compra.
      </p>

      {urlError && ERROR_MESSAGES[urlError] && (
        <div role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          {ERROR_MESSAGES[urlError]}
        </div>
      )}

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
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            <FieldError>{fieldErrors.email}</FieldError>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link href="/esqueci-senha" className="text-sm text-brand-600 hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <FieldError>{fieldErrors.password}</FieldError>
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Entrar
          </Button>
        </form>
      </Card>
    </div>
  );
}

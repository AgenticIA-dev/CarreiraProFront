"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

/**
 * Página acessada a partir do link de redefinição enviado por e-mail.
 * O Supabase já cria uma sessão temporária de recuperação ao seguir o link
 * (token de uso único, com expiração controlada pelo Supabase Auth).
 */
export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
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
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) {
        setFormError(
          "Não foi possível redefinir sua senha. O link pode ter expirado — solicite um novo."
        );
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setFormError("Não foi possível redefinir sua senha agora. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink-900">Definir nova senha</h1>

      <Card className="mt-6">
        {done ? (
          <p role="status" className="text-sm text-positive-700">
            Senha redefinida com sucesso. Redirecionando para o login…
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
              />
              <FieldError>{fieldErrors.password}</FieldError>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
              />
              <FieldError>{fieldErrors.confirmPassword}</FieldError>
            </div>
            {formError && (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            )}
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Salvar nova senha
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

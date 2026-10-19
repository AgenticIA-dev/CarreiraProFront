"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api/client";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

const EXPIRED_LINK_MESSAGE =
  "Não foi possível redefinir sua senha. O link pode ter expirado — solicite um novo.";

/**
 * Página acessada a partir do link de e-mail — recuperação de senha ou
 * convite enviado após a compra (os dois são montados pelo backend).
 * O link traz um token de uso único no fragmento da URL (`#token=...`), que
 * nunca chega a nenhum servidor por si só; a página o lê, limpa da barra de
 * endereço e o envia ao backend (`POST /api/auth/reset-password`) junto com
 * a nova senha.
 */
export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("token");
    if (token) {
      setLinkToken(token);
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      setFormError(EXPIRED_LINK_MESSAGE);
    }
  }, []);

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

    if (!linkToken) {
      setFormError(EXPIRED_LINK_MESSAGE);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(apiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, token: linkToken }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setFormError(data?.error ?? EXPIRED_LINK_MESSAGE);
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

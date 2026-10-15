"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { apiFetch } from "@/lib/api/client";

export function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSuccess(false);

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch("/api/account/password", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Não foi possível alterar sua senha agora.");
        return;
      }
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setFormError("Não foi possível alterar sua senha agora. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <div>
        <Label htmlFor="new-password">Nova senha</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(fieldErrors.password)}
        />
        <FieldError>{fieldErrors.password}</FieldError>
      </div>
      <div>
        <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
        <Input
          id="confirm-new-password"
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
      <div className="flex items-center gap-3">
        <Button type="submit" isLoading={isLoading}>
          Alterar senha
        </Button>
        {success && <span className="text-sm text-positive-700">Senha alterada.</span>}
      </div>
    </form>
  );
}

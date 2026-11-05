"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api/client";
import type { UserExperienceLevel } from "@/types/database";

const LEVELS: { value: UserExperienceLevel | ""; label: string }[] = [
  { value: "", label: "Não informar" },
  { value: "junior", label: "Júnior" },
  { value: "pleno", label: "Pleno" },
  { value: "senior", label: "Sênior" },
];

export function ProfileForm({
  initialName,
  initialExperienceLevel,
}: {
  initialName: string;
  initialExperienceLevel: UserExperienceLevel | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [experienceLevel, setExperienceLevel] = useState<UserExperienceLevel | "">(initialExperienceLevel ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/account/profile", {
        method: "PATCH",
        body: JSON.stringify({ name, experienceLevel: experienceLevel || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar agora.");
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Não foi possível salvar agora. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(error)}
          />
          <FieldError>{error}</FieldError>
        </div>
        <Button type="submit" isLoading={isLoading}>
          Salvar
        </Button>
        {success && <span className="text-sm text-positive-700">Salvo.</span>}
      </div>

      <div>
        <Label htmlFor="experienceLevel">Nível de experiência</Label>
        <p className="mb-1.5 text-xs text-ink-500">
          Usado para calibrar a avaliação do simulador e sugerir a dificuldade das perguntas ao seu nível.
        </p>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.value || "none"}
              type="button"
              onClick={() => setExperienceLevel(l.value)}
              aria-pressed={experienceLevel === l.value}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                experienceLevel === l.value
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:bg-ink-100"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

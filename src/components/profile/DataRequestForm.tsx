"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api/client";

const options = [
  { value: "access", label: "Acesso aos meus dados" },
  { value: "correction", label: "Correção de dados" },
  { value: "deletion", label: "Eliminação dos meus dados" },
] as const;

export function DataRequestForm() {
  const router = useRouter();
  const [type, setType] = useState<(typeof options)[number]["value"]>("access");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/account/data-requests", {
        method: "POST",
        body: JSON.stringify({ type, details }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível registrar sua solicitação agora.");
        return;
      }
      setSuccess(true);
      setDetails("");
      router.refresh();
    } catch {
      setError("Não foi possível registrar sua solicitação agora. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <div>
        <Label htmlFor="request-type">Tipo de solicitação</Label>
        <select
          id="request-type"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="request-details">Detalhes (opcional)</Label>
        <Textarea
          id="request-details"
          rows={3}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Descreva sua solicitação, se necessário."
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" isLoading={isLoading}>
          Enviar solicitação
        </Button>
        {success && <span className="text-sm text-positive-700">Solicitação registrada.</span>}
      </div>
    </form>
  );
}

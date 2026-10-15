"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api/client";

const fields: { key: "situation" | "task" | "action" | "result"; label: string; hint: string }[] = [
  {
    key: "situation",
    label: "Situação",
    hint: "Qual era o contexto? Onde e quando isso aconteceu?",
  },
  {
    key: "task",
    label: "Tarefa",
    hint: "Qual era sua responsabilidade ou o desafio a resolver?",
  },
  {
    key: "action",
    label: "Ação",
    hint: "O que você efetivamente fez?",
  },
  {
    key: "result",
    label: "Resultado",
    hint: "O que aconteceu depois? Se tiver um número real, inclua-o.",
  },
];

export function StarForm({ questionId }: { questionId?: string | null }) {
  const [values, setValues] = useState({ situation: "", task: "", action: "", result: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGenerated(null);
    setIsLoading(true);

    try {
      const res = await apiFetch("/api/star/generate", {
        method: "POST",
        body: JSON.stringify({ ...values, questionId: questionId ?? null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível gerar sua resposta agora.");
        return;
      }
      setGenerated(data.starResponse.generated_response);
      setNotes(data.notes ?? []);
    } catch {
      setError("Não foi possível gerar sua resposta agora. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <Label htmlFor={field.key}>{field.label}</Label>
            <p className="mb-1.5 -mt-1 text-xs text-ink-400">{field.hint}</p>
            <Textarea
              id={field.key}
              rows={3}
              value={values[field.key]}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
            />
          </div>
        ))}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={isLoading}>
          <Wand2 className="h-4 w-4" aria-hidden="true" />
          Estruturar minha resposta
        </Button>
      </form>

      {generated && (
        <Card>
          <h2 className="text-sm font-semibold text-ink-900">Sua resposta estruturada</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">{generated}</p>

          {notes.length > 0 && (
            <div className="mt-4 rounded-xl bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-800">Observações</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-amber-800">
                {notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

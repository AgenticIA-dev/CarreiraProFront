"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/** Formulário do admin para liberar acesso de cortesia (testador) e enviar o convite. */
export function TesterInviteForm({ defaultDays }: { defaultDays: number }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [days, setDays] = useState(String(defaultDays));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    const daysNumber = Number(days);
    if (!Number.isInteger(daysNumber) || daysNumber < 1 || daysNumber > 90) {
      setMessage({ tone: "error", text: "Os dias de acesso devem ser um número entre 1 e 90." });
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch("/api/admin/testers", {
        method: "POST",
        body: JSON.stringify({ email, name: name || null, days: daysNumber }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        renewed?: boolean;
        emailSent?: boolean;
        accessExpiresAt?: string;
      } | null;
      if (!response.ok) {
        setMessage({ tone: "error", text: data?.error ?? "Não foi possível liberar o acesso agora." });
        return;
      }
      const until = data?.accessExpiresAt
        ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short" }).format(
            new Date(data.accessExpiresAt)
          )
        : "";
      setMessage({
        tone: data?.emailSent === false ? "error" : "ok",
        text:
          (data?.renewed ? "Acesso de cortesia renovado" : "Acesso de cortesia liberado") +
          (until ? ` até ${until}. ` : ". ") +
          (data?.emailSent === false
            ? "Mas o e-mail de convite NÃO foi enviado (confira o SMTP). A pessoa pode usar \"Esqueci minha senha\"."
            : "Convite enviado por e-mail."),
      });
      setEmail("");
      setName("");
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: "Não foi possível liberar o acesso agora." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[2fr_2fr_1fr]">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">E-mail *</span>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pessoa@email.com" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Nome</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Opcional" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Dias de acesso</span>
          <Input type="number" min={1} max={90} value={days} onChange={(e) => setDays(e.target.value)} />
        </label>
      </div>
      <Button type="submit" isLoading={loading} disabled={loading}>
        Convidar testador
      </Button>
      {message ? (
        <p
          role="status"
          className={`rounded-lg p-3 text-sm ${message.tone === "ok" ? "bg-positive-50 text-positive-700" : "bg-red-50 text-red-700"}`}
        >
          {message.text}
        </p>
      ) : null}
    </form>
  );
}

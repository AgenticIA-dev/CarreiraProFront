"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CheckoutSettingsRow } from "@/types/database";

/**
 * Preço, duração do acesso e título — reflete na hora na página /comprar
 * (ela busca `GET /api/checkout/info` a cada carregamento, sem precisar de
 * novo deploy).
 */
export function CheckoutSettingsForm({ settings }: { settings: CheckoutSettingsRow | null }) {
  const router = useRouter();
  const [price, setPrice] = useState(
    settings?.priceBrl !== null && settings?.priceBrl !== undefined ? String(settings.priceBrl) : ""
  );
  const [lifetime, setLifetime] = useState(settings?.accessLifetime ?? false);
  const [months, setMonths] = useState(
    settings?.accessMonths !== null && settings?.accessMonths !== undefined ? String(settings.accessMonths) : ""
  );
  const [title, setTitle] = useState(settings?.title ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const priceNumber = price.trim() ? Number(price.replace(",", ".")) : NaN;
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setMessage({ tone: "error", text: "Informe um preço válido, maior que zero." });
      return;
    }

    let monthsNumber: number | null = null;
    if (!lifetime) {
      monthsNumber = months.trim() ? Number(months) : NaN;
      if (!Number.isInteger(monthsNumber) || monthsNumber <= 0) {
        setMessage({ tone: "error", text: "Informe a duração do acesso em meses, ou marque vitalício." });
        return;
      }
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          priceBrl: priceNumber,
          accessLifetime: lifetime,
          accessMonths: lifetime ? null : monthsNumber,
          title: title.trim() || null,
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setMessage({ tone: "error", text: data?.error ?? "Não foi possível salvar agora." });
        return;
      }
      setMessage({ tone: "ok", text: "Configurações salvas." });
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: "Não foi possível salvar agora." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Preço (R$) *</span>
          <Input
            type="number"
            min={0}
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex.: 97.00"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Título exibido no pagamento</span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VoceUP — Acesso completo"
          />
        </label>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={lifetime}
            onChange={(e) => setLifetime(e.target.checked)}
            className="h-4 w-4"
          />
          Acesso vitalício (sem expiração)
        </label>
        {!lifetime && (
          <label className="mt-2 block max-w-[220px] text-sm">
            <span className="mb-1 block font-medium text-ink-700">Duração do acesso (meses) *</span>
            <Input
              type="number"
              min={1}
              required={!lifetime}
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              placeholder="Ex.: 3"
            />
          </label>
        )}
      </div>

      <Button type="submit" isLoading={loading} disabled={loading}>
        Salvar configurações
      </Button>
      {message && (
        <p
          role="status"
          className={`rounded-lg p-3 text-sm ${
            message.tone === "ok" ? "bg-positive-50 text-positive-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}

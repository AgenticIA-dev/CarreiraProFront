"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CampaignRow } from "@/types/database";

function toDateInput(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

/**
 * Formulário de campanha — cria (sem `campaign`) ou edita (com `campaign`).
 * Sem código = desconto automático (aplicado direto no preço, sem precisar
 * digitar nada). Com código = cupom que o visitante digita no checkout,
 * igual ao cupom de parceiro — mas sem comissão.
 */
export function CampaignForm({ campaign, onSaved }: { campaign?: CampaignRow; onSaved?: () => void }) {
  const router = useRouter();
  const isEdit = Boolean(campaign);
  const [hasCode, setHasCode] = useState(Boolean(campaign?.code));
  const [code, setCode] = useState(campaign?.code ?? "");
  const [discountPercent, setDiscountPercent] = useState(String(campaign?.discount_percent ?? 10));
  const [startsAt, setStartsAt] = useState(toDateInput(campaign?.starts_at ?? null));
  const [endsAt, setEndsAt] = useState(toDateInput(campaign?.ends_at ?? null));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const discount = Number(discountPercent);
    if (!Number.isInteger(discount) || discount < 1 || discount > 100) {
      setMessage({ tone: "error", text: "O desconto deve ser um número entre 1 e 100." });
      return;
    }
    if (hasCode && !code.trim()) {
      setMessage({
        tone: "error",
        text: 'Informe o código do cupom, ou desmarque "tem código" para desconto automático.',
      });
      return;
    }
    if (startsAt && endsAt && endsAt < startsAt) {
      setMessage({ tone: "error", text: "A data final deve ser depois da inicial." });
      return;
    }

    setLoading(true);
    try {
      const body = {
        code: hasCode ? code.trim().toUpperCase() : null,
        discountPercent: discount,
        startsAt: startsAt ? `${startsAt}T00:00:00` : null,
        endsAt: endsAt ? `${endsAt}T23:59:59` : null,
      };
      const res = await apiFetch(isEdit ? `/api/admin/campaigns/${campaign!.id}` : "/api/admin/campaigns", {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setMessage({ tone: "error", text: data?.error ?? "Não foi possível salvar agora." });
        return;
      }
      setMessage({ tone: "ok", text: isEdit ? "Campanha atualizada." : "Campanha criada." });
      if (!isEdit) {
        setHasCode(false);
        setCode("");
        setDiscountPercent("10");
        setStartsAt("");
        setEndsAt("");
      }
      onSaved?.();
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: "Não foi possível salvar agora." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={hasCode}
          onChange={(e) => setHasCode(e.target.checked)}
          className="h-4 w-4"
        />
        Cupom com código (desmarcado = desconto automático, sem precisar digitar nada)
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {hasCode && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Código *</span>
            <Input
              required={hasCode}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex.: BLACKFRIDAY"
            />
          </label>
        )}
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Desconto (%) *</span>
          <Input
            type="number"
            min={1}
            max={100}
            required
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Início (opcional)</span>
          <Input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Fim (opcional)</span>
          <Input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </label>
      </div>

      <Button type="submit" isLoading={loading} disabled={loading}>
        {isEdit ? "Salvar alterações" : "Criar campanha"}
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

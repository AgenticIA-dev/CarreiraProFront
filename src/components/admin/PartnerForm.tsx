"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { PartnerCommissionTierRow, PartnerRow } from "@/types/database";

interface TierInput {
  minSaleNumber: string;
  maxSaleNumber: string; // vazio = sem limite superior
  percent: string;
}

function tiersToInput(tiers: PartnerCommissionTierRow[]): TierInput[] {
  if (tiers.length === 0) {
    return [{ minSaleNumber: "1", maxSaleNumber: "", percent: "20" }];
  }
  return tiers.map((t) => ({
    minSaleNumber: String(t.min_sale_number),
    maxSaleNumber: t.max_sale_number === null ? "" : String(t.max_sale_number),
    percent: String(t.percent),
  }));
}

/**
 * Formulário de parceiro — cria (sem `partner`) ou edita (com `partner`).
 * As faixas de comissão são linhas livres (da venda X até a venda Y = Z%);
 * salvar substitui o conjunto inteiro de faixas desse parceiro.
 */
export function PartnerForm({ partner, onSaved }: { partner?: PartnerRow; onSaved?: () => void }) {
  const router = useRouter();
  const isEdit = Boolean(partner);
  const [name, setName] = useState(partner?.name ?? "");
  const [email, setEmail] = useState(partner?.email ?? "");
  const [couponCode, setCouponCode] = useState(partner?.coupon_code ?? "");
  const [discountPercent, setDiscountPercent] = useState(String(partner?.discount_percent ?? 10));
  const [tiers, setTiers] = useState<TierInput[]>(tiersToInput(partner?.tiers ?? []));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  function updateTier(i: number, patch: Partial<TierInput>) {
    setTiers((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function addTier() {
    const last = tiers[tiers.length - 1];
    const nextMin = last?.maxSaleNumber ? String(Number(last.maxSaleNumber) + 1) : "";
    setTiers((prev) => [...prev, { minSaleNumber: nextMin, maxSaleNumber: "", percent: "" }]);
  }
  function removeTier(i: number) {
    setTiers((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const parsedTiers: { minSaleNumber: number; maxSaleNumber: number | null; percent: number }[] = [];
    for (const t of tiers) {
      const min = Number(t.minSaleNumber);
      const percent = Number(t.percent);
      if (!Number.isInteger(min) || min < 1 || !Number.isInteger(percent) || percent < 0 || percent > 100) {
        setMessage({
          tone: "error",
          text: "Confira as faixas de comissão: \"da venda\" e \"comissão (%)\" são obrigatórios.",
        });
        return;
      }
      const max = t.maxSaleNumber.trim() ? Number(t.maxSaleNumber) : null;
      if (max !== null && (!Number.isInteger(max) || max < min)) {
        setMessage({ tone: "error", text: "A venda final da faixa não pode ser menor que a inicial." });
        return;
      }
      parsedTiers.push({ minSaleNumber: min, maxSaleNumber: max, percent });
    }

    const discount = Number(discountPercent);
    if (!Number.isInteger(discount) || discount < 0 || discount > 100) {
      setMessage({ tone: "error", text: "O desconto do cupom deve ser um número entre 0 e 100." });
      return;
    }
    if (!couponCode.trim()) {
      setMessage({ tone: "error", text: "Informe o cupom do parceiro." });
      return;
    }

    setLoading(true);
    try {
      const body = {
        name,
        email: email || null,
        couponCode: couponCode.trim().toUpperCase(),
        discountPercent: discount,
        tiers: parsedTiers,
      };
      const res = await apiFetch(isEdit ? `/api/admin/partners/${partner!.id}` : "/api/admin/partners", {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setMessage({ tone: "error", text: data?.error ?? "Não foi possível salvar agora." });
        return;
      }
      setMessage({ tone: "ok", text: isEdit ? "Parceiro atualizado." : "Parceiro criado." });
      if (!isEdit) {
        setName("");
        setEmail("");
        setCouponCode("");
        setDiscountPercent("10");
        setTiers(tiersToInput([]));
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
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Nome *</span>
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do parceiro" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">E-mail</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Opcional"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Cupom *</span>
          <Input
            required
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Ex.: PARCEIRO10"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Desconto do cupom (%) *</span>
          <Input
            type="number"
            min={0}
            max={100}
            required
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
          />
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink-700">Faixas de comissão por meta de vendas</p>
        <div className="space-y-2">
          {tiers.map((t, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
              <label className="block text-xs">
                <span className="mb-1 block text-ink-500">Da venda</span>
                <Input
                  type="number"
                  min={1}
                  value={t.minSaleNumber}
                  onChange={(e) => updateTier(i, { minSaleNumber: e.target.value })}
                />
              </label>
              <label className="block text-xs">
                <span className="mb-1 block text-ink-500">Até (vazio = sem limite)</span>
                <Input
                  type="number"
                  min={1}
                  value={t.maxSaleNumber}
                  onChange={(e) => updateTier(i, { maxSaleNumber: e.target.value })}
                />
              </label>
              <label className="block text-xs">
                <span className="mb-1 block text-ink-500">Comissão (%)</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={t.percent}
                  onChange={(e) => updateTier(i, { percent: e.target.value })}
                />
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTier(i)}
                aria-label="Remover faixa"
                disabled={tiers.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={addTier}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Adicionar faixa
        </Button>
        <p className="mt-1.5 text-xs text-ink-400">
          Ex.: 20% da venda 1 até a 20, 25% da 21 até a 30, 30% da 31 em diante (deixe &quot;até&quot; vazio na última).
        </p>
      </div>

      <Button type="submit" isLoading={loading} disabled={loading}>
        {isEdit ? "Salvar alterações" : "Criar parceiro"}
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

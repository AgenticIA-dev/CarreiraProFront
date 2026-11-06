"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * Paga uma comissão pendente via Payouts API do Mercado Pago. Pede a conta
 * (e-mail ou ID Mercado Pago) do parceiro na hora — não é guardada, porque o
 * pagamento é sempre manual e revisado pelo admin (ver admin/partner-commissions.ts).
 */
export function CommissionPayButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [receiverId, setReceiverId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    if (!receiverId.trim()) {
      setError("Informe a conta Mercado Pago do parceiro.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/admin/partner-commissions/${id}/pay`, {
        method: "POST",
        body: JSON.stringify({ receiverId: receiverId.trim() }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Não foi possível pagar agora.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Não foi possível pagar agora.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        Pagar
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-1.5">
        <Input
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          placeholder="E-mail/ID Mercado Pago"
          className="h-8 w-44 text-xs"
        />
        <Button type="button" size="sm" isLoading={loading} onClick={pay}>
          Confirmar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={loading}>
          Cancelar
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

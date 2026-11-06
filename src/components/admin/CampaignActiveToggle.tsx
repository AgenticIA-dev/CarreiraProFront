"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";

/** Ativa/desativa uma campanha (desativar só impede o desconto — não apaga o histórico de vendas que a usaram). */
export function CampaignActiveToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = active
        ? await apiFetch(`/api/admin/campaigns/${id}`, { method: "DELETE" })
        : await apiFetch(`/api/admin/campaigns/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ active: true }),
          });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" isLoading={loading} onClick={toggle}>
      {active ? "Desativar" : "Reativar"}
    </Button>
  );
}

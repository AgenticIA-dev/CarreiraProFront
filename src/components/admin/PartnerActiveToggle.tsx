"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";

/** Ativa/desativa um parceiro (desativar só impede novos descontos — não apaga histórico). */
export function PartnerActiveToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = active
        ? await apiFetch(`/api/admin/partners/${id}`, { method: "DELETE" })
        : await apiFetch(`/api/admin/partners/${id}`, {
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

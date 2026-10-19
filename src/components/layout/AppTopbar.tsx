"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AppTopbar({ userName }: { userName: string | null }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/session/logout", { method: "POST" }).catch(() => null);
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 sm:px-6">
      <p className="text-sm text-ink-500">
        Olá, <span className="font-medium text-ink-900">{userName ?? "por aqui"}</span>
      </p>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sair
      </Button>
    </header>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { ListChecks, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { apiFetchServer } from "@/lib/api/server";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminHomePage() {
  await requireAdmin();

  const response = await apiFetchServer("/api/admin/stats");
  const stats = response.ok
    ? ((await response.json()) as { userCount: number; questionCount: number })
    : { userCount: 0, questionCount: 0 };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-ink-900">Administração</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/usuarios">
          <Card className="transition-colors hover:border-brand-300">
            <Users className="mb-2 h-5 w-5 text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink-900">Usuários</p>
            <p className="text-sm text-ink-500">{stats.userCount} cadastrados</p>
          </Card>
        </Link>
        <Link href="/admin/perguntas">
          <Card className="transition-colors hover:border-brand-300">
            <ListChecks className="mb-2 h-5 w-5 text-brand-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink-900">Perguntas</p>
            <p className="text-sm text-ink-500">{stats.questionCount} no banco</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}

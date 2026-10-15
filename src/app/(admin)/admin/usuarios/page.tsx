import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { apiFetchServer } from "@/lib/api/server";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { formatDate } from "@/lib/utils";
import type { UserRow } from "@/types/database";

export const metadata: Metadata = { title: "Usuários — Admin" };

const statusTone: Record<string, "positive" | "neutral" | "warning" | "danger"> = {
  active: "positive",
  pending: "neutral",
  inactive: "neutral",
  refunded: "warning",
  cancelled: "warning",
  blocked: "danger",
};

export default async function AdminUsuariosPage() {
  await requireAdmin();

  const response = await apiFetchServer("/api/admin/users");
  const users: UserRow[] = response.ok ? ((await response.json()) as { users: UserRow[] }).users : [];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-ink-900">Usuários</h1>

      {!users || users.length === 0 ? (
        <EmptyState title="Nenhum usuário ainda" description="Usuários aparecem aqui após a primeira compra processada." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-ink-900">{u.name ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[u.status] ?? "neutral"}>{u.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

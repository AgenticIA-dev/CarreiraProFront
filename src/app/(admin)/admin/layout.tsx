import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Nunca confia em nenhum campo enviado pelo cliente para conceder acesso
  // administrativo — requireAdmin relê role diretamente do banco.
  await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col bg-ink-50">
      <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 sm:px-6">
        <Link href="/admin" className="text-lg font-semibold tracking-tight text-ink-900">
          CarreiraPro <span className="text-brand-600">Admin</span>
        </Link>
        <Link href="/app" className="text-sm text-ink-500 hover:text-ink-900">
          Voltar ao app
        </Link>
      </header>
      <main id="conteudo-principal" className="flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}

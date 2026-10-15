import { requireUser } from "@/lib/auth/session";
import { SidebarNav, BottomNav } from "@/components/layout/AppNav";
import { AppTopbar } from "@/components/layout/AppTopbar";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  // Segunda camada de proteção (a primeira é o middleware): garante que o
  // status seja "active" antes de renderizar qualquer dado.
  const { profile } = await requireUser();

  return (
    <div className="flex min-h-dvh bg-ink-50">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar userName={profile.name} />
        <main id="conteudo-principal" className="flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

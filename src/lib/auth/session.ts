import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiFetchServer } from "@/lib/api/server";
import type { UserRow } from "@/types/database";

/**
 * Recupera o usuário autenticado e seu perfil de aplicação (status/role).
 * Redireciona para /login se não houver sessão — uso em Server Components
 * de páginas dentro de /app e /admin (o middleware já bloqueia o acesso,
 * esta função é a segunda camada, necessária para obter os dados do perfil).
 *
 * Este frontend não lê mais `public.users` diretamente — quem tem essa
 * verdade agora é o backend (`GET /api/account/me`), chamado aqui com o
 * token da sessão atual.
 */
export async function requireUser(): Promise<{ authId: string; email: string; profile: UserRow }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const response = await apiFetchServer("/api/account/me");

  if (!response.ok) {
    redirect(response.status === 401 ? "/login" : "/login?erro=perfil");
  }

  const { profile, email } = (await response.json()) as { profile: UserRow; email: string };

  if (profile.status !== "active") {
    redirect("/login?erro=inativo");
  }

  return { authId: user.id, email: email ?? user.email ?? profile.email, profile };
}

/**
 * Igual a requireUser(), mas também exige role "admin". Nunca decide isso
 * com base em algo enviado pelo cliente — sempre relê o registro do banco
 * (via backend).
 */
export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile.role !== "admin") {
    redirect("/app");
  }
  return session;
}

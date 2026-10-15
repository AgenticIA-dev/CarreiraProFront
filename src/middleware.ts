import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

/**
 * Proteção de rotas server-side.
 *
 * Regra de autorização (ver PROMPT MESTRE, seções 11-12 e 42):
 *  - `/app/*`   exige usuário autenticado com status "active".
 *  - `/admin/*` exige usuário autenticado, "active" e role "admin".
 *  - Nunca confiamos em nada vindo do cliente para decidir isso.
 *
 * Diferente da versão anterior (projeto único): este frontend não tem mais
 * a service role key nem acesso direto a `public.users` — o status/role
 * reais são obtidos chamando o backend (`GET /api/account/me`) com o token
 * da sessão atual. O backend é quem relê isso do banco a cada chamada.
 */
export async function middleware(request: NextRequest) {
  const { response, user, accessToken } = await updateSupabaseSession(request);
  const { pathname } = request.nextUrl;

  const isProtectedApp = pathname.startsWith("/app");
  const isAdmin = pathname.startsWith("/admin");

  if (!isProtectedApp && !isAdmin) {
    return response;
  }

  if (!user || !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    // Backend não configurado neste ambiente — bloqueia por segurança.
    return NextResponse.redirect(new URL("/login?erro=configuracao", request.url));
  }

  let status: string | null = null;
  let role: string | null = null;
  try {
    const meResponse = await fetch(`${apiUrl.replace(/\/+$/, "")}/api/account/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (meResponse.ok) {
      const data = (await meResponse.json()) as { profile?: { status?: string; role?: string } };
      status = data.profile?.status ?? null;
      role = data.profile?.role ?? null;
    }
  } catch {
    // Backend inalcançável neste momento — bloqueia por segurança (nunca
    // libera acesso sem confirmar o status real).
    return NextResponse.redirect(new URL("/login?erro=configuracao", request.url));
  }

  if (status !== "active") {
    return NextResponse.redirect(new URL("/login?erro=inativo", request.url));
  }

  if (isAdmin && role !== "admin") {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};

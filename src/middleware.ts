import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearSessionCookies,
  refreshSessionTokens,
  setSessionCookies,
  type SessionTokens,
} from "@/lib/auth/tokens";

/**
 * Proteção de rotas server-side.
 *
 * Regra de autorização (ver PROMPT MESTRE, seções 11-12 e 42):
 *  - `/app/*`   exige usuário autenticado com status "active".
 *  - `/admin/*` exige usuário autenticado, "active" e role "admin".
 *  - Nunca confiamos em nada vindo do cliente para decidir isso.
 *
 * Este frontend não acessa o banco nem lê a tabela `users`: a sessão são
 * os cookies emitidos a partir das respostas do backend (ver
 * `src/lib/auth/tokens.ts`), e o status/role reais vêm do backend
 * (`GET /api/account/me`), que valida o token e relê o banco a cada chamada.
 *
 * Se o access token expirou mas ainda há refresh token, a sessão é renovada
 * aqui (via backend) antes de seguir — e o token novo é repassado também à
 * própria requisição, para que os Server Components desta navegação já o
 * enxerguem.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", pathname);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    // Backend não configurado neste ambiente — bloqueia por segurança.
    return NextResponse.redirect(new URL("/login?erro=configuracao", request.url));
  }

  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let refreshed: SessionTokens | null = null;

  if (!accessToken && refreshToken) {
    refreshed = await refreshSessionTokens(refreshToken);
    if (refreshed) {
      accessToken = refreshed.access_token;
      request.cookies.set(ACCESS_COOKIE, refreshed.access_token);
      request.cookies.set(REFRESH_COOKIE, refreshed.refresh_token);
    }
  }

  if (!accessToken) {
    const response = NextResponse.redirect(loginUrl);
    clearSessionCookies(response);
    return response;
  }

  let status: string | null = null;
  let role: string | null = null;
  try {
    const meResponse = await fetch(`${apiUrl.replace(/\/+$/, "")}/api/account/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (meResponse.status === 401) {
      // Token inválido/revogado — sessão encerrada.
      const response = NextResponse.redirect(loginUrl);
      clearSessionCookies(response);
      return response;
    }

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

  let response: NextResponse;
  if (status !== "active") {
    response = NextResponse.redirect(new URL("/login?erro=inativo", request.url));
  } else if (isAdmin && role !== "admin") {
    response = NextResponse.redirect(new URL("/app", request.url));
  } else {
    response = NextResponse.next({ request });
  }

  if (refreshed) {
    setSessionCookies(response, refreshed);
  }
  return response;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};

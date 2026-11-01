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
 * Proteção de rotas server-side (1ª camada — rápida).
 *
 * Regra de autorização (ver PROMPT MESTRE, seções 11-12 e 42):
 *  - `/app/*`   exige usuário autenticado com status "active".
 *  - `/admin/*` exige usuário autenticado, "active" e role "admin".
 *
 * DESEMPENHO: antes, este middleware chamava `GET /api/account/me` no
 * backend a CADA navegação (e a cada prefetch de link), e logo em seguida
 * o layout chamava a mesma rota de novo — 2 a 3 idas ao backend + banco por
 * clique, o que deixava a navegação lenta. Agora o middleware só faz uma
 * verificação local e barata:
 *   - existe access token e ele não expirou (lendo o `exp` do JWT)?
 *   - se expirou e há refresh token, renova a sessão via backend.
 *
 * A verificação de status/role contra o banco continua sendo feita em toda
 * renderização no servidor pelos layouts (`requireUser` / `requireAdmin`,
 * memoizados por requisição) e, sobretudo, pelo próprio backend em CADA
 * chamada de dados (`requireActiveApiUser`), que valida a assinatura do
 * token. Um token forjado aqui não dá acesso a nenhum dado.
 */
const EXPIRY_SKEW_SECONDS = 30;

function isAccessTokenFresh(token: string | undefined): token is string {
  if (!token) return false;
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return false;
    const json = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    return payload.exp - EXPIRY_SKEW_SECONDS > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", pathname);

  if (!process.env.NEXT_PUBLIC_API_URL) {
    // Backend não configurado neste ambiente — bloqueia por segurança.
    return NextResponse.redirect(new URL("/login?erro=configuracao", request.url));
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (isAccessTokenFresh(accessToken)) {
    // Caminho rápido: nenhuma chamada de rede.
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let refreshed: SessionTokens | null = null;
  if (refreshToken) {
    refreshed = await refreshSessionTokens(refreshToken);
  }

  if (!refreshed) {
    const response = NextResponse.redirect(loginUrl);
    clearSessionCookies(response);
    return response;
  }

  // Repassa o token novo à própria requisição, para que os Server
  // Components desta navegação já o enxerguem.
  request.cookies.set(ACCESS_COOKIE, refreshed.access_token);
  request.cookies.set(REFRESH_COOKIE, refreshed.refresh_token);
  const response = NextResponse.next({ request });
  setSessionCookies(response, refreshed);
  return response;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};

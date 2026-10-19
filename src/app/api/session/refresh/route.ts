import { NextResponse, type NextRequest } from "next/server";
import {
  REFRESH_COOKIE,
  clearSessionCookies,
  refreshSessionTokens,
  setSessionCookies,
} from "@/lib/auth/tokens";

/**
 * Renova a sessão a partir do refresh token (cookie httpOnly). Chamada por
 * `apiFetch` quando o access token expirou durante o uso da página — a
 * navegação normal já é renovada pelo middleware.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const session = refreshToken ? await refreshSessionTokens(refreshToken) : null;

  if (!session) {
    const response = NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
    clearSessionCookies(response);
    return response;
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookies(response, session);
  return response;
}

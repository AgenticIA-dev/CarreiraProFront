import { NextResponse, type NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/api/config";
import { ACCESS_COOKIE, clearSessionCookies } from "@/lib/auth/tokens";

/**
 * Logout: pede ao backend para revogar a sessão (`POST /api/auth/logout`) e
 * apaga os cookies. Os cookies são apagados mesmo se o backend falhar — o
 * usuário sempre sai deste navegador.
 */
export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;

  if (accessToken) {
    try {
      await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
    } catch {
      // Ignorado de propósito — ver comentário acima.
    }
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response);
  return response;
}

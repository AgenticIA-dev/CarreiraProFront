import type { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api/config";

/**
 * Sessão do usuário neste frontend.
 *
 * Toda a autenticação (login, renovação, logout, recuperação de senha) é
 * feita pelo backend (`/api/auth/*`) — este projeto não acessa o banco.
 * Ele só guarda, em cookies do seu próprio domínio, os tokens que o backend
 * devolve:
 *
 *  - `cp_access`: access token (JWT curto). NÃO é httpOnly porque os
 *    componentes de cliente precisam lê-lo para chamar o backend com
 *    `Authorization: Bearer` (ver `src/lib/api/client.ts`). Expira um pouco
 *    antes do próprio token, para nunca ser enviado já vencido.
 *  - `cp_refresh`: refresh token. httpOnly — o JavaScript da página nunca o
 *    vê; só o servidor deste frontend (middleware e `/api/session/*`) o usa
 *    para pedir uma sessão nova ao backend.
 *
 * Este módulo não importa `next/headers`, para poder ser usado no middleware
 * (Edge Runtime).
 */
export const ACCESS_COOKIE = "cp_access";
export const REFRESH_COOKIE = "cp_refresh";

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias
const ACCESS_EXPIRY_MARGIN = 60; // segundos

export interface SessionTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

const baseCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export function setSessionCookies(response: NextResponse, session: SessionTokens) {
  response.cookies.set(ACCESS_COOKIE, session.access_token, {
    ...baseCookieOptions,
    httpOnly: false,
    maxAge: Math.max(session.expires_in - ACCESS_EXPIRY_MARGIN, 0),
  });
  response.cookies.set(REFRESH_COOKIE, session.refresh_token, {
    ...baseCookieOptions,
    httpOnly: true,
    maxAge: REFRESH_MAX_AGE,
  });
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...baseCookieOptions, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...baseCookieOptions, httpOnly: true, maxAge: 0 });
}

/**
 * Pede ao backend uma sessão nova a partir do refresh token. Devolve null se
 * o token for inválido/revogado ou se o backend estiver inalcançável.
 */
export async function refreshSessionTokens(refreshToken: string): Promise<SessionTokens | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { session?: SessionTokens };
    return data.session ?? null;
  } catch {
    return null;
  }
}

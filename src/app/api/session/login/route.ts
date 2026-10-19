import { NextResponse, type NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/api/config";
import { setSessionCookies, type SessionTokens } from "@/lib/auth/tokens";

/**
 * Login: repassa e-mail/senha ao backend (`POST /api/auth/login`) e, se der
 * certo, grava os tokens devolvidos como cookies deste domínio (ver
 * `src/lib/auth/tokens.ts`). Quem valida a senha é o backend.
 *
 * Exige `Content-Type: application/json`: isso força um preflight de CORS
 * em chamadas vindas de outros sites (que esta rota não responde), impedindo
 * que uma página de terceiros faça login em nome do usuário (login CSRF).
 */
export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 415 });
  }

  const body = await request.text();

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível entrar agora. Tente novamente em instantes." },
      { status: 502 }
    );
  }

  const data = (await backendResponse.json().catch(() => null)) as {
    session?: SessionTokens;
    error?: string;
  } | null;

  if (!backendResponse.ok || !data?.session) {
    return NextResponse.json(
      { error: data?.error ?? "E-mail ou senha incorretos." },
      { status: backendResponse.ok ? 502 : backendResponse.status }
    );
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookies(response, data.session);
  return response;
}

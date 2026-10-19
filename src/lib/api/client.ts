"use client";

import { ACCESS_COOKIE } from "@/lib/auth/tokens";
import { getApiBaseUrl } from "./config";

function readAccessToken(): string | null {
  const prefix = `${ACCESS_COOKIE}=`;
  const entry = document.cookie.split("; ").find((c) => c.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

/** Renova a sessão via `/api/session/refresh` (refresh token httpOnly). */
async function refreshAccessToken(): Promise<string | null> {
  const response = await fetch("/api/session/refresh", { method: "POST" }).catch(() => null);
  return response?.ok ? readAccessToken() : null;
}

/**
 * fetch autenticado para o backend do CarreiraPro, a partir de componentes
 * de cliente ("use client").
 *
 * Anexa o access token da sessão (cookie `cp_access`, emitido a partir da
 * resposta do backend — ver `src/lib/auth/tokens.ts`) como
 * `Authorization: Bearer <token>`; o backend valida esse token
 * independentemente. Se o token tiver expirado, renova a sessão uma vez e
 * repete a chamada. Sem sessão, a chamada segue sem o header (útil para
 * rotas públicas) e o backend decide se exige autenticação.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  let token = readAccessToken();
  let refreshed = false;
  if (!token) {
    token = await refreshAccessToken();
    refreshed = true;
  }

  const send = (accessToken: string | null) => {
    const headers = new Headers(init.headers);
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(`${getApiBaseUrl()}${path}`, { ...init, headers });
  };

  const response = await send(token);
  if (response.status !== 401 || !token || refreshed) {
    return response;
  }

  const newToken = await refreshAccessToken();
  return newToken ? send(newToken) : response;
}

/** Monta a URL completa do backend para uma chamada pública (sem sessão). */
export function apiUrl(path: string): string {
  return `${getApiBaseUrl()}${path}`;
}

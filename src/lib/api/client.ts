"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getApiBaseUrl } from "./config";

/**
 * fetch autenticado para o backend do CarreiraPro, a partir de componentes
 * de cliente ("use client").
 *
 * Anexa o token de acesso da sessão Supabase atual como
 * `Authorization: Bearer <token>` — o backend valida esse token
 * independentemente (nunca confia em cookies, já que frontend e backend são
 * origens diferentes). Se não houver sessão, a chamada segue sem o header
 * (útil para rotas públicas, como o checkout) e o backend decide se exige
 * autenticação.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${getApiBaseUrl()}${path}`, { ...init, headers });
}

/** Monta a URL completa do backend para uma chamada pública (sem sessão). */
export function apiUrl(path: string): string {
  return `${getApiBaseUrl()}${path}`;
}

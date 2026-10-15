import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getApiBaseUrl } from "./config";

/**
 * fetch autenticado para o backend do CarreiraPro, a partir de Server
 * Components / Route Handlers deste frontend (ex.: dashboard, admin,
 * middleware). Pega o token de acesso da sessão atual (cookies) e o envia
 * como `Authorization: Bearer` — o backend é quem efetivamente valida esse
 * token e aplica RLS/regras de negócio; este frontend nunca lê as tabelas
 * diretamente.
 */
export async function apiFetchServer(path: string, init: RequestInit = {}): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${getApiBaseUrl()}${path}`, { ...init, headers, cache: "no-store" });
}

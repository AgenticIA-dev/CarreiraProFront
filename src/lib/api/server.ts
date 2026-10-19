import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/auth/tokens";
import { getApiBaseUrl } from "./config";

/**
 * fetch autenticado para o backend do CarreiraPro, a partir de Server
 * Components / Route Handlers deste frontend (ex.: dashboard, admin).
 * Pega o access token da sessão (cookie `cp_access`) e o envia como
 * `Authorization: Bearer` — o backend é quem efetivamente valida esse
 * token e aplica RLS/regras de negócio. Server Components não podem gravar
 * cookies; quem renova a sessão antes da renderização é o middleware.
 */
export async function apiFetchServer(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  const headers = new Headers(init.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${getApiBaseUrl()}${path}`, { ...init, headers, cache: "no-store" });
}

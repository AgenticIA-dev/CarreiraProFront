"use client";

import { apiUrl } from "@/lib/api/client";

/**
 * Gerenciamento de consentimento de cookies (LGPD/ANPD).
 *
 * Categorias:
 *  - necessary: sempre ativos (sessão, segurança) — não são "cookies" sujeitos
 *    a consentimento prévio por serem estritamente necessários.
 *  - analytics: só carrega Google Analytics/GTM após consentimento explícito.
 *  - marketing: só carrega Meta Pixel/Conversions API após consentimento explícito.
 *
 * O usuário pode aceitar tudo, rejeitar o que não é necessário, ou configurar
 * granularmente — e pode mudar de ideia depois (nunca apenas um botão "Aceitar").
 */

export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

const STORAGE_KEY = "cp_cookie_consent";
const ANON_KEY = "cp_anon_id";
export const CONSENT_CHANGED_EVENT = "cp:consent-changed";

export function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ConsentPreferences;
  } catch {
    // localStorage indisponível (aba anônima/bloqueio) — tenta o cookie.
  }
  try {
    const entry = document.cookie.split("; ").find((c) => c.startsWith(`${STORAGE_KEY}=`));
    if (entry) return JSON.parse(decodeURIComponent(entry.slice(STORAGE_KEY.length + 1))) as ConsentPreferences;
  } catch {
    // Cookie corrompido — trata como "sem decisão".
  }
  return null;
}

function getAnonymousId(): string {
  try {
    let id = window.localStorage.getItem(ANON_KEY);
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
      window.localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

/**
 * Persiste a decisão do usuário. NUNCA lança exceção: qualquer falha
 * (localStorage bloqueado, NEXT_PUBLIC_API_URL ausente no build, backend
 * fora do ar, CORS) é engolida — antes, uma exceção aqui impedia o banner
 * de fechar ao clicar em "Aceitar".
 */
export function saveConsent(preferences: Omit<ConsentPreferences, "necessary" | "decidedAt">) {
  const value: ConsentPreferences = {
    necessary: true,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    decidedAt: new Date().toISOString(),
  };
  if (typeof window === "undefined") return value;

  const serialized = JSON.stringify(value);
  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Ignora — o cookie abaixo garante a persistência.
  }
  try {
    // Cookie de 1ª parte (180 dias) como fallback e para leitura no servidor.
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(serialized)}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax${
      window.location.protocol === "https:" ? "; Secure" : ""
    }`;
  } catch {
    // Ignora.
  }
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: value }));
  } catch {
    // Ignora.
  }

  // Registro de auditoria no backend (best-effort; nunca bloqueia a UI).
  // Rota pública (aceita visitante anônimo) — sem Authorization: Bearer.
  try {
    void fetch(apiUrl("/api/consent"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-anonymous-id": getAnonymousId() },
      body: serialized,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // apiUrl() lança se NEXT_PUBLIC_API_URL não foi definido no build.
  }
  return value;
}

export function acceptAll() {
  return saveConsent({ analytics: true, marketing: true });
}

export function rejectNonEssential() {
  return saveConsent({ analytics: false, marketing: false });
}

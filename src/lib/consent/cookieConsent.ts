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
export const CONSENT_CHANGED_EVENT = "cp:consent-changed";

export function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentPreferences;
  } catch {
    return null;
  }
}

export function saveConsent(preferences: Omit<ConsentPreferences, "necessary" | "decidedAt">) {
  const value: ConsentPreferences = {
    necessary: true,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    decidedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: value }));
  }
  // Registro de auditoria no backend (best-effort; nunca bloqueia a UI).
  // Rota pública (aceita visitante anônimo) — sem Authorization: Bearer.
  void fetch(apiUrl("/api/consent"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  }).catch(() => {
    // Falha ao registrar não deve impedir o usuário de navegar.
  });
  return value;
}

export function acceptAll() {
  return saveConsent({ analytics: true, marketing: true });
}

export function rejectNonEssential() {
  return saveConsent({ analytics: false, marketing: false });
}

"use client";

import { getStoredConsent } from "@/lib/consent/cookieConsent";
import { sanitizeAnalyticsPayload, type AnalyticsEventName, type AnalyticsEventPayload } from "./events";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Dispara um evento de analytics — SOMENTE se o usuário consentiu com a
 * categoria "analytics". Caso contrário, é um no-op silencioso.
 *
 * IDs/eventos são anonimizados quando possível; nenhum dado sensível deve
 * ser passado em `payload` (ver `sanitizeAnalyticsPayload`).
 */
export function trackEvent(name: AnalyticsEventName, payload: AnalyticsEventPayload = {}) {
  const consent = getStoredConsent();
  if (!consent?.analytics) return;

  const clean = sanitizeAnalyticsPayload(payload);

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, clean);
  }
}

/** Dispara um evento de marketing (ex.: Meta Pixel) — somente com consentimento de "marketing". */
export function trackMarketingEvent(name: string, payload: AnalyticsEventPayload = {}) {
  const consent = getStoredConsent();
  if (!consent?.marketing) return;

  const clean = sanitizeAnalyticsPayload(payload);

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", name, clean);
  }
}

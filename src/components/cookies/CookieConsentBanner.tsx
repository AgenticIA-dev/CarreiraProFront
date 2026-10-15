"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  acceptAll,
  getStoredConsent,
  rejectNonEssential,
  saveConsent,
  type ConsentPreferences,
} from "@/lib/consent/cookieConsent";

/**
 * Banner de consentimento de cookies.
 *
 * Requisitos (PROMPT MESTRE §25):
 *  - Nunca apenas um botão "Aceitar": oferece Aceitar tudo, Rejeitar não
 *    essenciais e Personalizar.
 *  - Cookies não essenciais (analytics/marketing) só são carregados após
 *    decisão explícita — ver src/lib/analytics/AnalyticsLoader.tsx.
 *  - A decisão pode ser revista a qualquer momento em /cookies.
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);
  const [marketingChecked, setMarketingChecked] = useState(false);

  useEffect(() => {
    const existing = getStoredConsent();
    setVisible(!existing);
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    acceptAll();
    setVisible(false);
  };

  const handleReject = () => {
    rejectNonEssential();
    setVisible(false);
  };

  const handleSaveCustom = () => {
    const prefs: Omit<ConsentPreferences, "necessary" | "decidedAt"> = {
      analytics: analyticsChecked,
      marketing: marketingChecked,
    };
    saveConsent(prefs);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Preferências de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-200 bg-white p-4 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] sm:p-6"
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-ink-700">
          Usamos cookies necessários para o funcionamento do CarreiraPro. Com sua permissão,
          também usamos cookies de análise e, quando aplicável, de marketing, para entender o uso
          do produto. Você pode aceitar, rejeitar ou personalizar — e mudar de ideia depois em{" "}
          <a href="/cookies" className="font-medium text-brand-600 underline underline-offset-2">
            Cookies
          </a>
          .
        </p>

        {showDetails && (
          <div className="mt-4 space-y-3 rounded-xl border border-ink-200 p-4">
            <label className="flex items-start gap-3 text-sm text-ink-700">
              <input type="checkbox" checked disabled className="mt-1 h-4 w-4" />
              <span>
                <span className="font-medium text-ink-900">Necessários</span> — sempre ativos.
                Essenciais para login e segurança.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={analyticsChecked}
                onChange={(e) => setAnalyticsChecked(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="font-medium text-ink-900">Analytics</span> — nos ajuda a entender
                como o produto é usado (ex.: Google Analytics).
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={marketingChecked}
                onChange={(e) => setMarketingChecked(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="font-medium text-ink-900">Marketing</span> — usado para medir a
                eficácia de campanhas (ex.: Meta Ads, Google Ads).
              </span>
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={handleAcceptAll}>
            Aceitar tudo
          </Button>
          <Button size="sm" variant="secondary" onClick={handleReject}>
            Rejeitar não essenciais
          </Button>
          {showDetails ? (
            <Button size="sm" variant="ghost" onClick={handleSaveCustom}>
              Salvar preferências
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setShowDetails(true)}>
              Personalizar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

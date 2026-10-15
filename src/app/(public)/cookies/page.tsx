"use client";

import { useEffect, useState } from "react";
import type { ConsentPreferences } from "@/lib/consent/cookieConsent";
import { getStoredConsent, saveConsent } from "@/lib/consent/cookieConsent";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/**
 * Página "/cookies": explica as categorias e permite ao usuário revisar e
 * alterar a decisão a qualquer momento (PROMPT MESTRE §25 — "alterar a
 * decisão posteriormente").
 */
export default function CookiesPage() {
  const [consent, setConsent] = useState<ConsentPreferences | null>(null);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getStoredConsent();
    setConsent(existing);
    setAnalytics(existing?.analytics ?? false);
    setMarketing(existing?.marketing ?? false);
  }, []);

  const handleSave = () => {
    const updated = saveConsent({ analytics, marketing });
    setConsent(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">Cookies</h1>
      <p className="mt-2 text-sm text-ink-500">
        Explicamos abaixo cada categoria de cookie usada no CarreiraPro. Você pode ajustar suas
        preferências a qualquer momento nesta página.
      </p>

      <div className="mt-8 space-y-4">
        <Card>
          <h2 className="text-base font-semibold text-ink-900">Necessários</h2>
          <p className="mt-1.5 text-sm text-ink-500">
            Essenciais para login, segurança da sessão e funcionamento básico da plataforma. Não
            podem ser desativados.
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-ink-900">Analytics</h2>
              <p className="mt-1.5 text-sm text-ink-500">
                Nos ajudam a entender como o produto é usado, de forma agregada, para priorizar
                melhorias.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="h-4 w-4"
              />
              Permitir
            </label>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-ink-900">Marketing</h2>
              <p className="mt-1.5 text-sm text-ink-500">
                Usados para medir a eficácia de campanhas de aquisição (ex.: Meta Ads, Google Ads).
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="h-4 w-4"
              />
              Permitir
            </label>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>Salvar preferências</Button>
          {saved && <span className="text-sm text-positive-700">Preferências salvas.</span>}
        </div>

        {consent && (
          <p className="text-xs text-ink-400">
            Última decisão registrada em {new Date(consent.decidedAt).toLocaleString("pt-BR")}.
          </p>
        )}
      </div>
    </article>
  );
}

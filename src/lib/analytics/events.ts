/**
 * Catálogo de eventos de analytics (PROMPT MESTRE §26).
 *
 * Regras rígidas:
 *  - Nenhum evento carrega transcript, resposta completa, nome, e-mail, CPF
 *    ou qualquer dado sensível/pessoal desnecessário.
 *  - Eventos só são disparados se o usuário consentiu com "analytics".
 */
export type AnalyticsEventName =
  | "page_view"
  | "login"
  | "purchase"
  | "training_started"
  | "training_completed"
  | "star_generated"
  | "interview_started"
  | "interview_completed";

export interface AnalyticsEventPayload {
  [key: string]: string | number | boolean | undefined;
}

/** Campos proibidos em qualquer payload de analytics (defesa em profundidade). */
const FORBIDDEN_KEYS = [
  "transcript",
  "response",
  "resposta",
  "name",
  "nome",
  "email",
  "cpf",
  "phone",
  "telefone",
];

export function sanitizeAnalyticsPayload(payload: AnalyticsEventPayload): AnalyticsEventPayload {
  const clean: AnalyticsEventPayload = {};
  for (const [key, value] of Object.entries(payload)) {
    if (FORBIDDEN_KEYS.some((forbidden) => key.toLowerCase().includes(forbidden))) {
      continue;
    }
    clean[key] = value;
  }
  return clean;
}

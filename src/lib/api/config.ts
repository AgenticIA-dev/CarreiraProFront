/**
 * Base URL do backend (`voceup-backend`). Pública por design — não é
 * um segredo; a segurança vem da validação do
 * token em cada rota do backend, não do sigilo desta URL.
 */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL não configurado: defina a URL do backend do VoceUP.");
  }
  const base = url.replace(/\/+$/, "");
  // No servidor (middleware, Server Components), Node resolve "localhost"
  // primeiro para IPv6 (::1). Se o backend escuta só em IPv4, cada chamada
  // perde tempo tentando ::1 antes de cair para 127.0.0.1 — muito perceptível
  // no Windows. No navegador mantemos a URL original (CORS/origem).
  if (typeof window === "undefined") {
    return base.replace(/^(https?:\/\/)localhost(?=[:/]|$)/i, "$1127.0.0.1");
  }
  return base;
}

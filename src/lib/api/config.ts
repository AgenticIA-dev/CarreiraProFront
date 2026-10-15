/**
 * Base URL do backend (`carreirapro-backend`). Pública por design — assim
 * como a URL do Supabase, não é um segredo; a segurança vem da validação do
 * token em cada rota do backend, não do sigilo desta URL.
 */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL não configurado: defina a URL do backend do CarreiraPro.");
  }
  return url.replace(/\/+$/, "");
}

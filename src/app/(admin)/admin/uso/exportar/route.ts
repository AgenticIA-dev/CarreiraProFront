import { apiFetchServer } from "@/lib/api/server";

/**
 * Baixa a planilha (CSV) do relatório "Uso e custos".
 *
 * O link de download do navegador não envia o header Authorization, então
 * esta rota do frontend repassa a chamada ao backend com o token da sessão
 * (cookie). Quem confere se o usuário é admin é o backend.
 */
export async function GET() {
  const response = await apiFetchServer("/api/admin/usage?format=csv");
  if (!response.ok) {
    return new Response("Acesso restrito ou relatório indisponível.", {
      status: response.status === 403 || response.status === 401 ? 403 : 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(await response.arrayBuffer(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        response.headers.get("Content-Disposition") ?? 'attachment; filename="voceup-uso-e-custos.csv"',
      "Cache-Control": "no-store",
    },
  });
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Atualiza a sessão Supabase a cada requisição e devolve a resposta (com
 * cookies renovados), o usuário autenticado e o token de acesso bruto —
 * este último é o que o middleware usa para perguntar ao backend
 * (`GET /api/account/me`) qual é o status/role reais do usuário, já que
 * este projeto não tem mais acesso direto ao banco.
 */
export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Sem Supabase configurado (ex.: ambiente local sem credenciais), não
    // bloqueia a navegação pública, mas rotas protegidas tratarão isso.
    return { response, user: null, accessToken: null };
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { response, user: session?.user ?? null, accessToken: session?.access_token ?? null };
}

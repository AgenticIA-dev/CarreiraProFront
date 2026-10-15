import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase para uso em Server Components, Server Actions e Route
 * Handlers deste FRONTEND, respeitando a sessão do usuário (via cookies).
 *
 * Importante: este projeto não tem mais a service role key nem acesso
 * direto às tabelas de negócio — ele usa este cliente apenas para a sessão
 * de autenticação em si (login, logout, trocar senha, pegar o token de
 * acesso atual). Toda leitura/escrita de dados de negócio (perguntas,
 * respostas STAR, sessões de entrevista, perfil, admin, etc.) é feita pelo
 * backend (`carreirapro-backend`), chamado via `src/lib/api/*` com o token
 * desta sessão no header `Authorization: Bearer`.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // `setAll` pode ser chamado a partir de um Server Component, onde
          // não é possível escrever cookies. Isso é seguro de ignorar desde
          // que haja um middleware renovando a sessão (ver src/middleware.ts).
        }
      },
    },
  });
}

# CarreiraPro — Frontend (UI + autenticação)

> Este é o projeto **frontend** do CarreiraPro, separado do backend a pedido do usuário
> (15/10/2026). Antes, frontend e backend eram um único projeto Next.js; agora são dois deploys
> independentes que se comunicam por HTTP. Este documento descreve só o frontend — o backend tem
> seu próprio `docs/DOCUMENTATION.md`, com a lista completa de rotas de API.

## 1. O que este projeto é

Um projeto Next.js 15 (App Router) com **todas as páginas** (públicas, área do usuário, admin) e
a **autenticação** (sessão Supabase via `@supabase/ssr`, com cookies). Ele nunca lê tabelas do
Postgres diretamente nem tem a service role key — toda leitura/escrita de dados de negócio
(perguntas, respostas STAR, sessões de entrevista, perfil, conta, admin, pagamento) é feita pelo
projeto `carreirapro-backend`, chamado por HTTP.

## 2. Por que a separação muda a autenticação

- A sessão do usuário (login, logout, recuperação/troca de senha) continua sendo gerenciada
  **aqui**, via `@supabase/ssr` e cookies — isso não muda, porque é puramente autenticação, não
  acesso a dados de negócio.
- O que muda é que este frontend não confia mais em si mesmo para decidir status/role — ele pede
  isso ao backend. Dois pontos fazem essa ponte:
  - `src/middleware.ts` (gating de `/app/*` e `/admin/*`): em vez de consultar
    `public.users` diretamente com a service role key (que este projeto não tem mais), chama
    `GET /api/account/me` no backend com o access token da sessão.
  - `src/lib/auth/session.ts` (`requireUser`/`requireAdmin`, usados nos layouts): mesma ideia,
    via `src/lib/api/server.ts`.
- Toda chamada de dado de negócio (Server Component ou componente de cliente) usa um dos
  helpers em `src/lib/api/`:
  - `apiFetch` (`src/lib/api/client.ts`) — para componentes `"use client"`. Pega o access token
    da sessão no navegador e chama o backend com `Authorization: Bearer <token>`.
  - `apiFetchServer` (`src/lib/api/server.ts`) — para Server Components/Route Handlers deste
    frontend. Mesma ideia, pegando o token dos cookies da requisição.
  - `apiUrl` (`src/lib/api/client.ts`) — monta a URL do backend para chamadas públicas (sem
    sessão), como o checkout (`/comprar`) e o registro de consentimento de cookies.
- Nenhuma dessas chamadas depende de cookies entre origens — tudo via Bearer token, que
  atravessa origens sem problema (diferente de cookies, que exigiriam configuração extra de
  `SameSite`/domínio e ainda assim são frágeis entre dois domínios distintos).

## 3. Variável de ambiente mais importante: `NEXT_PUBLIC_API_URL`

Define onde está o backend. Toda a comunicação deste frontend com dados de negócio passa por
ela. Em desenvolvimento local, normalmente `http://localhost:3001` (a porta padrão do backend —
ver `docs/DOCUMENTATION.md` do backend).

## 4. Stack

Next.js 15 (App Router) · React 19 · TypeScript 5 (strict) · Tailwind CSS 3 · `@supabase/ssr` +
`@supabase/supabase-js` (somente para sessão de autenticação) · Zod (validação de formulários) ·
Lucide React (ícones).

## 5. Estrutura de diretórios

```
src/
  app/
    (public)/        /, /login, /comprar, /comprar/sucesso, /comprar/pendente, /privacidade,
                      /termos, /cookies, /esqueci-senha, /redefinir-senha
    (protected)/app/  dashboard, perguntas, star, simulador, perfil, privacidade-dados
    (admin)/admin/    área administrativa (role "admin")
    auth/callback/    troca de código do Supabase Auth por sessão
  components/         ui/ (primitivos), demais pastas por domínio
  lib/
    supabase/         client.ts (browser), server.ts (Server Components, só sessão), middleware.ts
    auth/session.ts   requireUser/requireAdmin — chamam o backend, não o banco
    api/              client.ts, server.ts, config.ts — helpers de chamada ao backend
    consent/          cookieConsent.ts
    analytics/        carregamento condicional de GA4/GTM/Meta Pixel
    validation/       schemas.ts (Zod) — usados nos formulários
  types/
    database.ts       tipos do schema (cópia do backend — ver nota abaixo)
    readiness.ts       formato do resultado de GET /api/dashboard/readiness
```

**Nota sobre `src/types/database.ts`:** existe idêntico nos dois projetos, porque este frontend
precisa dos tipos para tipar a UI mas não deve importar nenhum código do backend. Ao gerar tipos
reais do Supabase, gere nos dois projetos e mantenha-os sincronizados manualmente.

## 6. Autenticação (inalterado em espírito, só a origem dos dados mudou)

Sem cadastro público — a venda é direta, com checkout em `/comprar` e pagamento via Mercado Pago
(processado pelo backend). O acesso é criado pelo webhook do backend via
`supabase.auth.admin.inviteUserByEmail`. Login por e-mail/senha (`/login`), recuperação de senha
com mensagem genérica (`/esqueci-senha`), e definição de nova senha via link de uso único do
Supabase Auth (`/redefinir-senha`). Autorização checada em duas camadas: middleware (chamando o
backend) + Server Component (idem) — nunca por campo enviado pelo cliente.

## 7. Variáveis de ambiente

Ver `.env.example`. Nenhum valor real está commitado.

| Variável | Efeito se ausente |
|---|---|
| `NEXT_PUBLIC_API_URL` | Toda chamada ao backend falha (erro explícito, "NEXT_PUBLIC_API_URL não configurado"). |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Login/sessão não funcionam. |
| `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_META_PIXEL_ID` | Nenhum script de analytics/marketing carrega, independentemente do consentimento. |

Note o que **não** está aqui: `SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_*`,
`CHECKOUT_PRODUCT_PRICE_BRL`, chaves de IA/transcrição — nenhuma dessas variáveis deve existir
neste projeto. Elas vivem somente no backend.

## 8. Segurança

Este projeto nunca tem a service role key nem segredos de integração — é estruturalmente
impossível vazar esses segredos pelo bundle do frontend, porque eles simplesmente não existem
aqui. Autorização em duas camadas (middleware + Server Component), sempre delegando a verdade
de status/role ao backend. Cabeçalhos de segurança (`X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`) em `next.config.ts`.

## 9. Testes

Nenhum teste automatizado de UI existia antes da separação (o MVP original só tinha testes de
`lib/`, que agora vivem no backend — ver `docs/DOCUMENTATION.md` do backend, seção 12). Este
projeto não tem suíte de testes própria neste momento.

## 10. Deploy

1. Fazer o deploy do backend primeiro (`carreirapro-backend`) e anotar sua URL pública.
2. Preencher `.env.example` deste frontend, com `NEXT_PUBLIC_API_URL` apontando para essa URL.
3. Fazer o deploy deste frontend (Vercel ou outro host Node) — projeto separado do backend, com
   sua própria URL.
4. No backend, configurar `FRONTEND_ORIGIN` com a URL exata deste frontend (para o CORS liberar
   as chamadas feitas pelo navegador).

Ver `docs/DEPLOY_VERCEL_HOSTINGER.md` para o passo a passo completo (Vercel + domínio na
Hostinger), cobrindo os dois projetos — incluindo como apontar os subdomínios (ex.: `app.` para
este frontend e `api.` para o backend).

## 11. Pendências que dependem de credenciais/decisão humana

- **Supabase**: nenhum projeto real foi criado neste ambiente (sem acesso de rede).
- **Backend**: este frontend depende do `carreirapro-backend` estar rodando e acessível em
  `NEXT_PUBLIC_API_URL` — sem isso, toda tela que precisa de dados (dashboard, perguntas,
  simulador, STAR, perfil, admin) mostra erro.
- **Analytics/Ads**: arquitetura pronta (carrega só com consentimento), nenhuma conta real
  conectada.
- **Instalação de dependências e build/lint**: mesma limitação de rede do backend (ver seção 14
  daquele documento) — não foi possível rodar `npm install`/`build`/`lint` neste ambiente. Código
  verificado com checker de sintaxe TypeScript, sem erros.

## 12. Como executar

```bash
npm install
cp .env.example .env.local   # preencher com valores reais (e com o backend já rodando)
npm run dev                  # http://localhost:3000

npm run lint
npm run typecheck
npm run build && npm start
```

# CarreiraPro — Frontend (UI)

> Este é o projeto **frontend** do CarreiraPro, separado do backend a pedido do usuário
> (15/10/2026). Antes, frontend e backend eram um único projeto Next.js; agora são dois deploys
> independentes que se comunicam por HTTP. Este documento descreve só o frontend — o backend tem
> seu próprio `docs/DOCUMENTATION.md`, com a lista completa de rotas de API.

## 1. O que este projeto é

Um projeto Next.js 15 (App Router) com **todas as páginas** (públicas, área do usuário, admin).
Ele **não tem nenhuma dependência do Supabase**: não lê tabelas, não tem chaves do Supabase e não
fala com o Supabase Auth. Tanto a autenticação (login, logout, renovação de sessão, recuperação
de senha) quanto toda leitura/escrita de dados de negócio (perguntas, respostas STAR, sessões de
entrevista, perfil, conta, admin, pagamento) são feitas pelo projeto `carreirapro-backend`,
chamado por HTTP.

## 2. Autenticação (feita pelo backend)

- Quem fala com o Supabase Auth é **só o backend** (`/api/auth/login`, `/refresh`, `/logout`,
  `/forgot-password`, `/reset-password`). Este frontend apenas guarda, em cookies do seu próprio
  domínio, os tokens que o backend devolve (`src/lib/auth/tokens.ts`):
  - `cp_access` — access token (JWT curto). Não é httpOnly, porque `apiFetch` (componentes de
    cliente) precisa lê-lo para enviar `Authorization: Bearer`. Expira 60 s antes do token.
  - `cp_refresh` — refresh token, **httpOnly** (o JavaScript da página nunca o vê).
- Route Handlers deste frontend (mesma origem da página) fazem a ponte com o backend e gravam/
  apagam os cookies: `POST /api/session/login`, `POST /api/session/logout` e
  `POST /api/session/refresh`. O login exige `Content-Type: application/json` (força preflight
  de CORS, bloqueando login CSRF a partir de outros sites).
- Renovação: o middleware renova a sessão (via backend) quando `cp_access` expirou mas
  `cp_refresh` ainda existe, antes de renderizar `/app/*` e `/admin/*`; `apiFetch` faz o mesmo
  via `/api/session/refresh` se o token expirar com a página aberta (e repete a chamada uma vez
  após um 401).
- Recuperação de senha e convite pós-compra: o backend envia o e-mail com o link apontando para
  `/redefinir-senha`. O Supabase redireciona para lá com um token temporário no fragmento da URL
  (`#access_token=...`); a página o lê, limpa da barra de endereço e o envia ao backend
  (`POST /api/auth/reset-password`). `/esqueci-senha` chama `POST /api/auth/forgot-password`
  direto do navegador (rota pública; resposta sempre genérica).
- Status/role também vêm do backend. Dois pontos fazem essa ponte:
  - `src/middleware.ts` (gating de `/app/*` e `/admin/*`): chama `GET /api/account/me` no
    backend com o access token da sessão (401 → apaga os cookies e manda para `/login`).
  - `src/lib/auth/session.ts` (`requireUser`/`requireAdmin`, usados nos layouts): mesma ideia,
    via `src/lib/api/server.ts`.
- Toda chamada de dado de negócio (Server Component ou componente de cliente) usa um dos
  helpers em `src/lib/api/`:
  - `apiFetch` (`src/lib/api/client.ts`) — para componentes `"use client"`. Pega o access token
    do cookie `cp_access` e chama o backend com `Authorization: Bearer <token>`.
  - `apiFetchServer` (`src/lib/api/server.ts`) — para Server Components/Route Handlers deste
    frontend. Mesma ideia, pegando o token do cookie da requisição.
  - `apiUrl` (`src/lib/api/client.ts`) — monta a URL do backend para chamadas públicas (sem
    sessão), como o checkout (`/comprar`), o registro de consentimento de cookies e a
    recuperação de senha.
- Nenhuma chamada ao backend depende de cookies entre origens (os cookies de sessão são só deste
  domínio) — tudo via Bearer token, que
  atravessa origens sem problema (diferente de cookies, que exigiriam configuração extra de
  `SameSite`/domínio e ainda assim são frágeis entre dois domínios distintos).

## 3. Variável de ambiente mais importante: `NEXT_PUBLIC_API_URL`

Define onde está o backend. Toda a comunicação deste frontend com dados de negócio passa por
ela. Em desenvolvimento local, normalmente `http://localhost:3001` (a porta padrão do backend —
ver `docs/DOCUMENTATION.md` do backend).

## 4. Stack

Next.js 15 (App Router) · React 19 · TypeScript 5 (strict) · Tailwind CSS 3 · Zod (validação de
formulários) · Lucide React (ícones). Sem SDK do Supabase.

## 5. Estrutura de diretórios

```
src/
  app/
    (public)/        /, /login, /comprar, /comprar/sucesso, /comprar/pendente, /privacidade,
                      /termos, /cookies, /esqueci-senha, /redefinir-senha
    (protected)/app/  dashboard, perguntas, star, simulador, perfil, privacidade-dados
    (admin)/admin/    área administrativa (role "admin")
    api/session/      login, logout, refresh — gravam/apagam os cookies de sessão
  components/         ui/ (primitivos), demais pastas por domínio
  lib/
    auth/tokens.ts    nomes/opções dos cookies de sessão, renovação via backend
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
reais do Supabase (no backend), copie para cá e mantenha-os sincronizados manualmente.

## 6. Fluxo de acesso

Sem cadastro público — a venda é direta, com checkout em `/comprar` e pagamento via Mercado Pago
(processado pelo backend). O acesso é criado pelo webhook do backend via
`supabase.auth.admin.inviteUserByEmail`, com o link do convite levando a `/redefinir-senha`
(onde o comprador define a senha). Login por e-mail/senha (`/login`), recuperação de senha
com mensagem genérica (`/esqueci-senha`), e definição de nova senha via link de uso único
(`/redefinir-senha`) — tudo executado pelo backend (seção 2). Autorização checada em duas camadas: middleware (chamando o
backend) + Server Component (idem) — nunca por campo enviado pelo cliente.

## 7. Variáveis de ambiente

Ver `.env.example`. Nenhum valor real está commitado.

| Variável | Efeito se ausente |
|---|---|
| `NEXT_PUBLIC_API_URL` | Toda chamada ao backend falha (erro explícito, "NEXT_PUBLIC_API_URL não configurado"), incluindo login. |
| `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_META_PIXEL_ID` | Nenhum script de analytics/marketing carrega, independentemente do consentimento. |

Note o que **não** está aqui: qualquer variável do Supabase (`NEXT_PUBLIC_SUPABASE_*`,
`SUPABASE_SERVICE_ROLE_KEY`), `MERCADOPAGO_*`,
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

- **Supabase**: nenhum projeto real foi criado neste ambiente (sem acesso de rede). Ao criar,
  inclua `<FRONTEND_ORIGIN>/redefinir-senha` em Authentication → URL Configuration → Redirect
  URLs (links de recuperação e convite apontam para lá).
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

# CarreiraPro — Frontend

Web App/SaaS de preparação e treinamento para entrevistas de emprego: banco de perguntas, gerador
de respostas pelo método STAR e simulador de entrevista com feedback estruturado. Este projeto
serve a interface (páginas públicas, área do usuário, admin) e a autenticação — toda a lógica de
negócio é chamada do projeto **`carreirapro-backend`** por HTTP.

> O CarreiraPro é uma ferramenta de treinamento e preparação profissional. Os resultados obtidos
> variam de acordo com o perfil, experiência, preparação e contexto de cada usuário. O uso da
> plataforma não garante aprovação em processos seletivos, contratação, aumento salarial ou
> qualquer resultado profissional específico.

## Documentação

Arquitetura, como a autenticação se conecta ao backend, variáveis de ambiente e pendências:
[`docs/DOCUMENTATION.md`](./docs/DOCUMENTATION.md).

Deploy (Vercel + domínio na Hostinger, cobrindo os dois projetos):
[`docs/DEPLOY_VERCEL_HOSTINGER.md`](./docs/DEPLOY_VERCEL_HOSTINGER.md).

## Quick start

```bash
npm install
cp .env.example .env.local   # preencher com valores reais (e com o backend já rodando)
npm run dev                  # http://localhost:3000
```

Stack: Next.js 15 · React 19 · TypeScript · Tailwind CSS. A autenticação é feita pelo backend (`/api/auth/*`).

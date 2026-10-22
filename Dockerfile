# syntax=docker/dockerfile:1
#
# CarreiraPro — frontend (Next.js, saída "standalone").
#
# As variáveis NEXT_PUBLIC_* são gravadas no código durante o build, por isso
# entram como --build-arg (e não em tempo de execução). Mudou alguma? Gere a
# imagem de novo.
#
#   docker build -t carreirapro-frontend \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.seudominio.com.br \
#     --build-arg NEXT_PUBLIC_APP_URL=https://app.seudominio.com.br \
#     .
#   docker run -p 3000:3000 carreirapro-frontend

ARG NODE_VERSION=22

# --- Dependências -----------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
# Next usa o binário SWC compilado para musl no Alpine; libc6-compat cobre
# dependências nativas que esperam glibc.
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# --- Build ------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_GA_ID=
ARG NEXT_PUBLIC_GTM_ID=
ARG NEXT_PUBLIC_META_PIXEL_ID=
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID} \
    NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID} \
    NEXT_PUBLIC_META_PIXEL_ID=${NEXT_PUBLIC_META_PIXEL_ID} \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Garante que a pasta exista (o projeto pode não ter arquivos estáticos).
RUN mkdir -p public && npm run build

# --- Runtime ----------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/" > /dev/null || exit 1

CMD ["node", "server.js"]

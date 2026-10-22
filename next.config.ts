import type { NextConfig } from "next";

/**
 * Configuração do Next.js.
 *
 * Cabeçalhos de segurança básicos são aplicados aqui como defesa em
 * profundidade (além de qualquer configuração feita na camada de hospedagem/
 * CDN). Nenhum segredo é referenciado neste arquivo — apenas variáveis
 * públicas (`NEXT_PUBLIC_*`) podem chegar ao bundle do cliente.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Gera `.next/standalone` (servidor mínimo + só as dependências usadas),
  // usado pela imagem Docker. `next dev` continua igual; `next start` ainda
  // funciona, mas exibe um aviso.
  output: "standalone",
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "microphone=(self), camera=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

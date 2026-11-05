import type { Config } from "tailwindcss";

/**
 * Design tokens do VoceUP.
 *
 * Paleta atualizada em 05/11/2026 (avaliação de animações/cores, projeto "B&B"
 * não — projeto "animações e cores" no Claude):
 *  - #0F3B4D (azul petróleo) — cor de ação/marca (era #2563EB/blue-600)
 *  - #C9A227 (dourado discreto) — destaque pontual: progresso, conquistas,
 *    selos de nível concluído. Nunca em texto corrido ou botões grandes.
 *  - tons neutros (ink)      — fundo, bordas, texto secundário, inalterado
 *  - verde abafado (positive) — estados positivos (sucesso, aprovação)
 *
 * `brand.DEFAULT`/`brand.600` são o que a maior parte do app já usa
 * (bg-brand-600, hover:bg-brand-700, ring-brand-500, bg-brand-50/text-brand-700
 * nos badges) — trocar os valores aqui já repinta o app inteiro sem precisar
 * caçar cada uso.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F3B4D",
          50: "#EEF5F7",
          100: "#D6E7EC",
          200: "#AFCFD8",
          300: "#85B3C0",
          400: "#5A96A6",
          500: "#1D5C73",
          600: "#0F3B4D",
          700: "#0B2E3D",
          800: "#082430",
          900: "#051920",
        },
        gold: {
          DEFAULT: "#C9A227",
          50: "#FBF6E8",
          100: "#F5EAC6",
          200: "#ECD98E",
          300: "#E0C563",
          400: "#D4B13E",
          500: "#C9A227",
          600: "#AD8A1E",
          700: "#8C6F18",
          800: "#6B5512",
          900: "#4A3B0C",
        },
        ink: {
          DEFAULT: "#0F172A",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        positive: {
          DEFAULT: "#2F8F5B",
          50: "#F0FDF4",
          100: "#DCFCE7",
          600: "#2F8F5B",
          700: "#256F46",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

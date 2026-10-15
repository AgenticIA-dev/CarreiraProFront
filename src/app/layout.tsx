import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CookieConsentBanner } from "@/components/cookies/CookieConsentBanner";
import { AnalyticsLoader } from "@/lib/analytics/AnalyticsLoader";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "CarreiraPro — Prepare-se melhor para suas entrevistas",
    template: "%s · CarreiraPro",
  },
  description:
    "Pratique perguntas de entrevista, organize suas experiências pelo método STAR e treine respostas com feedback estruturado. Preparação, prática e evolução — sem promessas de emprego garantido.",
  applicationName: "CarreiraPro",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "CarreiraPro",
    title: "CarreiraPro — Prepare-se melhor para suas entrevistas",
    description:
      "Pratique perguntas, organize respostas pelo método STAR e treine entrevistas com feedback estruturado.",
    url: appUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "CarreiraPro — Prepare-se melhor para suas entrevistas",
    description:
      "Pratique perguntas, organize respostas pelo método STAR e treine entrevistas com feedback estruturado.",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F172A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <a href="#conteudo-principal" className="sr-only-focusable fixed left-2 top-2 z-50 rounded-lg bg-brand-600 px-3 py-2 text-sm text-white">
          Pular para o conteúdo principal
        </a>
        {children}
        <CookieConsentBanner />
        <AnalyticsLoader />
      </body>
    </html>
  );
}

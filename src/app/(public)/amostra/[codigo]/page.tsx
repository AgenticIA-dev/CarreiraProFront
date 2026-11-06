import type { Metadata } from "next";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api/config";
import { TrialSignupForm } from "@/components/trial/TrialSignupForm";

export const metadata: Metadata = { title: "Amostra grátis — VoceUP" };

interface TrialInfo {
  valid: boolean;
  partnerName?: string;
}

/**
 * Página pública que o parceiro divulga (`/amostra/:codigo`). Resolve o
 * cupom via `GET /api/trial/:codigo` (rota pública, sem autenticação) e,
 * se válido, mostra o formulário de cadastro da amostra grátis restrita.
 */
export default async function AmostraPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const code = codigo.trim().toUpperCase();

  let info: TrialInfo = { valid: false };
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/trial/${encodeURIComponent(code)}`, { cache: "no-store" });
    if (res.ok) info = (await res.json()) as TrialInfo;
  } catch {
    // Backend indisponível: segue com valid=false — a tela mostra o aviso abaixo.
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink-900">Amostra grátis do VoceUP</h1>

      {info.valid ? (
        <>
          <p className="mt-1.5 text-sm text-ink-500">
            {info.partnerName ? `Você foi indicado(a) por ${info.partnerName}. ` : ""}
            Cadastre seu e-mail para testar: 1 simulação de entrevista com feedback e o banco de perguntas com 1
            pergunta liberada por competência. O acesso dura 1 dia.
          </p>
          <div className="mt-6">
            <TrialSignupForm code={code} />
          </div>
        </>
      ) : (
        <p className="mt-1.5 text-sm text-ink-500">
          Este link de amostra grátis não é válido ou expirou. Peça um link novo para quem te indicou, ou{" "}
          <Link href="/comprar" className="text-brand-600 underline">
            assine o VoceUP
          </Link>
          .
        </p>
      )}

      <p className="mt-6 text-center text-sm text-ink-500">
        Já tem conta?{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

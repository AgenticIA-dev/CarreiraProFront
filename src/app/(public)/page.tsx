import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ClipboardList, Mic, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "CarreiraPro — Chegue mais preparado para sua próxima entrevista",
  description:
    "Pratique perguntas de entrevista, organize suas experiências pelo método STAR e treine respostas com feedback. Preparação real, sem promessas de emprego garantido.",
};

const passos = [
  {
    icon: ClipboardList,
    title: "Banco de perguntas",
    description:
      "Perguntas comportamentais, técnicas, situacionais e de liderança, com o que o entrevistador está avaliando em cada uma.",
  },
  {
    icon: Target,
    title: "Método STAR",
    description:
      "Organize suas experiências reais em Situação, Tarefa, Ação e Resultado — sem inventar nada que você não viveu.",
  },
  {
    icon: Mic,
    title: "Simulador de entrevista",
    description:
      "Responda por áudio, veja a transcrição e receba feedback estruturado sobre clareza, estrutura e objetividade.",
  },
];

export default function LandingPage() {
  return (
    <>
        <section className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Chegue mais preparado para sua próxima entrevista.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-ink-500 sm:text-lg">
            Pratique perguntas, organize suas experiências pelo método STAR e treine respostas com
            feedback.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/comprar"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-600 px-8 text-base font-medium text-white hover:bg-brand-700"
            >
              Quero me preparar
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-400">
            Acesso liberado após a compra do produto. Sem cadastro público.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {passos.map((passo) => (
              <Card key={passo.title}>
                <passo.icon className="mb-3 h-6 w-6 text-brand-600" aria-hidden="true" />
                <h2 className="text-base font-semibold text-ink-900">{passo.title}</h2>
                <p className="mt-1.5 text-sm text-ink-500">{passo.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
          <Card className="bg-ink-900 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <CheckCircle2 className="h-8 w-8 shrink-0 text-brand-400" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">O que o CarreiraPro é — e o que não é</h2>
                <p className="mt-1.5 text-sm text-ink-200">
                  Somos uma ferramenta de treinamento e preparação. Não somos empregador, agência
                  de recrutamento ou banco de vagas, e não prometemos contratação, aprovação em
                  processos seletivos ou aumento salarial. O que oferecemos é prática estruturada
                  e feedback honesto para você chegar mais preparado.
                </p>
              </div>
            </div>
          </Card>
        </section>
    </>
  );
}

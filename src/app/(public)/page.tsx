import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ClipboardList, Mic, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getApiBaseUrl } from "@/lib/api/config";

export const metadata: Metadata = {
  title: "VoceUP — Chegue na entrevista sabendo o que responder",
  description:
    "Perguntas reais de entrevista e de aumento e promoção, simulador por áudio com análise por inteligência artificial e respostas pelo método STAR. Preparação real, sem promessas de emprego garantido.",
};

// Preço e duração vêm do servidor (mesma configuração da página de compra):
// mudar CHECKOUT_PRODUCT_PRICE_BRL / CHECKOUT_ACCESS_MONTHS no Easypanel
// atualiza esta página sozinha (revalidada a cada 5 minutos).
export const revalidate = 300;

/**
 * Preço de lançamento. "De R$ 94" só pode aparecer enquanto for verdade:
 * depois de LAUNCH_ENDS, o preço "de" some automaticamente — e, para manter a
 * oferta honesta (CDC art. 37), o preço real deve passar a R$ 94 em
 * CHECKOUT_PRODUCT_PRICE_BRL a partir de 01/01/2027.
 */
const LAUNCH_REGULAR_PRICE = "R$ 94,00";
const LAUNCH_ENDS = new Date("2026-12-31T23:59:59-03:00");
const LAUNCH_ENDS_LABEL = "31/12/2026";

interface CheckoutInfo {
  configured: boolean;
  price: number | null;
  priceFormatted: string | null;
  accessMonths: number | null;
  accessLabel: string | null;
}

async function getOffer(): Promise<CheckoutInfo | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/checkout/info`, { next: { revalidate: 300 } });
    return response.ok ? ((await response.json()) as CheckoutInfo) : null;
  } catch {
    return null;
  }
}

const recursos = [
  {
    icon: ClipboardList,
    title: "Banco de perguntas reais",
    description:
      "Perguntas de entrevista por competência (comportamental, STAR, técnica, situacional, fit cultural e liderança, em 3 níveis) e para aumento e promoção, com o que o avaliador observa, dicas e o que evitar.",
  },
  {
    icon: Mic,
    title: "Simulador com análise por IA",
    description:
      "Responda por áudio ou texto e receba nota por critério, pontos fortes, sinais de senioridade, alertas e uma versão melhorada da sua resposta.",
  },
  {
    icon: Target,
    title: "Respostas STAR no padrão sênior",
    description:
      "Organize suas experiências reais em versão completa e versão curta, com checklist de senioridade — sem inventar nada que você não viveu.",
  },
  {
    icon: TrendingUp,
    title: "Modo aumento e promoção",
    description: "Treine a conversa com seu gestor, com avaliação do ponto de vista de quem decide.",
  },
];

const passos = [
  "Você compra pelo Mercado Pago.",
  "Recebe por e-mail o convite para criar sua senha.",
  "Treina quando quiser, no computador ou no celular.",
];

export default async function LandingPage() {
  const offer = await getOffer();
  const price = offer?.priceFormatted ?? null;
  const months = offer?.accessMonths ?? null;
  const durationShort = months ? `${months} ${months === 1 ? "mês" : "meses"}` : null;
  const launchActive = Date.now() <= LAUNCH_ENDS.getTime();

  const faq = [
    {
      q: "Como recebo o acesso?",
      a: "Logo após a aprovação do pagamento, por e-mail. Pelo Pix, em minutos.",
    },
    {
      q: "Por quanto tempo posso usar?",
      a: durationShort
        ? `${durationShort.charAt(0).toUpperCase()}${durationShort.slice(1)} a partir da compra, sem cobrança automática depois.`
        : "Pelo prazo informado na página de compra, sem cobrança automática depois.",
    },
    {
      q: "Posso desistir?",
      a: "Sim, em até 7 dias da compra, com reembolso (art. 49 do Código de Defesa do Consumidor).",
    },
    {
      q: "Preciso de microfone?",
      a: "É recomendado para o simulador. Você pode usar o microfone do celular — o VoceUP funciona direto no navegador do celular — ou responder digitando.",
    },
    {
      q: "Serve para a minha área?",
      a: "As perguntas são por competência e nível, e valem para a maioria das áreas e cargos.",
    },
    {
      q: "Meus dados ficam seguros?",
      a: "Sim. Não vendemos dados, e a análise por IA não recebe seu nome nem seu e-mail (LGPD).",
    },
    {
      q: "O VoceUP garante emprego ou aumento?",
      a: "Não. É treinamento: você chega mais preparado, mas o resultado depende de você e do processo.",
    },
  ];

  return (
    <>
      {/* Topo */}
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Chegue na sua entrevista (ou reunião de promoção) sabendo exatamente o que responder.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-ink-500 sm:text-lg">
          Simule cenários reais por áudio, receba análises imediatas de nível sênior e estruture suas conquistas
          com o Método STAR.
          {durationShort ? ` Pratique à vontade durante ${durationShort}.` : " Pratique à vontade."}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/comprar"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-600 px-8 text-base font-medium text-white hover:bg-brand-700"
          >
            Quero me preparar{price ? ` · ${price}` : ""}
          </Link>
        </div>
        <p className="mt-4 text-xs text-ink-500">
          Pagamento único · Pix ou cartão em até 3x · 7 dias para desistir
        </p>
      </section>

      {/* O que você recebe */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-semibold text-ink-900 sm:text-2xl">O que você recebe</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recursos.map((r) => (
            <Card key={r.title}>
              <r.icon className="mb-3 h-6 w-6 text-brand-600" aria-hidden="true" />
              <h3 className="text-base font-semibold text-ink-900">{r.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{r.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-semibold text-ink-900 sm:text-2xl">Como funciona</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {passos.map((passo, i) => (
            <li key={passo} className="rounded-2xl border border-ink-200 bg-white p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                {i + 1}
              </span>
              <p className="mt-3 text-sm text-ink-700">{passo}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Oferta */}
      <section className="mx-auto max-w-xl px-4 pb-20 sm:px-6" id="oferta">
        <Card className="border-brand-200 p-6 text-center">
          <p className="text-sm font-medium text-ink-500">VoceUP — Acesso completo</p>
          {price ? (
            <div className="mt-2">
              {launchActive ? (
                <p className="text-sm text-ink-500">
                  De <span className="line-through">{LAUNCH_REGULAR_PRICE}</span> por
                </p>
              ) : null}
              <p className="text-4xl font-semibold text-ink-900">{price}</p>
              {launchActive ? (
                <p className="mt-1 text-xs font-medium text-brand-700">Preço de lançamento até {LAUNCH_ENDS_LABEL}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-500">Veja o preço e as condições na página de compra.</p>
          )}
          <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left">
            {[
              `${offer?.accessLabel ?? "Acesso pelo prazo informado na compra"} · pagamento único, sem renovação automática`,
              "Pix, débito ou crédito em até 3x",
              "Banco de perguntas, simulador, STAR e modo aumento e promoção",
              "7 dias para desistir, com reembolso",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm text-ink-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-positive-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/comprar"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-8 text-base font-medium text-white hover:bg-brand-700"
          >
            Comprar agora
          </Link>
        </Card>
      </section>

      {/* Perguntas frequentes */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-semibold text-ink-900 sm:text-2xl">Perguntas frequentes</h2>
        <div className="divide-y divide-ink-100 rounded-2xl border border-ink-200 bg-white">
          {faq.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none text-sm font-medium text-ink-900 marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-ink-400 transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm text-ink-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Transparência */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <Card className="bg-ink-900 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-brand-400" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold">O que o VoceUP é — e o que não é</h2>
              <p className="mt-1.5 text-sm text-ink-200">
                Somos uma ferramenta de treinamento e preparação. Não somos empregador, agência de recrutamento ou
                banco de vagas, e não prometemos contratação, aprovação em processos seletivos ou aumento salarial. O
                que oferecemos é prática estruturada e feedback honesto para você chegar mais preparado.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o CarreiraPro coleta, usa e protege seus dados pessoais.",
};

export default function PrivacidadePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-ink-500">Última atualização: 14 de setembro de 2026.</p>

      <div className="prose-cp mt-8 space-y-8 text-sm leading-relaxed text-ink-700">
        <section>
          <h2 className="text-lg font-semibold text-ink-900">1. Quem somos</h2>
          <p className="mt-2">
            O CarreiraPro é uma ferramenta de treinamento e preparação para entrevistas de
            emprego. Esta política explica como tratamos os dados pessoais dos usuários da
            plataforma, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 —
            LGPD).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">2. Quais dados coletamos</h2>
          <p className="mt-2">Coletamos apenas o necessário para prestar o serviço:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Dados de cadastro: nome e e-mail, recebidos no momento da compra do produto.</li>
            <li>Dados de uso: perguntas praticadas, respostas estruturadas pelo método STAR,
              transcrições e pontuações de sessões do simulador de entrevista.</li>
            <li>Dados técnicos: endereço IP, tipo de dispositivo e navegador, para fins de
              segurança e funcionamento do serviço.</li>
            <li>Dados de consentimento de cookies e preferências de analytics/marketing, quando
              aplicável.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">3. Finalidade do tratamento</h2>
          <p className="mt-2">
            Usamos seus dados exclusivamente para: viabilizar seu acesso à plataforma, entregar as
            funcionalidades de preparação para entrevistas, gerar feedback de treinamento, cumprir
            obrigações legais e, com o seu consentimento, medir o desempenho de campanhas de
            marketing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">4. Base legal</h2>
          <p className="mt-2">
            Tratamos seus dados com base na execução do contrato (prestação do serviço
            contratado), no cumprimento de obrigação legal ou regulatória, e, quando aplicável, no
            seu consentimento (por exemplo, para cookies de analytics e marketing).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">5. Com quem compartilhamos dados</h2>
          <p className="mt-2">
            Podemos compartilhar dados estritamente necessários com prestadores de serviço que nos
            ajudam a operar a plataforma: processamento de pagamento (Mercado Pago), hospedagem e banco
            de dados, e, quando configurados, provedores de transcrição de áudio e de
            inteligência artificial usados para gerar feedback de treinamento. Não vendemos dados
            pessoais.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">6. Retenção e eliminação</h2>
          <p className="mt-2">
            Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta
            política ou obrigações legais/regulatórias/de auditoria aplicáveis. Não eliminamos
            dados automaticamente sem antes considerar tais obrigações.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">7. Seus direitos</h2>
          <p className="mt-2">
            Nos termos da LGPD, você pode solicitar acesso, correção, eliminação (nas hipóteses
            aplicáveis), portabilidade, informação sobre compartilhamento e revogação do
            consentimento. Você pode exercer esses direitos na área{" "}
            <span className="font-medium">Privacidade e meus dados</span>, dentro do seu perfil, ou
            pelo contato abaixo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">8. Segurança</h2>
          <p className="mt-2">
            Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo
            controle de acesso, criptografia em trânsito, segregação de segredos em variáveis de
            ambiente e políticas de acesso restrito ao banco de dados.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">9. Contato</h2>
          <p className="mt-2">
            Dúvidas sobre esta política ou solicitações relacionadas aos seus dados podem ser
            enviadas ao responsável pelo tratamento de dados do CarreiraPro através do e-mail de
            suporte informado na plataforma.
          </p>
        </section>

        <p className="text-xs text-ink-400">
          Este texto descreve o funcionamento real da plataforma e pode ser refinado juridicamente
          antes da publicação em produção.
        </p>
      </div>
    </article>
  );
}

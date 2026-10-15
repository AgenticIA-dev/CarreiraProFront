import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Condições de uso da plataforma CarreiraPro.",
};

export default function TermosPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">Termos de Uso</h1>
      <p className="mt-2 text-sm text-ink-500">Última atualização: 14 de setembro de 2026.</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-700">
        <section>
          <h2 className="text-lg font-semibold text-ink-900">1. O que é o CarreiraPro</h2>
          <p className="mt-2">
            O CarreiraPro é uma ferramenta de treinamento e preparação profissional para
            entrevistas de emprego, oferecendo banco de perguntas, um gerador de respostas pelo
            método STAR e um simulador de entrevista com feedback.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">2. Declaração importante sobre resultados</h2>
          <p className="mt-2 rounded-xl bg-ink-50 p-4">
            O CarreiraPro é uma ferramenta de treinamento e preparação profissional. Os resultados
            obtidos variam de acordo com o perfil, experiência, preparação e contexto de cada
            usuário. O uso da plataforma <strong>não garante</strong> aprovação em processos
            seletivos, contratação, aumento salarial ou qualquer resultado profissional
            específico.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">3. Acesso e conta</h2>
          <p className="mt-2">
            O acesso à plataforma é concedido após a confirmação do pagamento feito diretamente no
            site do CarreiraPro, processado por meio do Mercado Pago, e é pessoal e
            intransferível. Você é responsável por manter suas credenciais em sigilo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">4. Uso adequado</h2>
          <p className="mt-2">Ao usar o CarreiraPro, você concorda em:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Fornecer informações verdadeiras sobre suas experiências profissionais.</li>
            <li>Não usar a plataforma para gerar conteúdo fraudulento (currículos falsos,
              experiências inventadas, certificados falsificados).</li>
            <li>Não tentar acessar áreas administrativas ou dados de outros usuários.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">5. Conteúdo gerado por IA</h2>
          <p className="mt-2">
            As funcionalidades de inteligência artificial (geração de respostas STAR e feedback do
            simulador) trabalham exclusivamente a partir das informações fornecidas por você. A
            plataforma não inventa experiências, resultados ou métricas em seu nome; quando faltar
            informação, ela indicará isso claramente em vez de preencher lacunas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">6. Cancelamento, reembolso e suspensão</h2>
          <p className="mt-2">
            O acesso pode ser suspenso em caso de cancelamento, reembolso ou chargeback da compra
            original, conforme as notificações de status de pagamento informadas pelo Mercado
            Pago, ou em caso de uso indevido da plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">7. Propriedade intelectual</h2>
          <p className="mt-2">
            O conteúdo da plataforma (perguntas, estrutura pedagógica, marca) pertence ao
            CarreiraPro. O conteúdo que você cria (respostas STAR, transcrições) pertence a você.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">8. Alterações destes termos</h2>
          <p className="mt-2">
            Podemos atualizar estes termos periodicamente. Alterações relevantes serão comunicadas
            na plataforma.
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

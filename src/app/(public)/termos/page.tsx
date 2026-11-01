import type { Metadata } from "next";
import Link from "next/link";
import { company, LEGAL_VERSION_LABEL, orPending } from "@/lib/legal/company";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Condições de contratação e de uso da plataforma VoceUP.",
};

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-ink-900">
        {n}. {title}
      </h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

export default function TermosPage() {
  const email = orPending(company.supportEmail);
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">Termos de Uso</h1>
      <p className="mt-2 text-sm text-ink-500">Vigentes a partir de {LEGAL_VERSION_LABEL}.</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-700">
        <Section n={1} title="Quem somos">
          <p>
            O VoceUP ({company.site}) é oferecido por <strong>{orPending(company.legalName)}</strong>,
            inscrita no CNPJ/CPF sob o nº {orPending(company.document)}, com endereço em{" "}
            {orPending(company.address)} (&quot;VoceUP&quot;, &quot;nós&quot;). Atendimento:{" "}
            {email}
            {company.phone ? ` · ${company.phone}` : ""}.
          </p>
          <p>
            Ao comprar ou usar a plataforma, você declara ter lido e aceitado estes Termos e a{" "}
            <Link href="/privacidade" className="text-brand-600 underline">
              Política de Privacidade
            </Link>
            . O serviço é destinado a maiores de 18 anos.
          </p>
        </Section>

        <Section n={2} title="O que é o VoceUP">
          <p>
            Uma ferramenta online de treinamento e preparação profissional, com: banco de perguntas de
            entrevista e de conversas de aumento e promoção; gerador de respostas pelo método STAR; e
            simulador por áudio ou texto com análise da resposta.
          </p>
          <p className="rounded-xl bg-ink-50 p-4">
            Os resultados variam de acordo com o perfil, a experiência, a preparação e o contexto de cada
            pessoa. O uso da plataforma <strong>não garante</strong> aprovação em processos seletivos,
            contratação, aumento salarial, promoção ou qualquer resultado profissional específico. As notas
            e análises medem a qualidade da resposta de treinamento — não são previsão de contratação.
          </p>
        </Section>

        <Section n={3} title="Contratação, preço e pagamento">
          <p>
            O preço, a duração do acesso e o que está incluso são informados na{" "}
            <Link href="/comprar" className="text-brand-600 underline">
              página de compra
            </Link>{" "}
            antes do pagamento e valem as condições exibidas no momento da contratação. O pagamento é único
            (sem renovação automática) e processado pelo Mercado Pago, nas formas que ele disponibilizar. Não
            armazenamos dados do seu cartão.
          </p>
          <p>
            Após a aprovação do pagamento, enviamos ao e-mail informado um convite para criar a senha. Se o
            convite não chegar, use &quot;Esqueci minha senha&quot; ou fale com o atendimento.
          </p>
        </Section>

        <Section n={4} title="Duração do acesso">
          <p>
            O acesso vale pelo prazo informado na página de compra no momento da contratação, contado a partir
            da aprovação do pagamento. Ao final do prazo (quando houver), o acesso é encerrado
            automaticamente; uma nova compra renova o acesso. Você pode solicitar seus dados antes do término
            (ver a Política de Privacidade).
          </p>
        </Section>

        <Section n={5} title="Direito de arrependimento, cancelamento e reembolso">
          <p>
            Por se tratar de compra feita pela internet, você pode <strong>desistir em até 7 (sete) dias
            corridos</strong> contados da confirmação do pagamento, sem precisar justificar, conforme o art. 49
            do Código de Defesa do Consumidor. Basta enviar o pedido para {email}, informando o e-mail usado na
            compra. O valor pago será devolvido integralmente, pelo mesmo meio de pagamento, por meio do Mercado
            Pago — o prazo para o valor aparecer depende do meio de pagamento e da operadora do cartão.
          </p>
          <p>
            Com o reembolso, o acesso à plataforma é encerrado. Pedidos de reembolso fora do prazo de
            arrependimento serão analisados caso a caso, sem prejuízo dos seus direitos previstos em lei.
          </p>
        </Section>

        <Section n={6} title="Sua conta">
          <p>
            O acesso é pessoal e intransferível. Você é responsável por manter sua senha em sigilo e por todas as
            atividades feitas com a sua conta. O compartilhamento de conta pode levar à suspensão do acesso.
          </p>
        </Section>

        <Section n={7} title="Uso adequado">
          <p>Ao usar o VoceUP, você concorda em:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Fornecer informações verdadeiras sobre suas experiências profissionais.</li>
            <li>
              Não usar a plataforma para criar conteúdo fraudulento (currículos falsos, experiências inventadas,
              certificados falsificados).
            </li>
            <li>
              Não tentar acessar áreas administrativas ou dados de outras pessoas, nem automatizar o uso da
              plataforma de forma abusiva (os recursos de IA têm limite diário de uso).
            </li>
            <li>Não inserir dados pessoais sensíveis de terceiros nas suas respostas.</li>
          </ul>
          <p>O descumprimento destas regras pode levar à suspensão ou ao encerramento do acesso.</p>
        </Section>

        <Section n={8} title="Conteúdo gerado por inteligência artificial">
          <p>
            O gerador STAR e as análises do simulador usam inteligência artificial ou regras automáticas e
            trabalham somente com as informações que você fornece: a plataforma não inventa experiências,
            resultados ou números em seu nome e indica as lacunas entre [colchetes]. O conteúdo gerado é uma
            sugestão de treinamento: revise-o antes de usar e use apenas o que for verdadeiro.
          </p>
        </Section>

        <Section n={9} title="Disponibilidade e responsabilidade">
          <p>
            Trabalhamos para manter a plataforma disponível e segura, mas podem ocorrer interrupções para
            manutenção ou por falhas de terceiros (hospedagem, internet, provedores de IA). Nesses casos,
            atuaremos para restabelecer o serviço o quanto antes. Nossa responsabilidade segue o Código de Defesa
            do Consumidor e a legislação aplicável.
          </p>
        </Section>

        <Section n={10} title="Propriedade intelectual">
          <p>
            A marca VoceUP, o banco de perguntas, os textos e a estrutura pedagógica da plataforma pertencem ao
            VoceUP e não podem ser copiados ou revendidos. O conteúdo que você cria (respostas, transcrições)
            pertence a você.
          </p>
        </Section>

        <Section n={11} title="Alterações destes termos">
          <p>
            Podemos atualizar estes Termos. Mudanças relevantes serão avisadas na plataforma ou por e-mail, e não
            alteram as condições de preço e duração já contratadas.
          </p>
        </Section>

        <Section n={12} title="Lei aplicável e foro">
          <p>
            Estes Termos seguem a legislação brasileira. Fica eleito o foro do domicílio do consumidor. Antes de
            qualquer medida, fale com a gente em {email} — queremos resolver.
          </p>
        </Section>
      </div>
    </article>
  );
}

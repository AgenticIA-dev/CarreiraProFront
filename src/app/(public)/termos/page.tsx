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
            (sem renovação automática) e processado pelo Mercado Pago, por Pix, cartão de débito ou cartão de
            crédito à vista ou em até 3 parcelas (os juros do parcelamento, quando houver, são cobrados pelo
            Mercado Pago do comprador). Não armazenamos dados do seu cartão.
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
            Com o reembolso (ou com o estorno/contestação da compra junto ao meio de pagamento), o acesso à
            plataforma é <strong>encerrado imediatamente</strong>. Pedidos de reembolso fora do prazo de
            arrependimento serão analisados caso a caso, sem prejuízo dos seus direitos previstos em lei.
          </p>
          <p>
            O direito de arrependimento é integralmente preservado. Ele deve, porém, ser exercido de boa-fé, nos
            termos da seção 7.
          </p>
        </Section>

        <Section n={6} title="Licença de uso e sua conta">
          <p>
            A compra concede uma <strong>licença de uso pessoal, intransferível e não exclusiva</strong>, pelo
            prazo contratado. Ela não transfere a propriedade de nenhum conteúdo da plataforma. Você é
            responsável por manter sua senha em sigilo e por todas as atividades feitas com a sua conta.
          </p>
          <p>
            É proibido compartilhar, ceder, emprestar ou revender o login; usar a mesma conta para mais de uma
            pessoa; e copiar, extrair em massa, reproduzir, distribuir ou publicar o banco de perguntas, as
            análises e os materiais da plataforma (inclusive por meio de robôs, scripts ou capturas
            sistemáticas). O descumprimento autoriza a suspensão ou o encerramento do acesso, sem prejuízo da
            reparação de eventuais danos.
          </p>
        </Section>

        <Section n={7} title="Boa-fé, abuso de direito e enriquecimento sem causa">
          <p>
            A relação entre você e o VoceUP é regida pela <strong>boa-fé objetiva</strong> (art. 4º, III, do
            Código de Defesa do Consumidor e art. 422 do Código Civil). O conteúdo da plataforma é digital e é
            entregue no momento em que é acessado: o uso dele é a própria fruição do serviço contratado.
          </p>
          <p>
            Configura <strong>abuso de direito</strong> (art. 187 do Código Civil) e{" "}
            <strong>enriquecimento sem causa</strong> (art. 884 do Código Civil), por exemplo: contratar o
            serviço com o propósito de consumir ou extrair, em poucos dias, parte substancial do conteúdo e, em
            seguida, pedir o reembolso ou contestar o pagamento; compartilhar o acesso com terceiros; ou repetir
            compras e pedidos de reembolso para usar o serviço sem pagar.
          </p>
          <p>
            Nesses casos, o VoceUP poderá: (a) encerrar o acesso imediatamente; (b) apresentar os registros de
            uso da conta (seção 8) ao meio de pagamento, a órgãos de defesa do consumidor e ao Poder Judiciário,
            em contestações, disputas e processos; (c) recusar novas contratações da mesma pessoa; e (d) buscar,
            pelas vias legais, a compensação proporcional ao conteúdo efetivamente usufruído. Nada nesta seção
            impede o exercício regular do direito de arrependimento por quem age de boa-fé.
          </p>
        </Section>

        <Section n={8} title="Registros de uso">
          <p>
            Para operar o serviço, prevenir fraudes e comprovar a prestação do serviço, registramos o uso da
            conta: data e hora de acesso, endereço IP, navegador, e as funções utilizadas (perguntas favoritadas,
            simulações, transcrições e respostas STAR geradas). Esses registros seguem a{" "}
            <Link href="/privacidade" className="text-brand-600 underline">
              Política de Privacidade
            </Link>{" "}
            e podem ser usados como prova nas situações da seção 7.
          </p>
        </Section>

        <Section n={9} title="Uso adequado">
          <p>Ao usar o VoceUP, você concorda em:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Fornecer informações verdadeiras sobre suas experiências profissionais.</li>
            <li>
              Não usar a plataforma para criar conteúdo fraudulento (currículos falsos, experiências inventadas,
              certificados falsificados).
            </li>
            <li>
              Não tentar acessar áreas administrativas ou dados de outras pessoas, nem automatizar o uso da
              plataforma (os recursos de IA têm limite diário de uso, para garantir o funcionamento para todos).
            </li>
            <li>Não inserir dados pessoais sensíveis de terceiros nas suas respostas.</li>
          </ul>
          <p>O descumprimento destas regras pode levar à suspensão ou ao encerramento do acesso.</p>
        </Section>

        <Section n={10} title="Conteúdo gerado por inteligência artificial">
          <p>
            O gerador STAR e as análises do simulador usam inteligência artificial ou regras automáticas e
            trabalham somente com as informações que você fornece: a plataforma não inventa experiências,
            resultados ou números em seu nome e indica as lacunas entre [colchetes]. O conteúdo gerado é uma
            sugestão de treinamento: revise-o antes de usar e use apenas o que for verdadeiro.
          </p>
        </Section>

        <Section n={11} title="Disponibilidade e responsabilidade">
          <p>
            Trabalhamos para manter a plataforma disponível e segura, mas podem ocorrer interrupções para
            manutenção ou por falhas de terceiros (hospedagem, internet, provedores de IA). Nesses casos,
            atuaremos para restabelecer o serviço o quanto antes. Nossa responsabilidade segue o Código de Defesa
            do Consumidor e a legislação aplicável.
          </p>
        </Section>

        <Section n={12} title="Propriedade intelectual">
          <p>
            A marca VoceUP, o banco de perguntas, os textos, as análises e a estrutura pedagógica da plataforma
            são protegidos pela Lei de Direitos Autorais (Lei nº 9.610/1998) e pela Lei de Propriedade
            Industrial (Lei nº 9.279/1996). Pertencem ao VoceUP e não podem ser copiados, reproduzidos,
            distribuídos ou revendidos. O conteúdo que você cria (respostas, transcrições) pertence a você.
          </p>
        </Section>

        <Section n={13} title="Alterações destes termos">
          <p>
            Podemos atualizar estes Termos. Mudanças relevantes serão avisadas na plataforma ou por e-mail, e não
            alteram as condições de preço e duração já contratadas.
          </p>
        </Section>

        <Section n={14} title="Lei aplicável e foro">
          <p>
            Estes Termos seguem a legislação brasileira. Fica eleito o foro do domicílio do consumidor. Antes de
            qualquer medida, fale com a gente em {email} — queremos resolver.
          </p>
        </Section>
      </div>
    </article>
  );
}

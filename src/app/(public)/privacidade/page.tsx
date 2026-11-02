import type { Metadata } from "next";
import Link from "next/link";
import { company, LEGAL_VERSION_LABEL, orPending } from "@/lib/legal/company";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o VoceUP coleta, usa, compartilha e protege seus dados pessoais.",
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

export default function PrivacidadePage() {
  const privacyEmail = orPending(company.privacyEmail);
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-ink-500">Vigente a partir de {LEGAL_VERSION_LABEL}.</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-700">
        <Section n={1} title="Quem é o responsável pelos seus dados">
          <p>
            O controlador dos dados pessoais tratados no VoceUP ({company.site}) é{" "}
            <strong>{orPending(company.legalName)}</strong>, CNPJ/CPF {orPending(company.document)}, com
            endereço em {orPending(company.address)}. Esta política segue a Lei Geral de Proteção de Dados
            (Lei nº 13.709/2018 — LGPD).
          </p>
          <p>
            Canal do titular e encarregado pelo tratamento de dados
            {company.dpoName ? `: ${company.dpoName}` : ""} — {privacyEmail}.
          </p>
        </Section>

        <Section n={2} title="Quais dados tratamos">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Cadastro e compra:</strong> e-mail, nome (se você informar), senha (guardada apenas como
              hash criptográfico — nem nós conseguimos lê-la) e dados da compra recebidos do Mercado Pago (id e
              status do pagamento, valor, data e nome/e-mail do pagador). Não recebemos nem guardamos dados do
              seu cartão.
            </li>
            <li>
              <strong>Uso da plataforma:</strong> perguntas favoritas, respostas que você escreve no gerador
              STAR, transcrições, notas e análises das suas simulações.
            </li>
            <li>
              <strong>Áudio do simulador:</strong> a gravação é enviada ao nosso servidor apenas para ser
              transcrita e <strong>não é armazenada</strong> por nós; guardamos somente o texto da transcrição.
            </li>
            <li>
              <strong>Dados técnicos e registros de uso:</strong> data e hora de cada acesso, endereço IP,
              navegador e as funções usadas (simulações, transcrições, respostas STAR, perguntas favoritas), com a
              estimativa do custo de processamento de cada uma. São usados para segurança, prevenção a fraudes,
              gestão do serviço, comprovação da prestação do serviço e cumprimento do Marco Civil da Internet.
            </li>
            <li>
              <strong>Preferências de cookies:</strong> sua escolha de consentimento (aceitar, rejeitar ou
              personalizar) e a data da decisão.
            </li>
          </ul>
          <p>
            Não pedimos dados pessoais sensíveis. Evite incluir nas suas respostas informações sensíveis suas
            ou de outras pessoas (saúde, religião, dados de colegas etc.).
          </p>
        </Section>

        <Section n={3} title="Para que usamos e com qual base legal">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Prestar o serviço contratado</strong> — criar sua conta, liberar o acesso após o pagamento,
              gerar respostas STAR, transcrever e analisar suas simulações, dar suporte (execução de contrato,
              art. 7º, V).
            </li>
            <li>
              <strong>Cumprir obrigações legais</strong> — fiscais, de defesa do consumidor e guarda de
              registros de acesso (art. 7º, II).
            </li>
            <li>
              <strong>Segurança e prevenção a fraudes</strong> — proteger contas e evitar abuso, como
              compartilhamento de login e uso desproporcional seguido de reembolso (legítimo interesse, art. 7º,
              IX).
            </li>
            <li>
              <strong>Defesa em disputas</strong> — usar os registros de uso como prova em contestações de
              pagamento (chargeback), reclamações e processos (exercício regular de direitos, art. 7º, VI).
            </li>
            <li>
              <strong>Gestão e melhoria do serviço</strong> — medir o uso e o custo de cada função e oferecer
              renovação ou conteúdos relacionados ao que você já usa dentro da plataforma (legítimo interesse,
              art. 7º, IX). E-mails promocionais só são enviados com o seu consentimento, e você pode cancelar a
              qualquer momento.
            </li>
            <li>
              <strong>Medição e marketing</strong> — somente com o seu consentimento nos cookies, que pode ser
              revogado a qualquer momento em{" "}
              <Link href="/cookies" className="text-brand-600 underline">
                Cookies
              </Link>{" "}
              (art. 7º, I).
            </li>
          </ul>
          <p>Não vendemos dados pessoais e não usamos suas respostas para fins de marketing.</p>
        </Section>

        <Section n={4} title="Com quem compartilhamos">
          <p>Somente com fornecedores necessários para operar o serviço, que tratam os dados em nosso nome:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Mercado Pago</strong> — processamento do pagamento.
            </li>
            <li>
              <strong>Hospedagem e banco de dados</strong> — servidores onde a plataforma funciona.
            </li>
            <li>
              <strong>Provedor de e-mail</strong> — envio do convite de acesso e da redefinição de senha.
            </li>
            <li>
              <strong>OpenAI</strong> (quando a análise por inteligência artificial está ativa) — recebe o áudio
              para transcrição e o texto das suas respostas para gerar a análise. Não enviamos seu nome ou e-mail
              junto.
            </li>
            <li>
              <strong>Ferramentas de analytics/marketing</strong> (ex.: Google, Meta) — apenas se você
              consentir nos cookies.
            </li>
          </ul>
          <p>
            <strong>Reconhecimento de voz do navegador:</strong> no simulador, se o seu navegador oferecer
            transcrição ao vivo (como Chrome, Edge ou Safari), o áudio também pode ser processado pela empresa
            responsável pelo navegador (Google, Microsoft ou Apple), conforme a política de privacidade dela.
            Se preferir, responda digitando.
          </p>
          <p>
            Também podemos compartilhar dados quando exigido por lei ou por ordem de autoridade competente.
          </p>
        </Section>

        <Section n={5} title="Transferência internacional">
          <p>
            Alguns fornecedores (como a OpenAI e, conforme a configuração, a hospedagem ou o e-mail) podem
            processar dados fora do Brasil, especialmente nos Estados Unidos. Nesses casos, a transferência
            ocorre para a execução do contrato com você e com as garantias contratuais previstas no art. 33 da
            LGPD e na regulamentação da ANPD.
          </p>
        </Section>

        <Section n={6} title="Por quanto tempo guardamos">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Dados de conta e de uso:</strong> enquanto o seu acesso estiver ativo. Após o fim do
              acesso, por até 12 meses (para permitir uma renovação sem perda do histórico), salvo pedido de
              exclusão antes disso.
            </li>
            <li>
              <strong>Pedido de exclusão:</strong> eliminamos os dados de uso em até 30 dias, mantendo apenas o
              que a lei obriga a guardar.
            </li>
            <li>
              <strong>Dados de compra e fiscais:</strong> pelo prazo exigido pela legislação fiscal e de defesa
              do consumidor (em geral, 5 anos).
            </li>
            <li>
              <strong>Registros de acesso e de uso:</strong> no mínimo 6 meses, como exige o Marco Civil da
              Internet (Lei nº 12.965/2014), e até 5 anos após a compra quando necessários para comprovar a
              prestação do serviço ou para a defesa em disputas e processos (prazo prescricional do art. 27 do
              Código de Defesa do Consumidor).
            </li>
            <li>
              <strong>Registro de consentimento de cookies:</strong> pelo tempo necessário para comprovar a sua
              escolha.
            </li>
          </ul>
        </Section>

        <Section n={7} title="Seus direitos">
          <p>
            Você pode pedir confirmação e acesso aos seus dados, correção, anonimização, bloqueio ou eliminação,
            portabilidade, informação sobre compartilhamentos e revogação do consentimento (art. 18 da LGPD). Faça
            o pedido em{" "}
            <Link href="/app/privacidade-dados" className="text-brand-600 underline">
              Privacidade e meus dados
            </Link>
            , dentro da sua conta, ou pelo e-mail {privacyEmail}. Respondemos em até 15 dias. Você também pode
            apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).
          </p>
        </Section>

        <Section n={8} title="Segurança">
          <p>
            Usamos conexão criptografada (HTTPS), senhas armazenadas com hash, controle de acesso por usuário,
            segredos guardados fora do código e acesso restrito ao banco de dados. Nenhum sistema é 100% imune;
            se ocorrer um incidente de segurança que possa causar risco relevante a você, avisaremos você e a
            ANPD, como exige a lei.
          </p>
        </Section>

        <Section n={9} title="Menores de idade">
          <p>O VoceUP é destinado a maiores de 18 anos e não coleta intencionalmente dados de menores.</p>
        </Section>

        <Section n={10} title="Alterações">
          <p>
            Podemos atualizar esta política. A data de vigência fica no topo da página e mudanças relevantes
            serão avisadas na plataforma ou por e-mail.
          </p>
        </Section>
      </div>
    </article>
  );
}

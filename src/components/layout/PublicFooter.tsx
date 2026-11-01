import Link from "next/link";
import { company, orPending } from "@/lib/legal/company";

export function PublicFooter() {
  return (
    <footer className="border-t border-ink-100 bg-ink-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="max-w-3xl text-sm leading-relaxed text-ink-500">
          O VoceUP é uma ferramenta de treinamento e preparação profissional. Os resultados
          obtidos variam de acordo com o perfil, experiência, preparação e contexto de cada
          usuário. O uso da plataforma não garante aprovação em processos seletivos, contratação,
          aumento salarial ou qualquer resultado profissional específico.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
          <Link href="/privacidade" className="hover:text-ink-900">
            Privacidade
          </Link>
          <Link href="/termos" className="hover:text-ink-900">
            Termos de uso
          </Link>
          <Link href="/cookies" className="hover:text-ink-900">
            Cookies
          </Link>
          {company.supportEmail && (
            <a href={`mailto:${company.supportEmail}`} className="hover:text-ink-900">
              Atendimento: {company.supportEmail}
            </a>
          )}
        </div>
        {/* Identificação do fornecedor — Decreto 7.962/2013, art. 2º. */}
        <p className="mt-4 text-xs leading-relaxed text-ink-400">
          © {new Date().getFullYear()} {company.brand} · {orPending(company.legalName)} · CNPJ/CPF{" "}
          {orPending(company.document)} · {orPending(company.address)}
          {company.phone ? ` · ${company.phone}` : ""}
        </p>
      </div>
    </footer>
  );
}

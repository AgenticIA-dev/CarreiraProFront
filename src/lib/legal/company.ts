/**
 * Dados do fornecedor/controlador exibidos no rodapé, na página de compra e
 * nos textos legais (Decreto 7.962/2013 e LGPD, art. 9º).
 *
 * Vêm de variáveis NEXT_PUBLIC_COMPANY_* do arquivo de ambiente do frontend
 * (são públicas por natureza). Preencha TODAS antes de vender — enquanto
 * alguma das obrigatórias estiver vazia, a página de compra fica bloqueada e
 * o site mostra "[a definir]".
 */
export const company = {
  brand: "VoceUP",
  site: "www.voceup.com.br",
  legalName: process.env.NEXT_PUBLIC_COMPANY_NAME?.trim() || "",
  document: process.env.NEXT_PUBLIC_COMPANY_DOCUMENT?.trim() || "", // CNPJ (ou CPF, se pessoa física)
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS?.trim() || "",
  supportEmail: process.env.NEXT_PUBLIC_COMPANY_EMAIL?.trim() || "",
  privacyEmail:
    process.env.NEXT_PUBLIC_COMPANY_PRIVACY_EMAIL?.trim() || process.env.NEXT_PUBLIC_COMPANY_EMAIL?.trim() || "",
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE?.trim() || "",
  /** Nome do encarregado (DPO). Opcional para agente de pequeno porte — o canal (privacyEmail) é obrigatório. */
  dpoName: process.env.NEXT_PUBLIC_COMPANY_DPO_NAME?.trim() || "",
};

/** Data de vigência dos Termos e da Política (igual a TERMS_VERSION do backend). */
export const LEGAL_VERSION = "2026-11-02";
export const LEGAL_VERSION_LABEL = "2 de novembro de 2026";

export const companyComplete = Boolean(
  company.legalName && company.document && company.address && company.supportEmail
);

export const orPending = (value: string) => value || "[a definir]";

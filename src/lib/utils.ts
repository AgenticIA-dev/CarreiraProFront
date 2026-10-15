import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina classes condicionalmente e resolve conflitos do Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata uma data ISO para o padrão brasileiro (dd/mm/aaaa). */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(iso));
}

/** Gera um id anônimo estável para registro de consentimento de visitantes. */
export function getOrCreateAnonymousId(): string {
  const key = "cp_anon_id";
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key, id);
  }
  return id;
}

import * as React from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Skeleton genérico para estados de carregamento. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-lg bg-gradient-to-r from-ink-100 via-ink-200 to-ink-100 bg-[length:200%_100%]",
        className
      )}
      aria-hidden="true"
    />
  );
}

/** Estado de carregamento em página inteira, com texto para leitores de tela. */
export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-500" role="status">
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

/** Estado vazio: explica o que aconteceu e o que o usuário pode fazer. */
export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-200 px-6 py-14 text-center">
      <Icon className="mb-2 h-8 w-8 text-ink-300" aria-hidden="true" />
      <p className="text-sm font-medium text-ink-900">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/** Estado de erro: linguagem humana, nunca stack trace ou detalhes internos. */
export function ErrorState({
  title = "Algo deu errado",
  description = "Não conseguimos concluir essa ação agora. Tente novamente em instantes.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center"
    >
      <AlertTriangle className="mb-2 h-7 w-7 text-red-500" aria-hidden="true" />
      <p className="text-sm font-medium text-red-900">{title}</p>
      <p className="max-w-sm text-sm text-red-700">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

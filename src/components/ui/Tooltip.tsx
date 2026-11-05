"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";

/** Ícone "i" com texto explicativo — usado para tirar aviso/legenda do texto sempre visível. */
export function InfoTooltip({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-ink-400 hover:text-ink-600"
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Mais informações</span>
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg bg-ink-900 px-3 py-2 text-xs leading-relaxed text-white shadow-card"
        >
          {label}
        </span>
      )}
    </span>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Copia a URL completa (origem atual + `path`) — usado para o link de amostra grátis do parceiro. */
export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      const url = `${window.location.origin}${path}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // área de transferência bloqueada — ignora
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={copy}>
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {copied ? "Copiado!" : "Copiar link"}
    </Button>
  );
}

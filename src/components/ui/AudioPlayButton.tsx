"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PlayState = "idle" | "loading" | "playing" | "paused" | "error";

/**
 * Botão de áudio genérico (ouvir pergunta, estrutura recomendada ou resumo
 * do feedback, em voz).
 *
 * Não dá para usar `<audio src="...">` direto: os endpoints de áudio exigem
 * `Authorization: Bearer <token>` (ver `src/lib/api/client.ts`), que só vai
 * em cabeçalhos de `fetch`. Em vez disso, busca o MP3 com `fetchAudio`,
 * guarda como Blob em memória (uma vez) e toca via `<audio>` controlado por
 * JS, com `URL.createObjectURL`.
 */
export function AudioPlayButton({
  label = "Ouvir",
  fetchAudio,
  className,
}: {
  label?: string;
  fetchAudio: () => Promise<Response>;
  className?: string;
}) {
  const [state, setState] = useState<PlayState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  async function handleClick() {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("paused");
      return;
    }
    if (state === "paused" && audioRef.current) {
      await audioRef.current.play();
      setState("playing");
      return;
    }

    setState("loading");
    try {
      let url = blobUrlRef.current;
      if (!url) {
        const response = await fetchAudio();
        if (!response.ok) throw new Error(`status ${response.status}`);
        const blob = await response.blob();
        url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
      }
      if (!audioRef.current) {
        const audio = new Audio(url);
        audio.addEventListener("ended", () => {
          audio.currentTime = 0;
          setState("idle");
        });
        audioRef.current = audio;
      }
      await audioRef.current.play();
      setState("playing");
    } catch (err) {
      console.error("[audio] Falha ao tocar áudio:", err);
      setState("error");
    }
  }

  const Icon = state === "loading" ? Loader2 : state === "playing" ? Pause : state === "error" ? Volume2 : Play;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "loading"}
      aria-label={state === "playing" ? `Pausar: ${label}` : label}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60",
        state === "error" && "text-red-600 hover:bg-red-50",
        className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", state === "loading" && "animate-spin")} aria-hidden="true" />
      {state === "error" ? "Erro — tentar de novo" : label}
    </button>
  );
}

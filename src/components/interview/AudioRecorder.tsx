"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Gravação de áudio acessível (PROMPT MESTRE §22, §34):
 *  - Controles operáveis por teclado (são <button> nativos).
 *  - Estado anunciado via aria-live para leitores de tela.
 *  - Nunca expõe nenhuma chave de API no navegador — apenas grava e envia o
 *    blob para o backend, que fala com o provedor de transcrição.
 */
export function AudioRecorder({
  onRecorded,
  disabled,
}: {
  onRecorded: (blob: Blob) => void;
  disabled?: boolean;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        onRecorded(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setSeconds(0);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError(
        "Não conseguimos acessar seu microfone. Verifique as permissões do navegador e tente novamente."
      );
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-ink-200 bg-white p-6">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        aria-pressed={isRecording}
        aria-label={isRecording ? "Parar gravação" : "Iniciar gravação"}
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full text-white transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
          isRecording ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </button>

      <p aria-live="polite" className="text-sm font-medium text-ink-700">
        {isRecording ? `Gravando… ${mm}:${ss}` : "Toque para gravar sua resposta"}
      </p>

      {error && (
        <p role="alert" className="text-center text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

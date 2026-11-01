"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Gravação de áudio acessível (PROMPT MESTRE §22, §34):
 *  - Controles operáveis por teclado (são <button> nativos).
 *  - Estado anunciado via aria-live para leitores de tela.
 *  - Nunca expõe nenhuma chave de API no navegador — apenas grava e envia o
 *    blob para o backend, que fala com o provedor de transcrição.
 *
 * Correções:
 *  - Escolhe um formato que o navegador REALMENTE suporta (webm/opus no
 *    Chrome/Edge/Firefox, mp4/aac no Safari/iPhone) e informa o tipo ao pai,
 *    para o arquivo ser enviado com a extensão certa.
 *  - Mensagens de erro específicas (permissão negada, sem microfone,
 *    microfone em uso, página sem HTTPS).
 *  - Em paralelo, usa o reconhecimento de fala do próprio navegador
 *    (Chrome/Edge/Safari) para gerar uma transcrição ao vivo — usada como
 *    alternativa quando o backend não tem transcrição configurada ou falha.
 *  - Bloqueia gravações vazias e para sozinho em 5 minutos.
 */

const MAX_SECONDS = 5 * 60;
const MIN_SECONDS = 3;

const PREFERRED_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") {
    return undefined;
  }
  return PREFERRED_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
}

// Tipos mínimos da Web Speech API (não fazem parte do lib.dom padrão).
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

function createSpeechRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  try {
    const rec = new Ctor();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;
    return rec;
  } catch {
    return null;
  }
}

function describeMicError(err: unknown): string {
  const name = (err as { name?: string })?.name ?? "";
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "O acesso ao microfone foi bloqueado. Clique no ícone de cadeado ao lado do endereço do site, permita o microfone e tente de novo.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "Nenhum microfone foi encontrado. Conecte um microfone (ou fone com microfone) e tente novamente.";
    case "NotReadableError":
    case "AbortError":
      return "O microfone está sendo usado por outro programa (ex.: Meet, Teams, Zoom). Feche-o e tente novamente.";
    default:
      return "Não conseguimos acessar seu microfone. Verifique as permissões do navegador e tente novamente.";
  }
}

export interface RecordingResult {
  blob: Blob;
  mimeType: string;
  /** Transcrição do reconhecimento de fala do navegador ("" se indisponível). */
  liveTranscript: string;
  durationSeconds: number;
}

export function AudioRecorder({
  onRecorded,
  disabled,
}: {
  onRecorded: (result: RecordingResult) => void;
  disabled?: boolean;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [livePreview, setLivePreview] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTextRef = useRef("");
  const startedAtRef = useRef(0);
  const stoppingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      recognitionRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function startLiveTranscription() {
    const rec = createSpeechRecognition();
    if (!rec) return;
    finalTextRef.current = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]!;
        if (r.isFinal) finalTextRef.current += `${r[0].transcript.trim()} `;
        else interim += r[0].transcript;
      }
      setLivePreview(`${finalTextRef.current}${interim}`.trim());
    };
    rec.onerror = () => {
      // Sem rede/permissão para o reconhecimento: segue só com a gravação.
    };
    rec.onend = () => {
      // O Chrome encerra o reconhecimento após silêncios; reinicia enquanto grava.
      if (!stoppingRef.current && mediaRecorderRef.current?.state === "recording") {
        try {
          rec.start();
        } catch {
          // ignora
        }
      }
    };
    try {
      rec.start();
      recognitionRef.current = rec;
    } catch {
      recognitionRef.current = null;
    }
  }

  async function startRecording() {
    setError(null);
    setLivePreview("");

    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError(
        "A gravação de áudio só funciona em conexão segura (https://). Acesse o site pelo endereço com https."
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Seu navegador não suporta gravação de áudio. Use a versão atual do Chrome, Edge, Firefox ou Safari.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (err) {
      setError(describeMicError(err));
      return;
    }

    try {
      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      stoppingRef.current = false;
      streamRef.current = stream;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const type = recorder.mimeType || mimeType || chunksRef.current[0]?.type || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        const durationSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);

        if (blob.size < 1024 || durationSeconds < MIN_SECONDS) {
          setError(
            durationSeconds < MIN_SECONDS
              ? "A gravação ficou curta demais. Toque no microfone, responda e só então toque para parar."
              : "Não captamos áudio. Verifique se o microfone certo está selecionado e se não está mudo."
          );
          return;
        }

        // Dá um instante para o reconhecimento entregar o último trecho.
        setTimeout(() => {
          onRecorded({
            blob,
            mimeType: type,
            liveTranscript: finalTextRef.current.trim(),
            durationSeconds,
          });
        }, 400);
      };
      recorder.onerror = () => {
        setError("A gravação foi interrompida por um erro do navegador. Tente novamente.");
      };

      // timeslice: entrega pedaços a cada 1 s — evita perder tudo se a aba travar.
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setIsRecording(true);
      setSeconds(0);
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setSeconds(elapsed);
        if (elapsed >= MAX_SECONDS) stopRecording();
      }, 1000);

      startLiveTranscription();
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      setError("Não foi possível iniciar a gravação neste navegador. Tente o Chrome ou o Edge atualizados.");
    }
  }

  function stopRecording() {
    stoppingRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignora
    }
    recognitionRef.current = null;
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.requestData();
      } catch {
        // alguns navegadores não suportam requestData antes do stop
      }
      recorder.stop();
    }
    setIsRecording(false);
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
          isRecording ? "animate-pulse bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </button>

      <p aria-live="polite" className="text-sm font-medium text-ink-700">
        {isRecording ? `Gravando… ${mm}:${ss} — toque para parar` : "Toque para gravar sua resposta"}
      </p>
      {!isRecording && (
        <p className="text-center text-xs text-ink-400">Ideal: entre 1min30 e 2min30. Limite: 5 minutos.</p>
      )}

      {isRecording && livePreview && (
        <p className="max-h-24 w-full overflow-y-auto rounded-lg bg-ink-50 p-2 text-xs text-ink-500" aria-hidden="true">
          {livePreview}
        </p>
      )}

      {error && (
        <p role="alert" className="text-center text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

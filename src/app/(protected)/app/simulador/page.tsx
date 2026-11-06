"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Briefcase, Keyboard, Mic, RotateCcw, Shuffle, TrendingUp, Volume2 } from "lucide-react";
import { AudioRecorder, type RecordingResult } from "@/components/interview/AudioRecorder";
import { InterviewAnalysisCard, type InterviewEvaluation } from "@/components/interview/InterviewAnalysisCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { apiFetch } from "@/lib/api/client";

type Stage =
  | "idle"
  | "loading-question"
  | "ready"
  | "recording-done"
  | "transcribing"
  | "reviewing-transcript"
  | "scoring"
  | "completed"
  | "error"
  | "trial-limit";

interface QuestionInfo {
  questionId: string;
  question: string;
  category: string;
  difficulty?: string;
}

interface PoolInfo {
  total: number;
  remainingUnanswered: number;
  allAnswered: boolean;
}

type Mode = "entrevista" | "aumento_promocao";

const interviewCategories = [
  { value: "", label: "Todas as competências" },
  { value: "comportamental", label: "Comportamental" },
  { value: "star", label: "Método STAR" },
  { value: "tecnica", label: "Técnica" },
  { value: "situacional", label: "Situacional" },
  { value: "fit_cultural", label: "Fit cultural" },
  { value: "lideranca", label: "Liderança" },
];

const levels = [
  { value: "", label: "Todos os níveis" },
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediaria", label: "Intermediária" },
  { value: "avancada", label: "Avançada" },
];

const labelOf = (list: { value: string; label: string }[], value?: string) =>
  list.find((i) => i.value === value)?.label ?? value ?? "";

const categoryLabel = (value?: string) =>
  value === "aumento_promocao" ? "Aumento e promoção" : labelOf(interviewCategories, value);

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 bg-white text-ink-600 hover:bg-ink-100"
      }`}
    >
      {children}
    </button>
  );
}

export default function SimuladorPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<QuestionInfo | null>(null);
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  const [mode, setMode] = useState<Mode>("entrevista");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [pool, setPool] = useState<PoolInfo | null>(null);
  const [fixedQuestionId, setFixedQuestionId] = useState<string | null>(null);

  // "Treinar no simulador" a partir do banco de perguntas: /app/simulador?pergunta=<id>
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current) return; // React StrictMode roda efeitos 2x em dev
    autoStarted.current = true;
    const id = new URLSearchParams(window.location.search).get("pergunta");
    if (id && /^[0-9a-f-]{36}$/i.test(id)) {
      setFixedQuestionId(id);
      void startSimulation({ questionId: id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pré-seleciona o nível de dificuldade a partir do nível de experiência
  // salvo no perfil (item C da avaliação de UX) — o usuário ainda pode trocar.
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/account/me");
        const data = (await res.json().catch(() => null)) as { profile?: { experience_level?: string | null } } | null;
        const level = data?.profile?.experience_level;
        const mapped = level === "junior" ? "iniciante" : level === "senior" ? "avancada" : level === "pleno" ? "intermediaria" : null;
        if (mapped) setDifficulty(mapped);
      } catch {
        // Sem profile disponível: mantém "Todos os níveis" (comportamento de sempre).
      }
    })();
  }, []);

  async function startSimulation(options: { questionId?: string } = {}) {
    setStage("loading-question");
    setErrorMessage(null);
    setNotice(null);
    setEvaluation(null);
    try {
      const body = options.questionId
        ? { questionId: options.questionId }
        : {
            mode,
            category: mode === "entrevista" && category ? category : null,
            difficulty: difficulty || null,
          };
      const res = await apiFetch("/api/interview/question", { method: "POST", body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.trialLimitReached) {
          setErrorMessage(data.error ?? "Você já usou sua simulação grátis.");
          setStage("trial-limit");
          return;
        }
        throw new Error(data.error ?? "");
      }
      setSessionId(data.session.id);
      setQuestion(data.question);
      setPool(options.questionId ? null : (data.pool ?? null));
      setTranscript("");
      setStage("ready");
    } catch (err) {
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : "Não foi possível iniciar a simulação agora. Tente novamente em instantes."
      );
      setStage("error");
    }
  }

  function nextQuestion() {
    // Depois de uma pergunta específica, a próxima volta a seguir os filtros.
    if (fixedQuestionId) {
      setFixedQuestionId(null);
      window.history.replaceState(null, "", "/app/simulador");
    }
    void startSimulation();
  }

  function speakQuestion() {
    if (!question || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(question.question);
    utterance.lang = "pt-BR";
    window.speechSynthesis.speak(utterance);
  }

  function extensionFor(mimeType: string) {
    const base = mimeType.split(";")[0]!.toLowerCase();
    if (base.includes("mp4") || base.includes("m4a") || base.includes("aac")) return "mp4";
    if (base.includes("ogg")) return "ogg";
    if (base.includes("mpeg") || base.includes("mp3")) return "mp3";
    if (base.includes("wav")) return "wav";
    return "webm";
  }

  async function handleRecorded(recording: RecordingResult) {
    if (!sessionId) return;
    setStage("transcribing");
    setErrorMessage(null);
    setNotice(null);

    const live = recording.liveTranscript;
    try {
      const formData = new FormData();
      formData.append("sessionId", sessionId);
      formData.append("audio", recording.blob, `resposta.${extensionFor(recording.mimeType)}`);

      const res = await apiFetch("/api/interview/transcribe", { method: "POST", body: formData });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        session?: { transcript?: string | null };
        transcriptionAvailable?: boolean;
      };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      const serverText = (data.session?.transcript ?? "").trim();
      if (data.transcriptionAvailable !== false && serverText) {
        setTranscript(serverText);
      } else if (live) {
        setTranscript(live);
        setNotice("Transcrição feita pelo reconhecimento de voz do navegador. Revise antes de enviar.");
      } else {
        setTranscript("");
        setErrorMessage(
          "A transcrição automática não está disponível agora. Digite sua resposta abaixo (ou use o Chrome/Edge, que transcrevem pelo navegador)."
        );
      }
      setStage("reviewing-transcript");
    } catch (err) {
      console.error("[simulador] Falha na transcrição:", err);
      if (live) {
        setTranscript(live);
        setNotice("O servidor não conseguiu transcrever; usamos a transcrição do navegador. Revise antes de enviar.");
      } else {
        setErrorMessage(
          err instanceof Error && err.message && !err.message.startsWith("HTTP")
            ? err.message
            : "Não foi possível transcrever o áudio. Você pode digitar sua resposta manualmente abaixo."
        );
      }
      setStage("reviewing-transcript");
    }
  }

  function answerByTyping() {
    setTranscript("");
    setErrorMessage(null);
    setNotice(null);
    setStage("reviewing-transcript");
  }

  async function submitForFeedback() {
    if (!sessionId || !question) return;
    if (transcript.trim().split(/\s+/).filter(Boolean).length < 5) {
      setErrorMessage("Sua resposta está curta demais para ser avaliada. Complete o texto ou grave novamente.");
      return;
    }
    setStage("scoring");
    setErrorMessage(null);
    try {
      const res = await apiFetch("/api/interview/feedback", {
        method: "POST",
        body: JSON.stringify({ sessionId, question: question.question, transcript, category: question.category }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        evaluation?: InterviewEvaluation;
        session?: { score: number; score_breakdown: InterviewEvaluation["breakdown"]; feedback: string | null };
      };
      if (res.status === 422 || res.status === 429) {
        setErrorMessage(data.error ?? "Resposta curta demais para avaliar.");
        setStage("reviewing-transcript");
        return;
      }
      if (!res.ok) throw new Error(data.error);

      setEvaluation(
        data.evaluation ?? {
          score: data.session?.score ?? 0,
          breakdown: data.session?.score_breakdown ?? { estrutura: 0, clareza: 0, objetividade: 0, resultado: 0 },
          strengths: [],
          improvements: [],
          nextAction: data.session?.feedback ?? "",
        }
      );
      setStage("completed");
    } catch {
      setErrorMessage("Não foi possível gerar o feedback agora. Tente novamente em instantes.");
      setStage("reviewing-transcript");
    }
  }

  function reset() {
    setStage("idle");
    setSessionId(null);
    setQuestion(null);
    setTranscript("");
    setEvaluation(null);
    setErrorMessage(null);
    setNotice(null);
    setPool(null);
    if (fixedQuestionId) {
      setFixedQuestionId(null);
      window.history.replaceState(null, "", "/app/simulador");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Simulador de entrevista</h1>
        <p className="mt-1 text-sm text-ink-500">
          Responda por áudio e receba feedback estruturado sobre sua resposta de treinamento.
        </p>
      </div>

      {stage === "idle" && (
        <Card>
          <p className="text-sm font-medium text-ink-900">O que você quer treinar?</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  value: "entrevista" as const,
                  icon: Briefcase,
                  title: "Entrevista de emprego",
                  desc: "Perguntas de processo seletivo, avaliadas como um entrevistador sênior avaliaria.",
                },
                {
                  value: "aumento_promocao" as const,
                  icon: TrendingUp,
                  title: "Pedir aumento ou promoção",
                  desc: "Para quem já está empregado: treine a conversa com o gestor, o RH ou o comitê.",
                },
              ]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMode(opt.value)}
                aria-pressed={mode === opt.value}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  mode === opt.value ? "border-brand-600 bg-brand-50" : "border-ink-200 bg-white hover:border-brand-300"
                }`}
              >
                <opt.icon className="mb-2 h-5 w-5 text-brand-600" aria-hidden="true" />
                <p className="text-sm font-semibold text-ink-900">{opt.title}</p>
                <p className="mt-1 text-xs text-ink-500">{opt.desc}</p>
              </button>
            ))}
          </div>

          {mode === "entrevista" && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">Competência</p>
              <div className="flex flex-wrap gap-2">
                {interviewCategories.map((c) => (
                  <Chip key={c.value} active={category === c.value} onClick={() => setCategory(c.value)}>
                    {c.label}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">Nível</p>
            <div className="flex flex-wrap gap-2">
              {levels.map((l) => (
                <Chip key={l.value} active={difficulty === l.value} onClick={() => setDifficulty(l.value)}>
                  {l.label}
                </Chip>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-ink-400">
              Pré-selecionado a partir do seu nível de experiência em{" "}
              <Link href="/app/perfil" className="underline hover:text-ink-600">
                Perfil
              </Link>
              .
            </p>
          </div>

          <p className="mt-4 text-xs text-ink-500">
            As perguntas que você ainda não respondeu aparecem primeiro. Depois você recebe uma análise
            com nota por critério, pontos de atenção, sua resposta reestruturada e as próximas perguntas
            que {mode === "aumento_promocao" ? "o seu gestor" : "o entrevistador"} provavelmente faria.
          </p>
          <Button type="button" className="mt-4" onClick={() => void startSimulation()}>
            Iniciar simulação
          </Button>
        </Card>
      )}

      {stage === "loading-question" && <LoadingState label="Preparando sua pergunta…" />}

      {stage === "error" && (
        <ErrorState
          description={errorMessage ?? undefined}
          action={
            <Button type="button" size="sm" onClick={reset}>
              Tentar novamente
            </Button>
          }
        />
      )}

      {stage === "trial-limit" && (
        <Card className="text-center">
          <p className="text-sm font-semibold text-ink-900">Você atingiu o limite da amostra grátis</p>
          <p className="mt-1.5 text-sm text-ink-500">{errorMessage}</p>
          <Link href="/comprar">
            <Button type="button" className="mt-4">
              Assinar o VoceUP
            </Button>
          </Link>
        </Card>
      )}

      {question && ["ready", "recording-done", "transcribing", "reviewing-transcript", "scoring"].includes(stage) && (
        <Card>
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-lg bg-brand-50 px-2 py-0.5 font-medium text-brand-700">
              {categoryLabel(question.category)}
            </span>
            {question.difficulty && (
              <span className="rounded-lg bg-ink-100 px-2 py-0.5 font-medium text-ink-600">
                {labelOf(levels, question.difficulty)}
              </span>
            )}
            {pool && (
              <span className="ml-auto text-ink-400">
                {pool.allAnswered
                  ? `Você já respondeu todas as ${pool.total} deste filtro — repetindo as mais antigas`
                  : `${pool.remainingUnanswered} de ${pool.total} ainda não respondidas`}
              </span>
            )}
          </div>
          <div className="flex items-start justify-between gap-3">
            <p className="text-base font-medium text-ink-900">{question.question}</p>
            <Button variant="ghost" size="sm" onClick={speakQuestion} aria-label="Ouvir pergunta">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {stage === "ready" && (
        <div className="space-y-2">
          <AudioRecorder onRecorded={handleRecorded} />
          <div className="flex flex-wrap justify-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={answerByTyping}>
              <Keyboard className="h-4 w-4" aria-hidden="true" />
              Prefiro responder digitando
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={nextQuestion}>
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              Trocar pergunta
            </Button>
          </div>
        </div>
      )}

      {stage === "transcribing" && <LoadingState label="Transcrevendo sua resposta…" />}

      {stage === "reviewing-transcript" && (
        <Card>
          <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="transcript">
            Sua resposta (revise ou complete a transcrição)
          </label>
          {notice && <p className="mb-2 text-sm text-brand-700">{notice}</p>}
          {errorMessage && <p role="alert" className="mb-2 text-sm text-amber-700">{errorMessage}</p>}
          <Textarea
            id="transcript"
            rows={6}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <p className="mt-1 text-xs text-ink-400">
            {transcript.trim() ? transcript.trim().split(/\s+/).length : 0} palavras · ideal entre 150 e 350
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" onClick={submitForFeedback}>
              Enviar para avaliação
            </Button>
            <Button type="button" variant="secondary" onClick={() => setStage("ready")}>
              <Mic className="h-4 w-4" aria-hidden="true" />
              Gravar novamente
            </Button>
          </div>
        </Card>
      )}

      {stage === "scoring" && <LoadingState label="Avaliando sua resposta…" />}

      {stage === "completed" && evaluation && (
        <div className="space-y-4">
          <InterviewAnalysisCard evaluation={evaluation} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={nextQuestion}>
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              Próxima pergunta
            </Button>
            <Button type="button" variant="secondary" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Mudar modo ou filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

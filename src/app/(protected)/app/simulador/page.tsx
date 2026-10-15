"use client";

import { useState } from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import { AudioRecorder } from "@/components/interview/AudioRecorder";
import { ScoreBreakdownCard } from "@/components/interview/ScoreBreakdown";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { apiFetch } from "@/lib/api/client";
import type { ScoreBreakdown } from "@/types/database";

type Stage =
  | "idle"
  | "loading-question"
  | "ready"
  | "recording-done"
  | "transcribing"
  | "reviewing-transcript"
  | "scoring"
  | "completed"
  | "error";

interface QuestionInfo {
  questionId: string;
  question: string;
  category: string;
}

export default function SimuladorPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<QuestionInfo | null>(null);
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  async function startSimulation() {
    setStage("loading-question");
    setErrorMessage(null);
    try {
      const res = await apiFetch("/api/interview/question", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSessionId(data.session.id);
      setQuestion(data.question);
      setTranscript("");
      setStage("ready");
    } catch {
      setErrorMessage("Não foi possível iniciar a simulação agora. Tente novamente em instantes.");
      setStage("error");
    }
  }

  function speakQuestion() {
    if (!question || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(question.question);
    utterance.lang = "pt-BR";
    window.speechSynthesis.speak(utterance);
  }

  async function handleRecorded(blob: Blob) {
    if (!sessionId) return;
    setStage("transcribing");
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("sessionId", sessionId);
      formData.append("audio", blob, "resposta.webm");

      const res = await apiFetch("/api/interview/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTranscript(data.session.transcript ?? "");
      setStage("reviewing-transcript");
    } catch {
      setErrorMessage(
        "Não foi possível transcrever o áudio. Você pode digitar sua resposta manualmente abaixo."
      );
      setStage("reviewing-transcript");
    }
  }

  async function submitForFeedback() {
    if (!sessionId || !question) return;
    setStage("scoring");
    setErrorMessage(null);
    try {
      const res = await apiFetch("/api/interview/feedback", {
        method: "POST",
        body: JSON.stringify({ sessionId, question: question.question, transcript }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setScore(data.session.score);
      setBreakdown(data.session.score_breakdown);
      setFeedback(data.session.feedback ?? "");
      setStage("completed");
    } catch {
      setErrorMessage("Não foi possível gerar o feedback agora. Tente novamente em instantes.");
      setStage("error");
    }
  }

  function reset() {
    setStage("idle");
    setSessionId(null);
    setQuestion(null);
    setTranscript("");
    setScore(null);
    setBreakdown(null);
    setFeedback("");
    setErrorMessage(null);
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
          <p className="text-sm text-ink-600">
            Você receberá uma pergunta do banco, poderá ouvi-la, responder em áudio e receber
            feedback sobre estrutura, clareza, objetividade e resultado.
          </p>
          <Button className="mt-4" onClick={startSimulation}>
            Iniciar simulação
          </Button>
        </Card>
      )}

      {stage === "loading-question" && <LoadingState label="Preparando sua pergunta…" />}

      {stage === "error" && (
        <ErrorState
          description={errorMessage ?? undefined}
          action={
            <Button size="sm" onClick={reset}>
              Tentar novamente
            </Button>
          }
        />
      )}

      {question && ["ready", "recording-done", "transcribing", "reviewing-transcript", "scoring"].includes(stage) && (
        <Card>
          <div className="flex items-start justify-between gap-3">
            <p className="text-base font-medium text-ink-900">{question.question}</p>
            <Button variant="ghost" size="sm" onClick={speakQuestion} aria-label="Ouvir pergunta">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {stage === "ready" && <AudioRecorder onRecorded={handleRecorded} />}

      {stage === "transcribing" && <LoadingState label="Transcrevendo sua resposta…" />}

      {stage === "reviewing-transcript" && (
        <Card>
          <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="transcript">
            Sua resposta (revise ou complete a transcrição)
          </label>
          {errorMessage && <p className="mb-2 text-sm text-amber-700">{errorMessage}</p>}
          <Textarea
            id="transcript"
            rows={6}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <Button className="mt-3" onClick={submitForFeedback}>
            Enviar para avaliação
          </Button>
        </Card>
      )}

      {stage === "scoring" && <LoadingState label="Avaliando sua resposta…" />}

      {stage === "completed" && score !== null && breakdown && (
        <div className="space-y-4">
          <ScoreBreakdownCard score={score} breakdown={breakdown} feedback={feedback} />
          <Button variant="secondary" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Nova simulação
          </Button>
        </div>
      )}
    </div>
  );
}

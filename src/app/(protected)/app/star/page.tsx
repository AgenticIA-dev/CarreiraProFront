import type { Metadata } from "next";
import { StarForm } from "@/components/star/StarForm";

export const metadata: Metadata = { title: "Método STAR" };

export default function StarPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink-900">Método STAR</h1>
      <p className="mt-1 text-sm text-ink-500">
        Organize uma experiência real em Situação, Tarefa, Ação e Resultado. Preencha apenas com
        fatos — se faltar alguma informação, deixe o campo em branco e nós avisaremos.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { letter: "S", label: "Situation", desc: "Contexto" },
          { letter: "T", label: "Task", desc: "Responsabilidade" },
          { letter: "A", label: "Action", desc: "O que você fez" },
          { letter: "R", label: "Result", desc: "Resultado" },
        ].map((s) => (
          <div key={s.letter} className="rounded-xl border border-ink-200 bg-white p-3 text-center">
            <p className="text-lg font-semibold text-brand-600">{s.letter}</p>
            <p className="text-xs font-medium text-ink-900">{s.label}</p>
            <p className="text-xs text-ink-500">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <StarForm />
      </div>
    </div>
  );
}

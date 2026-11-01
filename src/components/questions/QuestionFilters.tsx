"use client";

import { Briefcase, Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const categories = [
  { value: "", label: "Todas" },
  { value: "comportamental", label: "Comportamental" },
  { value: "star", label: "STAR" },
  { value: "tecnica", label: "Técnica" },
  { value: "situacional", label: "Situacional" },
  { value: "fit_cultural", label: "Fit cultural" },
  { value: "lideranca", label: "Liderança" },
];

export type QuestionMode = "entrevista" | "aumento_promocao";

const modes: { value: QuestionMode; label: string; desc: string; icon: typeof Briefcase }[] = [
  {
    value: "entrevista",
    label: "Entrevista de emprego",
    desc: "Perguntas de processo seletivo, por competência.",
    icon: Briefcase,
  },
  {
    value: "aumento_promocao",
    label: "Aumento e promoção",
    desc: "Para quem já está empregado e quer se preparar para a conversa.",
    icon: TrendingUp,
  },
];

const difficulties = [
  { value: "", label: "Todas" },
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediaria", label: "Intermediária" },
  { value: "avancada", label: "Avançada" },
];

export function QuestionFilters({
  mode,
  onModeChange,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  favoritesOnly,
  onFavoritesOnlyChange,
}: {
  mode: QuestionMode;
  onModeChange: (value: QuestionMode) => void;
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  difficulty: string;
  onDifficultyChange: (value: string) => void;
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2" role="tablist" aria-label="Tipo de preparação">
        {modes.map((m) => (
          <button
            key={m.value}
            type="button"
            role="tab"
            aria-selected={mode === m.value}
            onClick={() => onModeChange(m.value)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
              mode === m.value ? "border-brand-600 bg-brand-50" : "border-ink-200 bg-white hover:border-brand-300"
            )}
          >
            <m.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            <span>
              <span className="block text-sm font-semibold text-ink-900">{m.label}</span>
              <span className="block text-xs text-ink-500">{m.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por palavra-chave…"
          className="pl-9"
          aria-label="Buscar perguntas"
        />
      </div>

      {mode === "entrevista" && (
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1" aria-label="Competência">
          {categories.map((c) => (
            <FilterChip key={c.value} active={category === c.value} onClick={() => onCategoryChange(c.value)}>
              {c.label}
            </FilterChip>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {difficulties.map((d) => (
          <FilterChip key={d.value} active={difficulty === d.value} onClick={() => onDifficultyChange(d.value)}>
            {d.label}
          </FilterChip>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(e) => onFavoritesOnlyChange(e.target.checked)}
            className="h-4 w-4"
          />
          Só favoritas
        </label>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-ink-200 bg-white text-ink-600 hover:bg-ink-100"
      )}
    >
      {children}
    </button>
  );
}

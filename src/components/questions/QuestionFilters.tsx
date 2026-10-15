"use client";

import { Search } from "lucide-react";
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

const difficulties = [
  { value: "", label: "Todas" },
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediaria", label: "Intermediária" },
  { value: "avancada", label: "Avançada" },
];

export function QuestionFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  favoritesOnly,
  onFavoritesOnlyChange,
}: {
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

      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <FilterChip key={c.value} active={category === c.value} onClick={() => onCategoryChange(c.value)}>
            {c.label}
          </FilterChip>
        ))}
      </div>

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

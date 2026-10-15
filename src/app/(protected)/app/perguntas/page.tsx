"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { QuestionFilters } from "@/components/questions/QuestionFilters";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { ErrorState, EmptyState, Skeleton } from "@/components/ui/States";
import { apiFetch } from "@/lib/api/client";
import type { QuestionRow } from "@/types/database";

export default function PerguntasPage() {
  const [questions, setQuestions] = useState<QuestionRow[] | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(false);
      try {
        const res = await apiFetch("/api/questions");
        if (!res.ok) throw new Error("Falha ao carregar perguntas.");
        const data = await res.json();
        if (cancelled) return;
        setQuestions(data.questions);
        setFavoriteIds(new Set(data.favoriteIds));
      } catch {
        if (!cancelled) setError(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleFavorite(id: string) {
    const isFav = favoriteIds.has(id);
    const next = new Set(favoriteIds);
    isFav ? next.delete(id) : next.add(id);
    setFavoriteIds(next); // otimista

    try {
      const res = await apiFetch(`/api/questions/${id}/favorite`, {
        method: isFav ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error();
    } catch {
      // reverte em caso de falha
      const reverted = new Set(next);
      isFav ? reverted.add(id) : reverted.delete(id);
      setFavoriteIds(reverted);
    }
  }

  const filtered = useMemo(() => {
    if (!questions) return [];
    const term = search.trim().toLowerCase();
    return questions.filter((q) => {
      if (category && q.category !== category) return false;
      if (difficulty && q.difficulty !== difficulty) return false;
      if (favoritesOnly && !favoriteIds.has(q.id)) return false;
      if (term && !q.question.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [questions, search, category, difficulty, favoritesOnly, favoriteIds]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Banco de perguntas</h1>
        <p className="mt-1 text-sm text-ink-500">
          Explore perguntas por categoria e dificuldade, e veja o que os entrevistadores avaliam
          em cada uma.
        </p>
      </div>

      <QuestionFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        favoritesOnly={favoritesOnly}
        onFavoritesOnlyChange={setFavoritesOnly}
      />

      {error && (
        <ErrorState description="Não conseguimos carregar o banco de perguntas agora. Tente novamente em instantes." />
      )}

      {!error && questions === null && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {!error && questions !== null && filtered.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="Nenhuma pergunta encontrada"
          description="Tente ajustar os filtros ou o termo de busca."
        />
      )}

      {!error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              isFavorite={favoriteIds.has(q.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

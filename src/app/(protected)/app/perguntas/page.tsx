"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchX } from "lucide-react";
import { QuestionFilters, type QuestionMode } from "@/components/questions/QuestionFilters";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { ErrorState, EmptyState, Skeleton } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api/client";
import type { QuestionRow } from "@/types/database";

export default function PerguntasPage() {
  const [questions, setQuestions] = useState<QuestionRow[] | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [mock, setMock] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const router = useRouter();

  const [mode, setMode] = useState<QuestionMode>("entrevista");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      setQuestions(null);
      let res: Response;
      try {
        res = await apiFetch("/api/questions");
      } catch (err) {
        // Falha de rede/CORS/URL do backend: o navegador não recebeu resposta.
        console.error("[perguntas] Falha ao contatar o backend:", err);
        if (!cancelled) {
          setError(
            "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
          );
        }
        return;
      }
      if (cancelled) return;
      if (res.status === 401) {
        router.replace("/login?redirectTo=/app/perguntas");
        return;
      }
      if (!res.ok) {
        console.error("[perguntas] Backend respondeu", res.status);
        setError("Não conseguimos carregar o banco de perguntas agora. Tente novamente em instantes.");
        return;
      }
      const data = (await res.json().catch(() => null)) as {
        questions?: QuestionRow[];
        favoriteIds?: string[];
        mock?: boolean;
      } | null;
      if (cancelled) return;
      setQuestions(Array.isArray(data?.questions) ? data.questions : []);
      setFavoriteIds(new Set(Array.isArray(data?.favoriteIds) ? data.favoriteIds : []));
      setMock(Boolean(data?.mock));
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey, router]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

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
      const isCareer = q.category === "aumento_promocao";
      if (mode === "aumento_promocao" ? !isCareer : isCareer) return false;
      if (mode === "entrevista" && category && q.category !== category) return false;
      if (difficulty && q.difficulty !== difficulty) return false;
      if (favoritesOnly && !favoriteIds.has(q.id)) return false;
      if (term && !q.question.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [questions, mode, search, category, difficulty, favoritesOnly, favoriteIds]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Banco de perguntas</h1>
        <p className="mt-1 text-sm text-ink-500">
          {mode === "aumento_promocao"
            ? "Perguntas e objeções que gestores e RH fazem quando você pede aumento ou promoção — e como responder a cada uma."
            : "Explore perguntas de entrevista por competência e nível, e veja o que o entrevistador avalia em cada uma."}
        </p>
        {questions && (
          <p className="mt-1 text-xs text-ink-400">
            {filtered.length} {filtered.length === 1 ? "pergunta" : "perguntas"} neste filtro
          </p>
        )}
      </div>

      <QuestionFilters
        mode={mode}
        onModeChange={(m) => {
          setMode(m);
          setCategory("");
        }}
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
        <ErrorState
          description={error}
          action={
            <Button type="button" variant="secondary" size="sm" onClick={retry}>
              Tentar novamente
            </Button>
          }
        />
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
              onToggleFavorite={mock ? undefined : toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

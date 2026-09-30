"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchPostersAction,
  fetchSimilarTitlesAction,
  fetchTasteSuggestionsAction,
} from "@/app/actions/recs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PosterImage } from "@/components/poster-image";
import { becauseYouLovedRecommender, filterFavorites } from "@/lib/recs";
import { formatTasteRecommender } from "@/lib/similar-recs";
import type { RecType } from "@/lib/types";
import { EmptyState } from "./empty-state";
import { useRecs } from "./recs-provider";

type LiveSuggestion = {
  title: string;
  type: RecType;
  reason: string;
};

function SuggestionCard({
  suggestion,
  posterUrl,
  onAdd,
}: {
  suggestion: LiveSuggestion;
  posterUrl: string | null;
  onAdd: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4 p-4">
        <PosterImage src={posterUrl} title={suggestion.title} />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg font-medium tracking-tight text-foreground">
              {suggestion.title}
            </p>
            <Badge variant="secondary">
              {suggestion.type === "movie" ? "Movie" : "Show"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
          <Button onClick={() => void onAdd()}>Add to To watch</Button>
        </div>
      </div>
    </Card>
  );
}

export function PossibleFavesList() {
  const { recs, addRec } = useRecs();
  const favorites = useMemo(() => filterFavorites(recs), [recs]);
  const [groups, setGroups] = useState<
    { sourceTitle: string; suggestions: LiveSuggestion[] }[]
  >([]);
  const [tastePicks, setTastePicks] = useState<LiveSuggestion[]>([]);
  const [posters, setPosters] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLiveSuggestions() {
      setLoading(true);
      const loaded = await Promise.all(
        favorites.map(async (favorite) => {
          const suggestions = await fetchSimilarTitlesAction(
            favorite.title,
            favorite.type,
            recs,
          );
          return { sourceTitle: favorite.title, suggestions };
        }),
      );
      const shownTitles = loaded.flatMap((group) =>
        group.suggestions.map((item) => item.title),
      );
      const taste = await fetchTasteSuggestionsAction(
        favorites.map((favorite) => ({
          title: favorite.title,
          type: favorite.type,
        })),
        recs,
        shownTitles,
      );
      const visibleGroups = loaded.filter((group) => group.suggestions.length > 0);
      const allSuggestions = [
        ...taste,
        ...visibleGroups.flatMap((group) => group.suggestions),
      ];
      const posterMap = await fetchPostersAction(
        allSuggestions.map((item) => ({ title: item.title, type: item.type })),
      );
      setGroups(visibleGroups);
      setTastePicks(taste);
      setPosters(posterMap);
      setLoading(false);
    }

    void loadLiveSuggestions();
  }, [favorites, recs]);

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="Rate something 5 stars first"
        description="Then we'll suggest what to watch next."
      />
    );
  }

  if (loading) {
    return <p className="text-muted-foreground">Finding similar titles…</p>;
  }

  if (groups.length === 0 && tastePicks.length === 0) {
    return (
      <EmptyState
        title="No suggestions right now"
        description="We couldn't find similar titles yet. Try again later."
      />
    );
  }

  const tasteRecommender = formatTasteRecommender(
    favorites.map((favorite) => favorite.title),
  );

  return (
    <div className="space-y-10">
      {tastePicks.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-medium tracking-tight text-foreground">
            More like your faves
          </h2>
          <div className="grid gap-4">
            {tastePicks.map((suggestion) => (
              <SuggestionCard
                key={`taste-${suggestion.title}`}
                suggestion={suggestion}
                posterUrl={posters[suggestion.title.toLowerCase()] ?? null}
                onAdd={() =>
                  void addRec({
                    title: suggestion.title,
                    type: suggestion.type,
                    recommender_name: tasteRecommender,
                  })
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {groups.map((group) => (
        <section key={group.sourceTitle} className="space-y-4">
          <h2 className="text-lg font-medium tracking-tight text-foreground">
            Because you loved {group.sourceTitle}
          </h2>
          <div className="grid gap-4">
            {group.suggestions.map((suggestion) => (
              <SuggestionCard
                key={`${group.sourceTitle}-${suggestion.title}`}
                suggestion={suggestion}
                posterUrl={posters[suggestion.title.toLowerCase()] ?? null}
                onAdd={() =>
                  void addRec({
                    title: suggestion.title,
                    type: suggestion.type,
                    recommender_name: becauseYouLovedRecommender(
                      group.sourceTitle,
                    ),
                  })
                }
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

import type { Rating, Rec, RecInput, RecStatus, SimilarSuggestion, ValidationResult } from "./types";

export function validateRecInput(input: {
  title: string;
  recommender_name: string;
  type: RecInput["type"];
}): ValidationResult {
  const title = input.title.trim();
  const recommender_name = input.recommender_name.trim();
  const errors: { title?: string; recommender_name?: string } = {};

  if (!title) {
    errors.title = "Add a title.";
  }
  if (!recommender_name) {
    errors.recommender_name = "Who told you to watch this?";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { title, recommender_name, type: input.type },
  };
}

export function mergeRecs(seedRecs: Rec[], userRecs: Rec[]): Rec[] {
  const byId = new Map<string, Rec>();

  for (const rec of seedRecs) {
    byId.set(rec.id, { ...rec, is_seed: true });
  }

  for (const rec of userRecs) {
    byId.set(rec.id, { ...rec, is_seed: false });
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function filterByStatus(recs: Rec[], status: RecStatus): Rec[] {
  return recs.filter((rec) => rec.status === status);
}

export function filterFavorites(recs: Rec[]): Rec[] {
  return recs.filter((rec) => rec.status === "watched" && rec.rating === 5);
}

export function isFavorite(rec: Rec): boolean {
  return rec.status === "watched" && rec.rating === 5;
}

export function markWatched(rec: Rec, watchedAt = new Date().toISOString()): Rec {
  return {
    ...rec,
    status: "watched",
    watched_at: watchedAt,
  };
}

export function setRating(rec: Rec, rating: Rating): Rec {
  return {
    ...rec,
    rating,
    status: "watched",
    watched_at: rec.watched_at ?? new Date().toISOString(),
  };
}

export function createRec(input: RecInput & { id?: string; user_id?: string }): Rec {
  return {
    id: input.id ?? crypto.randomUUID(),
    title: input.title.trim(),
    type: input.type,
    recommender_name: input.recommender_name.trim(),
    status: "to_watch",
    rating: null,
    created_at: new Date().toISOString(),
    watched_at: null,
    watch_providers: [],
    poster_url: null,
    user_id: input.user_id,
    is_seed: false,
  };
}

export function getExistingTitles(recs: Rec[]): Set<string> {
  return new Set(recs.map((rec) => rec.title.toLowerCase()));
}

export function getFiveStarTitles(recs: Rec[]): string[] {
  return filterFavorites(recs).map((rec) => rec.title);
}

export function getSimilarSuggestions(
  recs: Rec[],
  similarSeed: SimilarSuggestion[],
): { sourceTitle: string; suggestions: SimilarSuggestion[] }[] {
  const fiveStarTitles = new Set(getFiveStarTitles(recs));
  const existingTitles = getExistingTitles(recs);

  const grouped = new Map<string, SimilarSuggestion[]>();

  for (const item of similarSeed) {
    if (!fiveStarTitles.has(item.source_title)) {
      continue;
    }
    if (existingTitles.has(item.title.toLowerCase())) {
      continue;
    }

    const list = grouped.get(item.source_title) ?? [];
    list.push(item);
    grouped.set(item.source_title, list);
  }

  return Array.from(grouped.entries()).map(([sourceTitle, suggestions]) => ({
    sourceTitle,
    suggestions,
  }));
}

export function formatRecommenderLabel(name: string): string {
  return `${name} recommended this`;
}

export function becauseYouLovedRecommender(sourceTitle: string): string {
  return `Because you loved ${sourceTitle}`;
}

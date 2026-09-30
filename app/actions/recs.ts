"use server";

import { getSessionUser } from "@/lib/auth";
import { getUserRecs, hasDatabase, upsertUserRec } from "@/lib/db";
import { getTasteSuggestions, getSimilarSuggestionsForSource } from "@/lib/similar-recs";
import { getSimilarSeed } from "@/lib/seed";
import { lookupPosterUrl, lookupTitleCatalog, lookupWatchProviders } from "@/lib/tmdb";
import type { Rec, RecType } from "@/lib/types";

export async function syncRecAction(rec: Rec): Promise<void> {
  if (!hasDatabase()) {
    return;
  }

  const user = await getSessionUser();
  if (!user) {
    return;
  }

  await upsertUserRec(user.id, { ...rec, user_id: user.id, is_seed: false });
}

export async function loadUserRecsAction(): Promise<Rec[]> {
  if (!hasDatabase()) {
    return [];
  }

  const user = await getSessionUser();
  if (!user) {
    return [];
  }

  return getUserRecs(user.id);
}

export async function fetchWatchProvidersAction(
  title: string,
  type: RecType,
): Promise<string[]> {
  const providers = await lookupWatchProviders(title, type);
  return providers;
}

export async function fetchTitleCatalogAction(
  title: string,
  type: RecType,
): Promise<{ poster_url: string | null; watch_providers: string[] }> {
  return lookupTitleCatalog(title, type);
}

export async function fetchPosterAction(
  title: string,
  type: RecType,
): Promise<string | null> {
  return lookupPosterUrl(title, type);
}

export async function fetchPostersAction(
  titles: Array<{ title: string; type: RecType }>,
): Promise<Record<string, string | null>> {
  const entries = await Promise.all(
    titles.map(async (item) => {
      const poster = await lookupPosterUrl(item.title, item.type);
      return [item.title.toLowerCase(), poster] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export async function fetchSimilarTitlesAction(
  title: string,
  type: RecType,
  recs: Rec[],
): Promise<Array<{ title: string; type: RecType; reason: string }>> {
  return getSimilarSuggestionsForSource(title, type, recs, getSimilarSeed());
}

export async function fetchTasteSuggestionsAction(
  sources: Array<{ title: string; type: RecType }>,
  recs: Rec[],
  extraExclude: string[] = [],
): Promise<Array<{ title: string; type: RecType; reason: string }>> {
  return getTasteSuggestions(sources, recs, extraExclude);
}

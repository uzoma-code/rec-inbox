import { fetchSimilarPicksForTaste, fetchSimilarPicksFromOpenAI } from "./openai";
import { getExistingTitles } from "./recs";
import type { Rec, RecType, SimilarSuggestion } from "./types";

export type SimilarPick = {
  title: string;
  type: RecType;
  reason: string;
};

export function filterAlreadyQueued(
  suggestions: SimilarPick[],
  recs: Rec[],
  extraTitles: string[] = [],
): SimilarPick[] {
  const existingTitles = getExistingTitles(recs);
  for (const title of extraTitles) {
    existingTitles.add(title.toLowerCase());
  }
  return suggestions.filter(
    (item) => !existingTitles.has(item.title.toLowerCase()),
  );
}

export function getSeedSuggestionsForSource(
  sourceTitle: string,
  seed: SimilarSuggestion[],
): SimilarPick[] {
  return seed
    .filter((item) => item.source_title === sourceTitle)
    .map((item) => ({
      title: item.title,
      type: item.type,
      reason: item.reason ?? `Similar to ${sourceTitle}.`,
    }));
}

export async function getSimilarSuggestionsForSource(
  sourceTitle: string,
  sourceType: RecType,
  recs: Rec[],
  seed: SimilarSuggestion[],
): Promise<SimilarPick[]> {
  const aiSuggestions = await fetchSimilarPicksFromOpenAI(sourceTitle, sourceType);
  const primary =
    aiSuggestions.length > 0
      ? aiSuggestions
      : getSeedSuggestionsForSource(sourceTitle, seed);

  return filterAlreadyQueued(primary, recs);
}

export function formatTasteRecommender(titles: string[]): string {
  if (titles.length === 0) {
    return "Because you loved your faves";
  }
  if (titles.length === 1) {
    return `Because you loved ${titles[0]}`;
  }
  if (titles.length === 2) {
    return `Because you loved ${titles[0]} and ${titles[1]}`;
  }
  return `Because you loved ${titles[0]} and ${titles.length - 1} more`;
}

export async function getTasteSuggestions(
  sources: Array<{ title: string; type: RecType }>,
  recs: Rec[],
  extraExclude: string[] = [],
): Promise<SimilarPick[]> {
  const sourceTitles = sources.map((source) => source.title);
  const aiSuggestions = await fetchSimilarPicksForTaste(sources);
  return filterAlreadyQueued(aiSuggestions, recs, [
    ...extraExclude,
    ...sourceTitles,
  ]);
}

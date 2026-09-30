import seedRecs from "@/data/recs.json";
import similarSeed from "@/data/similar.json";
import type { Rec, SimilarSuggestion } from "./types";

export function getSeedRecs(): Rec[] {
  return (seedRecs as Rec[]).map((rec) => ({ ...rec, is_seed: true }));
}

export function getSimilarSeed(): SimilarSuggestion[] {
  return similarSeed as SimilarSuggestion[];
}

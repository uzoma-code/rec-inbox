import { describe, expect, it } from "vitest";
import {
  createRec,
  filterByStatus,
  filterFavorites,
  becauseYouLovedRecommender,
  formatRecommenderLabel,
  getExistingTitles,
  getFiveStarTitles,
  getSimilarSuggestions,
  isFavorite,
  markWatched,
  mergeRecs,
  setRating,
  validateRecInput,
} from "./recs";
import type { Rec } from "./types";

const seedRec: Rec = {
  id: "seed-1",
  title: "Slow Horses",
  type: "show",
  recommender_name: "Jake",
  status: "to_watch",
  rating: null,
  created_at: "2026-09-20T12:00:00Z",
  is_seed: true,
};

describe("validateRecInput", () => {
  it("rejects blank title or recommender", () => {
    const result = validateRecInput({
      title: "",
      recommender_name: "",
      type: "movie",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBeTruthy();
      expect(result.errors.recommender_name).toBeTruthy();
    }
  });

  it("accepts valid input", () => {
    const result = validateRecInput({
      title: "Past Lives",
      recommender_name: "Sarah",
      type: "movie",
    });
    expect(result).toEqual({
      ok: true,
      value: {
        title: "Past Lives",
        recommender_name: "Sarah",
        type: "movie",
      },
    });
  });
});

describe("mergeRecs", () => {
  it("merges seed and user recs with user overriding seed ids", () => {
    const userRec = createRec({
      id: "user-1",
      title: "New Title",
      recommender_name: "Priya",
      type: "movie",
    });
    const override = markWatched({ ...seedRec, id: "seed-1" });
    const merged = mergeRecs([seedRec], [userRec, override]);
    expect(merged).toHaveLength(2);
    expect(merged.find((rec) => rec.id === "seed-1")?.status).toBe("watched");
    expect(merged.find((rec) => rec.id === "user-1")?.title).toBe("New Title");
  });
});

describe("favorites", () => {
  it("only includes watched 5-star recs", () => {
    const recs: Rec[] = [
      { ...seedRec, status: "watched", rating: 5 },
      { ...seedRec, id: "seed-2", status: "watched", rating: 4 },
      { ...seedRec, id: "seed-3", status: "to_watch", rating: null },
    ];
    expect(filterFavorites(recs)).toHaveLength(1);
    expect(isFavorite(recs[0])).toBe(true);
    expect(isFavorite(recs[1])).toBe(false);
  });
});

describe("status filters", () => {
  it("filters to watch and watched lists", () => {
    const recs: Rec[] = [
      seedRec,
      { ...seedRec, id: "seed-2", status: "watched", rating: 3 },
    ];
    expect(filterByStatus(recs, "to_watch")).toHaveLength(1);
    expect(filterByStatus(recs, "watched")).toHaveLength(1);
  });
});

describe("markWatched and setRating", () => {
  it("marks watched and stores ratings", () => {
    const watched = markWatched(seedRec);
    expect(watched.status).toBe("watched");
    expect(watched.watched_at).toBeTruthy();

    const rated = setRating(watched, 5);
    expect(rated.rating).toBe(5);
    expect(rated.status).toBe("watched");
  });
});

describe("labels and title helpers", () => {
  it("formats recommender labels and because-you-loved copy", () => {
    expect(formatRecommenderLabel("Jake")).toBe("Jake recommended this");
    expect(becauseYouLovedRecommender("The Bear")).toBe("Because you loved The Bear");
  });

  it("collects existing and five-star titles", () => {
    const recs: Rec[] = [
      { ...seedRec, title: "The Bear", status: "watched", rating: 5 },
      { ...seedRec, id: "seed-2", title: "Past Lives", status: "to_watch", rating: null },
    ];
    expect(getExistingTitles(recs).has("past lives")).toBe(true);
    expect(getFiveStarTitles(recs)).toEqual(["The Bear"]);
  });
});

describe("getSimilarSuggestions", () => {
  it("only uses 5-star titles and hides existing titles", () => {
    const recs: Rec[] = [
      {
        ...seedRec,
        id: "fav-1",
        title: "The Bear",
        status: "watched",
        rating: 5,
      },
      {
        ...seedRec,
        id: "fav-2",
        title: "Succession",
        status: "watched",
        rating: 4,
      },
      {
        ...seedRec,
        id: "queue-1",
        title: "The Menu",
        status: "to_watch",
        rating: null,
      },
    ];

    const groups = getSimilarSuggestions(recs, [
      { source_title: "The Bear", title: "The Menu", type: "movie" },
      { source_title: "The Bear", title: "Industry", type: "show" },
      { source_title: "Succession", title: "Billions", type: "show" },
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].sourceTitle).toBe("The Bear");
    expect(groups[0].suggestions.map((item) => item.title)).toEqual(["Industry"]);
  });
});

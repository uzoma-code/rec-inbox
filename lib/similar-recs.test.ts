import { describe, expect, it, vi } from "vitest";
import { parseSimilarPicks } from "./openai";
import {
  filterAlreadyQueued,
  formatTasteRecommender,
  getSeedSuggestionsForSource,
  getSimilarSuggestionsForSource,
  getTasteSuggestions,
} from "./similar-recs";
import type { Rec } from "./types";

const baseRec: Rec = {
  id: "1",
  title: "The Bear",
  type: "show",
  recommender_name: "Jake",
  status: "watched",
  rating: 5,
  created_at: "2026-09-01T12:00:00Z",
};

describe("parseSimilarPicks", () => {
  it("parses valid JSON", () => {
    const result = parseSimilarPicks(
      JSON.stringify({
        suggestions: [
          {
            title: "The Menu",
            type: "movie",
            reason: "High-pressure kitchens and sharp tension.",
          },
        ],
      }),
    );
    expect(result).toEqual([
      {
        title: "The Menu",
        type: "movie",
        reason: "High-pressure kitchens and sharp tension.",
      },
    ]);
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseSimilarPicks("not json")).toEqual([]);
  });
});

describe("filterAlreadyQueued", () => {
  it("hides titles already on the list", () => {
    const recs: Rec[] = [
      { ...baseRec, title: "The Menu", status: "to_watch", rating: null },
    ];
    const filtered = filterAlreadyQueued(
      [{ title: "The Menu", type: "movie", reason: "Kitchen drama." }],
      recs,
    );
    expect(filtered).toEqual([]);
  });

  it("hides extra excluded titles", () => {
    const filtered = filterAlreadyQueued(
      [{ title: "Industry", type: "show", reason: "Workplace tension." }],
      [],
      ["Industry"],
    );
    expect(filtered).toEqual([]);
  });
});

describe("formatTasteRecommender", () => {
  it("names one, two, or more source titles", () => {
    expect(formatTasteRecommender([])).toBe("Because you loved your faves");
    expect(formatTasteRecommender(["The Bear"])).toBe(
      "Because you loved The Bear",
    );
    expect(formatTasteRecommender(["The Bear", "Succession"])).toBe(
      "Because you loved The Bear and Succession",
    );
    expect(formatTasteRecommender(["The Bear", "Succession", "Past Lives"])).toBe(
      "Because you loved The Bear and 2 more",
    );
  });
});

describe("getSeedSuggestionsForSource", () => {
  it("returns seed rows for a source title", () => {
    const suggestions = getSeedSuggestionsForSource("The Bear", [
      { source_title: "The Bear", title: "Industry", type: "show" },
    ]);
    expect(suggestions).toEqual([
      {
        title: "Industry",
        type: "show",
        reason: "Similar to The Bear.",
      },
    ]);
  });
});

describe("getSimilarSuggestionsForSource", () => {
  it("uses AI suggestions when available", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  suggestions: [
                    {
                      title: "Chef's Table",
                      type: "show",
                      reason: "Food and ambition.",
                    },
                  ],
                }),
              },
            },
          ],
        }),
      }),
    );

    const suggestions = await getSimilarSuggestionsForSource(
      "The Bear",
      "show",
      [],
      [],
    );

    expect(suggestions).toEqual([
      {
        title: "Chef's Table",
        type: "show",
        reason: "Food and ambition.",
      },
    ]);

    vi.restoreAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  it("falls back to seed when OpenAI is unavailable", async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const suggestions = await getSimilarSuggestionsForSource(
      "The Bear",
      "show",
      [],
      [{ source_title: "The Bear", title: "Industry", type: "show" }],
    );

    expect(suggestions).toEqual([
      {
        title: "Industry",
        type: "show",
        reason: "Similar to The Bear.",
      },
    ]);

    if (originalKey) {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });
});

describe("getTasteSuggestions", () => {
  it("returns empty when OpenAI is unavailable", async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const suggestions = await getTasteSuggestions(
      [{ title: "The Bear", type: "show" }],
      [],
    );
    expect(suggestions).toEqual([]);

    if (originalKey) {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });

  it("hides source titles from taste picks", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  suggestions: [
                    { title: "The Bear", type: "show", reason: "Same show." },
                    { title: "Severance", type: "show", reason: "Work tension." },
                  ],
                }),
              },
            },
          ],
        }),
      }),
    );

    const suggestions = await getTasteSuggestions(
      [{ title: "The Bear", type: "show" }],
      [],
    );
    expect(suggestions.map((item) => item.title)).toEqual(["Severance"]);

    vi.restoreAllMocks();
    delete process.env.OPENAI_API_KEY;
  });
});

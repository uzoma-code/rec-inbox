import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchSimilarPicksForTaste,
  fetchSimilarPicksFromOpenAI,
  formatTastePrompt,
  parseSimilarPicks,
} from "./openai";

describe("parseSimilarPicks", () => {
  it("defaults missing reason and movie type", () => {
    expect(
      parseSimilarPicks(
        JSON.stringify({
          suggestions: [{ title: "Aftersun", type: "movie" }],
        }),
      ),
    ).toEqual([
      {
        title: "Aftersun",
        type: "movie",
        reason: "Similar to Aftersun.",
      },
    ]);
  });

  it("skips blank titles", () => {
    expect(
      parseSimilarPicks(
        JSON.stringify({
          suggestions: [{ title: "  ", type: "show" }],
        }),
      ),
    ).toEqual([]);
  });
});

describe("fetchSimilarPicksFromOpenAI", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty array when API key is missing", async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    await expect(
      fetchSimilarPicksFromOpenAI("Past Lives", "movie"),
    ).resolves.toEqual([]);

    if (originalKey) {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });

  it("returns parsed suggestions when OpenAI responds", async () => {
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
                      title: "Minari",
                      type: "movie",
                      reason: "Family and identity.",
                    },
                  ],
                }),
              },
            },
          ],
        }),
      }),
    );

    await expect(
      fetchSimilarPicksFromOpenAI("Past Lives", "movie"),
    ).resolves.toEqual([
      {
        title: "Minari",
        type: "movie",
        reason: "Family and identity.",
      },
    ]);
  });

  it("returns empty array when OpenAI responds with an error", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    await expect(
      fetchSimilarPicksFromOpenAI("Past Lives", "movie"),
    ).resolves.toEqual([]);
  });
});

describe("formatTastePrompt", () => {
  it("lists the 5-star titles from New Faves", () => {
    expect(
      formatTastePrompt([
        { title: "The Bear", type: "show" },
        { title: "Past Lives", type: "movie" },
      ]),
    ).toContain("The Bear (show)");
  });
});

describe("fetchSimilarPicksForTaste", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty array when there are no source titles", async () => {
    await expect(fetchSimilarPicksForTaste([])).resolves.toEqual([]);
  });

  it("returns parsed taste suggestions when OpenAI responds", async () => {
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
                      title: "Aftersun",
                      type: "movie",
                      reason: "Quiet and emotional.",
                    },
                  ],
                }),
              },
            },
          ],
        }),
      }),
    );

    await expect(
      fetchSimilarPicksForTaste([{ title: "Past Lives", type: "movie" }]),
    ).resolves.toEqual([
      {
        title: "Aftersun",
        type: "movie",
        reason: "Quiet and emotional.",
      },
    ]);
  });
});

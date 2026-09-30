import { describe, expect, it } from "vitest";
import {
  lookupPosterUrl,
  lookupSimilarTitles,
  lookupTitleCatalog,
  lookupWatchProviders,
  posterUrlFromPath,
} from "./tmdb";

describe("posterUrlFromPath", () => {
  it("builds a TMDB image URL", () => {
    expect(posterUrlFromPath("/abc.jpg")).toBe(
      "https://image.tmdb.org/t/p/w342/abc.jpg",
    );
  });

  it("returns null when the path is missing", () => {
    expect(posterUrlFromPath(null)).toBeNull();
    expect(posterUrlFromPath(undefined)).toBeNull();
  });
});

describe("tmdb lookups", () => {
  it("returns empty catalog when no API key is set", async () => {
    const original = process.env.TMDB_API_KEY;
    delete process.env.TMDB_API_KEY;

    await expect(lookupWatchProviders("Past Lives", "movie")).resolves.toEqual([]);
    await expect(lookupSimilarTitles("The Bear", "show")).resolves.toEqual([]);
    await expect(lookupPosterUrl("Past Lives", "movie")).resolves.toBeNull();
    await expect(lookupTitleCatalog("Past Lives", "movie")).resolves.toEqual({
      poster_url: null,
      watch_providers: [],
    });

    process.env.TMDB_API_KEY = original;
  });
});

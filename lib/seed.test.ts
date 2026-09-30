import { describe, expect, it } from "vitest";
import { getSeedRecs, getSimilarSeed } from "./seed";

describe("seed", () => {
  it("loads seeded recs and similar suggestions", () => {
    const recs = getSeedRecs();
    const similar = getSimilarSeed();

    expect(recs.length).toBeGreaterThan(0);
    expect(similar.length).toBeGreaterThan(0);
    expect(recs[0].is_seed).toBe(true);
  });
});

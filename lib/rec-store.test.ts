import { beforeEach, describe, expect, it } from "vitest";
import { getStorageKey, loadUserRecs, saveUserRecs } from "./rec-store";
import type { Rec } from "./types";

const userId = "user-123";
const sampleRec: Rec = {
  id: "rec-1",
  title: "Past Lives",
  type: "movie",
  recommender_name: "Sarah",
  status: "to_watch",
  rating: null,
  created_at: "2026-09-20T12:00:00Z",
};

describe("rec-store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns an empty list when nothing is stored", () => {
    expect(loadUserRecs(userId)).toEqual([]);
  });

  it("saves and reloads user recs", () => {
    saveUserRecs(userId, [sampleRec]);
    expect(loadUserRecs(userId)).toEqual([sampleRec]);
  });

  it("uses a per-user storage key", () => {
    expect(getStorageKey(userId)).toBe("rec-inbox-recs:user-123");
  });

  it("returns an empty list for invalid stored JSON", () => {
    window.localStorage.setItem(getStorageKey(userId), "{not-json");
    expect(loadUserRecs(userId)).toEqual([]);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSession,
  loadSession,
  loadUsers,
  saveSession,
  saveUsers,
} from "./users-store";

describe("users-store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and loads the session", () => {
    saveSession({ id: "user-1", email: "maya@example.com" });
    expect(loadSession()).toEqual({ id: "user-1", email: "maya@example.com" });
    clearSession();
    expect(loadSession()).toBeNull();
  });

  it("saves and loads registered users", () => {
    saveUsers([{ id: "user-1", email: "maya@example.com", password_hash: "hash" }]);
    expect(loadUsers()).toHaveLength(1);
  });

  it("returns null or empty lists for invalid stored JSON", () => {
    window.localStorage.setItem("rec-inbox-session", "{bad");
    window.localStorage.setItem("rec-inbox-users", "[bad");
    expect(loadSession()).toBeNull();
    expect(loadUsers()).toEqual([]);
  });

  it("returns null when stored session is missing fields", () => {
    window.localStorage.setItem("rec-inbox-session", JSON.stringify({ id: "only-id" }));
    expect(loadSession()).toBeNull();
  });
});

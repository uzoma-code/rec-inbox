import { describe, expect, it } from "vitest";
import { formatRecMeta, formatTimeAgo } from "./format-time";

describe("formatTimeAgo", () => {
  const now = new Date("2026-09-29T12:00:00Z");

  it("returns just now for very recent dates", () => {
    expect(formatTimeAgo("2026-09-29T11:59:30Z", now)).toBe("just now");
  });

  it("returns days ago for older dates", () => {
    expect(formatTimeAgo("2026-09-26T12:00:00Z", now)).toBe("3 days ago");
  });

  it("returns months ago for long waits", () => {
    expect(formatTimeAgo("2026-07-29T12:00:00Z", now)).toBe("2 months ago");
  });

  it("returns hours and minutes for mid-range waits", () => {
    expect(formatTimeAgo("2026-09-29T10:00:00Z", now)).toBe("2 hours ago");
    expect(formatTimeAgo("2026-09-29T11:30:00Z", now)).toBe("30 minutes ago");
  });

  it("returns years ago for very old dates", () => {
    expect(formatTimeAgo("2024-09-29T12:00:00Z", now)).toBe("2 years ago");
  });

  it("handles invalid dates safely", () => {
    expect(formatTimeAgo("not-a-date", now)).toBe("just now");
  });
});

describe("formatRecMeta", () => {
  it("joins recommender, told-you copy, and time ago", () => {
    const now = new Date("2026-09-29T12:00:00Z");
    expect(formatRecMeta("Jake", "2026-09-26T12:00:00Z", now)).toBe(
      "Jake told you to watch this · 3 days ago",
    );
  });
});

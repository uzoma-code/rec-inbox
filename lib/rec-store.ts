import type { Rec } from "./types";

const STORAGE_PREFIX = "rec-inbox-recs";

export function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function loadUserRecs(userId: string): Rec[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(getStorageKey(userId));
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Rec[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserRecs(userId: string, recs: Rec[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(recs));
}

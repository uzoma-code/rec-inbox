import type { SessionUser } from "./types";

const USERS_KEY = "rec-inbox-users";
const SESSION_KEY = "rec-inbox-session";

type StoredUser = SessionUser & {
  password_hash: string;
};

export function loadSession(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SessionUser;
    if (parsed?.id && parsed?.email) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSession(user: SessionUser): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(SESSION_KEY);
}

export function loadUsers(): StoredUser[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: StoredUser[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

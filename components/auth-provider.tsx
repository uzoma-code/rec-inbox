"use client";

import bcrypt from "bcryptjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCurrentUserAction,
  signInAction,
  signInWithSessionAction,
  signOutAction,
  signUpAction,
} from "@/app/actions/auth";
import { clearSession, loadSession, loadUsers, saveSession, saveUsers } from "@/lib/users-store";
import type { SessionUser } from "@/lib/types";

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  hasDatabase: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  hasDatabase,
}: {
  children: React.ReactNode;
  hasDatabase: boolean;
}) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      const serverUser = await getCurrentUserAction();
      if (serverUser) {
        setUser(serverUser);
        saveSession(serverUser);
        setLoading(false);
        return;
      }

      const localUser = loadSession();
      setUser(localUser);
      setLoading(false);
    }

    void hydrate();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) {
        return "Email and password are required.";
      }

      if (hasDatabase) {
        const result = await signInAction(normalizedEmail, password);
        if (!result.ok) {
          return result.error;
        }
        setUser(result.user);
        saveSession(result.user);
        return null;
      }

      const users = loadUsers();
      const existing = users.find((item) => item.email === normalizedEmail);
      if (!existing) {
        return "Invalid email or password.";
      }

      const valid = await bcrypt.compare(password, existing.password_hash);
      if (!valid) {
        return "Invalid email or password.";
      }

      const sessionUser = { id: existing.id, email: existing.email };
      await signInWithSessionAction(sessionUser);
      setUser(sessionUser);
      saveSession(sessionUser);
      return null;
    },
    [hasDatabase],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) {
        return "Email and password are required.";
      }
      if (password.length < 6) {
        return "Password must be at least 6 characters.";
      }

      if (hasDatabase) {
        const result = await signUpAction(normalizedEmail, password);
        if (!result.ok) {
          return result.error;
        }
        setUser(result.user);
        saveSession(result.user);
        return null;
      }

      const users = loadUsers();
      if (users.some((item) => item.email === normalizedEmail)) {
        return "An account with this email already exists.";
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const sessionUser = { id: crypto.randomUUID(), email: normalizedEmail };
      saveUsers([...users, { ...sessionUser, password_hash: passwordHash }]);
      await signInWithSessionAction(sessionUser);
      setUser(sessionUser);
      saveSession(sessionUser);
      return null;
    },
    [hasDatabase],
  );

  const signOut = useCallback(async () => {
    await signOutAction();
    clearSession();
    setUser(null);
    window.location.href = "/sign-in";
  }, []);

  const value = useMemo(
    () => ({ user, loading, hasDatabase, signIn, signUp, signOut }),
    [user, loading, hasDatabase, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

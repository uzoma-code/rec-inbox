"use server";

import bcrypt from "bcryptjs";
import { clearSessionCookie, getSessionUser, setSessionCookie } from "@/lib/auth";
import { createUser, findUserByEmail, hasDatabase } from "@/lib/db";

export type AuthResult =
  | { ok: true; user: { id: string; email: string } }
  | { ok: false; error: string };

export async function signUpAction(
  email: string,
  password: string,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { ok: false, error: "Email and password are required." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  if (!hasDatabase()) {
    return { ok: false, error: "Database is not configured for sign-up." };
  }

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(id, normalizedEmail, passwordHash);
  await setSessionCookie(user);
  return { ok: true, user };
}

export async function signInAction(
  email: string,
  password: string,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  if (!hasDatabase()) {
    return { ok: false, error: "Database is not configured for sign-in." };
  }

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    return { ok: false, error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { ok: false, error: "Invalid email or password." };
  }

  const sessionUser = { id: user.id, email: user.email };
  await setSessionCookie(sessionUser);
  return { ok: true, user: sessionUser };
}

export async function signInWithSessionAction(
  user: { id: string; email: string },
): Promise<AuthResult> {
  await setSessionCookie(user);
  return { ok: true, user };
}

export async function signOutAction(): Promise<void> {
  await clearSessionCookie();
}

export async function getCurrentUserAction(): Promise<{
  id: string;
  email: string;
} | null> {
  const user = await getSessionUser();
  return user;
}

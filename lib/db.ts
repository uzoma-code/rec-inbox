import { neon } from "@neondatabase/serverless";
import type { Rec, SessionUser } from "./types";

function getDatabaseUrl(): string | null {
  return process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? null;
}

export function hasDatabase(): boolean {
  return Boolean(getDatabaseUrl());
}

function getSql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("Database not configured");
  }
  return neon(url);
}

let schemaReady = false;

export async function ensureSchema(): Promise<void> {
  if (!hasDatabase() || schemaReady) {
    return;
  }

  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS recs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      recommender_name TEXT NOT NULL,
      status TEXT NOT NULL,
      rating INTEGER,
      created_at TIMESTAMPTZ NOT NULL,
      watched_at TIMESTAMPTZ,
      watch_providers JSONB DEFAULT '[]'::jsonb,
      watch_providers_updated_at TIMESTAMPTZ,
      poster_url TEXT
    )
  `;
  await sql`
    ALTER TABLE recs ADD COLUMN IF NOT EXISTS poster_url TEXT
  `;
  schemaReady = true;
}

export async function createUser(
  id: string,
  email: string,
  passwordHash: string,
): Promise<SessionUser> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    INSERT INTO users (id, email, password_hash)
    VALUES (${id}, ${email}, ${passwordHash})
  `;
  return { id, email };
}

export async function findUserByEmail(
  email: string,
): Promise<{ id: string; email: string; password_hash: string } | null> {
  if (!hasDatabase()) {
    return null;
  }
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, password_hash
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  const row = rows[0] as
    | { id: string; email: string; password_hash: string }
    | undefined;
  return row ?? null;
}

export async function getUserRecs(userId: string): Promise<Rec[]> {
  if (!hasDatabase()) {
    return [];
  }
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, title, type, recommender_name, status, rating, created_at, watched_at, watch_providers, poster_url
    FROM recs
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return rows.map((row) => mapDbRec(row));
}

export async function upsertUserRec(userId: string, rec: Rec): Promise<void> {
  if (!hasDatabase()) {
    return;
  }
  await ensureSchema();
  const sql = getSql();
  await sql`
    INSERT INTO recs (
      id, user_id, title, type, recommender_name, status, rating, created_at, watched_at, watch_providers, poster_url
    ) VALUES (
      ${rec.id},
      ${userId},
      ${rec.title},
      ${rec.type},
      ${rec.recommender_name},
      ${rec.status},
      ${rec.rating},
      ${rec.created_at},
      ${rec.watched_at ?? null},
      ${JSON.stringify(rec.watch_providers ?? [])},
      ${rec.poster_url ?? null}
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      type = EXCLUDED.type,
      recommender_name = EXCLUDED.recommender_name,
      status = EXCLUDED.status,
      rating = EXCLUDED.rating,
      watched_at = EXCLUDED.watched_at,
      watch_providers = EXCLUDED.watch_providers,
      poster_url = EXCLUDED.poster_url
  `;
}

function mapDbRec(row: Record<string, unknown>): Rec {
  const providers = row.watch_providers;
  return {
    id: String(row.id),
    title: String(row.title),
    type: row.type as Rec["type"],
    recommender_name: String(row.recommender_name),
    status: row.status as Rec["status"],
    rating: row.rating === null ? null : Number(row.rating) as Rec["rating"],
    created_at: new Date(String(row.created_at)).toISOString(),
    watched_at: row.watched_at
      ? new Date(String(row.watched_at)).toISOString()
      : null,
    watch_providers: Array.isArray(providers)
      ? providers.map(String)
      : [],
    poster_url: row.poster_url ? String(row.poster_url) : null,
    user_id: String(row.user_id ?? ""),
    is_seed: false,
  };
}

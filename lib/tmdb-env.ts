export function parseEnvFileValue(
  contents: string,
  name: string,
): string | undefined {
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    if (trimmed.slice(0, eq).trim() !== name) {
      continue;
    }
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    return value || undefined;
  }
  return undefined;
}

export function isTmdbBearerToken(apiKey: string): boolean {
  return apiKey.startsWith("eyJ");
}

export function resolveTmdbApiKey(
  override?: string | null,
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  for (const value of [override, env.TMDB_API_KEY]) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return undefined;
}

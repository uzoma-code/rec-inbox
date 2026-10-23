import { readFileSync } from "node:fs";
import { setDefaultResultOrder } from "node:dns";
import { join } from "node:path";
import {
  isTmdbBearerToken,
  parseEnvFileValue,
  resolveTmdbApiKey,
} from "./tmdb-env";
import type { RecType } from "./types";

setDefaultResultOrder("ipv4first");

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

type TmdbSearchResult = {
  results?: Array<{
    id: number;
    media_type?: string;
    poster_path?: string | null;
  }>;
};

type TmdbProvidersResult = {
  results?: Record<
    string,
    { flatrate?: Array<{ provider_name: string }> }
  >;
};

type TmdbSimilarResult = {
  results?: Array<{ title?: string; name?: string; poster_path?: string | null }>;
};

function readTmdbKeyFromDotenv(): string | undefined {
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
    return undefined;
  }

  try {
    const local = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    const fromLocal = parseEnvFileValue(local, "TMDB_API_KEY");
    if (fromLocal) {
      return fromLocal;
    }
  } catch {
    // Optional local override.
  }

  try {
    const envFile = readFileSync(join(process.cwd(), ".env"), "utf8");
    return parseEnvFileValue(envFile, "TMDB_API_KEY");
  } catch {
    return undefined;
  }
}

function tmdbApiKey(override?: string | null): string | undefined {
  return resolveTmdbApiKey(override) ?? readTmdbKeyFromDotenv();
}

async function tmdbGet(pathAndQuery: string, apiKey: string): Promise<Response> {
  const url = new URL(`${TMDB_BASE}${pathAndQuery}`);
  const headers: HeadersInit = { Accept: "application/json" };

  if (isTmdbBearerToken(apiKey)) {
    headers.Authorization = `Bearer ${apiKey}`;
  } else {
    url.searchParams.set("api_key", apiKey);
  }

  return fetch(url, { cache: "no-store", headers });
}

export function posterUrlFromPath(
  posterPath: string | null | undefined,
): string | null {
  if (!posterPath) {
    return null;
  }
  return `${TMDB_IMAGE_BASE}${posterPath}`;
}

async function searchTitle(
  title: string,
  type: RecType,
  apiKey: string,
): Promise<{ id: number; poster_url: string | null } | null> {
  const searchType = type === "movie" ? "movie" : "tv";
  const searchRes = await tmdbGet(
    `/search/${searchType}?query=${encodeURIComponent(title)}`,
    apiKey,
  );
  if (!searchRes.ok) {
    return null;
  }

  const searchData = (await searchRes.json()) as TmdbSearchResult;
  const first = searchData.results?.[0];
  if (!first?.id) {
    return null;
  }

  return {
    id: first.id,
    poster_url: posterUrlFromPath(first.poster_path),
  };
}

export async function lookupTitleCatalog(
  title: string,
  type: RecType,
  apiKeyOverride?: string | null,
): Promise<{ poster_url: string | null; watch_providers: string[] }> {
  const apiKey = tmdbApiKey(apiKeyOverride);
  if (!apiKey) {
    return { poster_url: null, watch_providers: [] };
  }

  try {
    const match = await searchTitle(title, type, apiKey);
    if (!match) {
      return { poster_url: null, watch_providers: [] };
    }

    const searchType = type === "movie" ? "movie" : "tv";
    const providersRes = await tmdbGet(
      `/${searchType}/${match.id}/watch/providers`,
      apiKey,
    );
    if (!providersRes.ok) {
      return { poster_url: match.poster_url, watch_providers: [] };
    }

    const providersData = (await providersRes.json()) as TmdbProvidersResult;
    const us = providersData.results?.US;
    const flatrate = us?.flatrate ?? [];
    return {
      poster_url: match.poster_url,
      watch_providers: flatrate.map((p) => p.provider_name).slice(0, 4),
    };
  } catch {
    return { poster_url: null, watch_providers: [] };
  }
}

export async function lookupPosterUrl(
  title: string,
  type: RecType,
  apiKeyOverride?: string | null,
): Promise<string | null> {
  const apiKey = tmdbApiKey(apiKeyOverride);
  if (!apiKey) {
    return null;
  }

  try {
    const match = await searchTitle(title, type, apiKey);
    return match?.poster_url ?? null;
  } catch {
    return null;
  }
}

export async function lookupWatchProviders(
  title: string,
  type: RecType,
  apiKeyOverride?: string | null,
): Promise<string[]> {
  const catalog = await lookupTitleCatalog(title, type, apiKeyOverride);
  return catalog.watch_providers;
}

export async function lookupSimilarTitles(
  title: string,
  type: RecType,
  apiKeyOverride?: string | null,
): Promise<Array<{ title: string; type: RecType }>> {
  const apiKey = tmdbApiKey(apiKeyOverride);
  if (!apiKey) {
    return [];
  }

  try {
    const match = await searchTitle(title, type, apiKey);
    if (!match) {
      return [];
    }

    const searchType = type === "movie" ? "movie" : "tv";
    const similarRes = await tmdbGet(`/${searchType}/${match.id}/similar`, apiKey);
    if (!similarRes.ok) {
      return [];
    }

    const similarData = (await similarRes.json()) as TmdbSimilarResult;
    return (similarData.results ?? [])
      .slice(0, 4)
      .map((item) => {
        const recType: RecType = searchType === "movie" ? "movie" : "show";
        return {
          title: item.title ?? item.name ?? "",
          type: recType,
        };
      })
      .filter((item) => item.title.length > 0);
  } catch {
    return [];
  }
}

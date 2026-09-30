import type { RecType } from "./types";

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
  results?: Array<{ title?: string; name?: string; media_type?: string }>;
};

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
  const searchUrl = `${TMDB_BASE}/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
  const searchRes = await fetch(searchUrl);
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
): Promise<{ poster_url: string | null; watch_providers: string[] }> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return { poster_url: null, watch_providers: [] };
  }

  try {
    const match = await searchTitle(title, type, apiKey);
    if (!match) {
      return { poster_url: null, watch_providers: [] };
    }

    const searchType = type === "movie" ? "movie" : "tv";
    const providersUrl = `${TMDB_BASE}/${searchType}/${match.id}/watch/providers?api_key=${apiKey}`;
    const providersRes = await fetch(providersUrl);
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
): Promise<string | null> {
  const apiKey = process.env.TMDB_API_KEY;
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
): Promise<string[]> {
  const catalog = await lookupTitleCatalog(title, type);
  return catalog.watch_providers;
}

export async function lookupSimilarTitles(
  title: string,
  type: RecType,
): Promise<Array<{ title: string; type: RecType }>> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const match = await searchTitle(title, type, apiKey);
    if (!match) {
      return [];
    }

    const searchType = type === "movie" ? "movie" : "tv";
    const similarUrl = `${TMDB_BASE}/${searchType}/${match.id}/similar?api_key=${apiKey}`;
    const similarRes = await fetch(similarUrl);
    if (!similarRes.ok) {
      return [];
    }

    const similarData = (await similarRes.json()) as TmdbSimilarResult;
    return (similarData.results ?? [])
      .slice(0, 4)
      .map((item) => {
        const recType: RecType =
          item.media_type === "movie" || searchType === "movie" ? "movie" : "show";
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

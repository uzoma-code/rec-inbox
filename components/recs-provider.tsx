"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchTitleCatalogAction, loadUserRecsAction, syncRecAction } from "@/app/actions/recs";
import {
  createRec,
  markWatched,
  mergeRecs,
  setRating,
} from "@/lib/recs";
import { loadUserRecs, saveUserRecs } from "@/lib/rec-store";
import type { Rating, Rec, RecInput } from "@/lib/types";
import { useAuth } from "./auth-provider";

type RecsContextValue = {
  recs: Rec[];
  ready: boolean;
  addRec: (input: RecInput) => Promise<Rec | null>;
  markRecWatched: (id: string) => Promise<void>;
  rateRec: (id: string, rating: Rating) => Promise<void>;
  refreshProviders: (id: string) => Promise<void>;
};

const RecsContext = createContext<RecsContextValue | null>(null);

export function RecsProvider({
  children,
  seedRecs,
  hasDatabase,
}: {
  children: React.ReactNode;
  seedRecs: Rec[];
  hasDatabase: boolean;
}) {
  const { user } = useAuth();
  const [userRecs, setUserRecs] = useState<Rec[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function hydrate() {
      if (!user) {
        setUserRecs([]);
        setReady(true);
        return;
      }

      if (hasDatabase) {
        const remoteRecs = await loadUserRecsAction();
        setUserRecs(remoteRecs);
        saveUserRecs(user.id, remoteRecs);
        setReady(true);
        return;
      }

      setUserRecs(loadUserRecs(user.id));
      setReady(true);
    }

    setReady(false);
    void hydrate();
  }, [user, hasDatabase]);

  const withCatalogIfMissing = useCallback(async (rec: Rec): Promise<Rec> => {
    const hasPoster = Boolean(rec.poster_url);
    const hasProviders = Boolean(rec.watch_providers && rec.watch_providers.length > 0);
    if (hasPoster && hasProviders) {
      return rec;
    }

    const catalog = await fetchTitleCatalogAction(rec.title, rec.type);
    return {
      ...rec,
      poster_url: rec.poster_url || catalog.poster_url,
      watch_providers:
        rec.watch_providers && rec.watch_providers.length > 0
          ? rec.watch_providers
          : catalog.watch_providers,
      watch_providers_updated_at: new Date().toISOString(),
    };
  }, []);

  const persistRec = useCallback(
    async (rec: Rec, allUserRecs: Rec[]) => {
      if (!user) {
        return;
      }

      setUserRecs(allUserRecs);
      saveUserRecs(user.id, allUserRecs);

      if (hasDatabase) {
        await syncRecAction({ ...rec, user_id: user.id });
      }
    },
    [user, hasDatabase],
  );

  const recs = useMemo(() => {
    if (!user) {
      return [];
    }
    return mergeRecs(seedRecs, userRecs);
  }, [seedRecs, userRecs, user]);

  const addRec = useCallback(
    async (input: RecInput) => {
      if (!user) {
        return null;
      }

      const rec = createRec({ ...input, user_id: user.id });
      const catalog = await fetchTitleCatalogAction(rec.title, rec.type);
      const withCatalog = {
        ...rec,
        poster_url: catalog.poster_url,
        watch_providers: catalog.watch_providers,
      };
      const nextUserRecs = [withCatalog, ...userRecs];
      await persistRec(withCatalog, nextUserRecs);
      return withCatalog;
    },
    [user, userRecs, persistRec],
  );

  const markRecWatched = useCallback(
    async (id: string) => {
      if (!user) {
        return;
      }

      const existing = recs.find((rec) => rec.id === id);
      if (!existing) {
        return;
      }

      const userVersion = userRecs.find((rec) => rec.id === id);
      const source = userVersion ?? {
        ...existing,
        is_seed: false,
        user_id: user.id,
      };
      const watched = await withCatalogIfMissing(markWatched(source));
      const nextUserRecs = [watched, ...userRecs.filter((rec) => rec.id !== id)];
      await persistRec(watched, nextUserRecs);
    },
    [recs, userRecs, user, persistRec, withCatalogIfMissing],
  );

  const rateRec = useCallback(
    async (id: string, rating: Rating) => {
      const existing = recs.find((rec) => rec.id === id);
      if (!existing) {
        return;
      }

      const source = userRecs.find((rec) => rec.id === id) ?? {
        ...existing,
        is_seed: false,
        user_id: user?.id,
      };
      const rated = await withCatalogIfMissing(setRating(source, rating));
      const without = userRecs.filter((rec) => rec.id !== id);
      const nextUserRecs = [rated, ...without];
      await persistRec(rated, nextUserRecs);
    },
    [recs, userRecs, user, persistRec, withCatalogIfMissing],
  );

  const refreshProviders = useCallback(
    async (id: string) => {
      const existing = recs.find((rec) => rec.id === id);
      if (!existing || !user) {
        return;
      }

      const source = userRecs.find((rec) => rec.id === id) ?? {
        ...existing,
        is_seed: false,
        user_id: user.id,
      };
      const updated = await withCatalogIfMissing(source);
      const without = userRecs.filter((rec) => rec.id !== id);
      const nextUserRecs = [updated, ...without];
      await persistRec(updated, nextUserRecs);
    },
    [recs, userRecs, user, persistRec, withCatalogIfMissing],
  );

  const value = useMemo(
    () => ({ recs, ready, addRec, markRecWatched, rateRec, refreshProviders }),
    [recs, ready, addRec, markRecWatched, rateRec, refreshProviders],
  );

  return <RecsContext.Provider value={value}>{children}</RecsContext.Provider>;
}

export function useRecs() {
  const context = useContext(RecsContext);
  if (!context) {
    throw new Error("useRecs must be used within RecsProvider");
  }
  return context;
}

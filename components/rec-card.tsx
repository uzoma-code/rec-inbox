"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PosterImage } from "@/components/poster-image";
import { formatRecMeta } from "@/lib/format-time";
import { formatRecommenderLabel } from "@/lib/recs";
import type { Rec } from "@/lib/types";
import { useRecs } from "./recs-provider";
import { StarRating } from "./star-rating";

export function RecCard({
  rec,
  showMarkWatched = false,
  showRating = false,
  onMarkWatched,
  onRate,
}: {
  rec: Rec;
  showMarkWatched?: boolean;
  showRating?: boolean;
  onMarkWatched?: (id: string) => void;
  onRate?: (id: string, rating: 1 | 2 | 3 | 4 | 5) => void;
}) {
  const { refreshProviders } = useRecs();
  const providers = rec.watch_providers ?? [];
  const [lookingUp, setLookingUp] = useState(false);
  const lookupAttempted = useRef(false);

  useEffect(() => {
    if (lookupAttempted.current || (providers.length > 0 && rec.poster_url)) {
      return;
    }

    lookupAttempted.current = true;
    setLookingUp(true);
    void refreshProviders(rec.id).finally(() => setLookingUp(false));
  }, [rec.id, rec.poster_url, providers.length, refreshProviders]);

  useEffect(() => {
    if (providers.length > 0 && rec.poster_url) {
      lookupAttempted.current = false;
    }
  }, [providers.length, rec.poster_url]);

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4 p-4">
        <PosterImage src={rec.poster_url} title={rec.title} />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <Link
                href={`/recs/${rec.id}`}
                className="block truncate text-lg font-medium tracking-tight text-foreground hover:text-primary"
              >
                {rec.title}
              </Link>
              <p className="text-sm text-muted-foreground">
                {rec.status === "to_watch"
                  ? formatRecMeta(rec.recommender_name, rec.created_at)
                  : formatRecommenderLabel(rec.recommender_name)}
              </p>
            </div>
            <Badge variant="secondary">{rec.type === "movie" ? "Movie" : "Show"}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {lookingUp && !rec.poster_url
              ? "Looking up poster and where to watch…"
              : providers.length > 0
                ? `Watch on: ${providers.join(", ")}`
                : "Where to watch isn't available right now."}
          </p>
          {showRating && onRate ? (
            <StarRating
              value={rec.rating}
              onChange={(rating) => onRate(rec.id, rating)}
            />
          ) : null}
          {rec.rating === 5 ? (
            <p className="text-sm font-medium text-foreground">5★ favorite</p>
          ) : null}
          {showMarkWatched && onMarkWatched ? (
            <Button onClick={() => onMarkWatched(rec.id)}>Mark watched</Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

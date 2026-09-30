"use client";

import { EmptyState } from "@/components/empty-state";
import { RecCard } from "@/components/rec-card";
import { useRecs } from "@/components/recs-provider";
import { filterByStatus } from "@/lib/recs";

export default function WatchedPage() {
  const { recs, ready, rateRec } = useRecs();
  const watched = filterByStatus(recs, "watched");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">Watched</h1>
        <p className="mt-2 text-muted-foreground">
          Finished. Rate it. 5 stars go to Favorites.
        </p>
      </div>

      {!ready ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : watched.length === 0 ? (
        <EmptyState
          title="Nothing watched yet"
          description="Mark a title watched from your To watch list."
          actionLabel="Go to To watch"
          actionHref="/"
        />
      ) : (
        <div className="grid gap-4">
          {watched.map((rec) => (
            <RecCard
              key={rec.id}
              rec={rec}
              showRating
              onRate={(id, rating) => void rateRec(id, rating)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

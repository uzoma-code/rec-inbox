"use client";

import { EmptyState } from "@/components/empty-state";
import { RecCard } from "@/components/rec-card";
import { useRecs } from "@/components/recs-provider";
import { filterFavorites } from "@/lib/recs";

export default function FavoritesPage() {
  const { recs, ready } = useRecs();
  const favorites = filterFavorites(recs);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">Your Favorites</h1>
        <p className="mt-2 text-muted-foreground">Only titles you rated 5 stars.</p>
      </div>

      {!ready ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : favorites.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Rate a watched title 5 stars and it lands here."
          actionLabel="Go to Watched"
          actionHref="/watched"
        />
      ) : (
        <div className="grid gap-4">
          {favorites.map((rec) => (
            <RecCard key={rec.id} rec={rec} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { RecCard } from "@/components/rec-card";
import { useRecs } from "@/components/recs-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { filterByStatus } from "@/lib/recs";

export default function ToWatchPage() {
  const { recs, ready, markRecWatched } = useRecs();
  const toWatch = filterByStatus(recs, "to_watch");

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">To watch</h1>
          <p className="mt-2 text-muted-foreground">
            What friends told you to watch.
          </p>
        </div>
        <Link href="/add" className={cn(buttonVariants())}>
          Add rec
        </Link>
      </div>

      {!ready ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : toWatch.length === 0 ? (
        <EmptyState
          title="No friend recs yet"
          description="Add the first one before it disappears in chat."
          actionLabel="Add rec"
          actionHref="/add"
        />
      ) : (
        <div className="grid gap-4">
          {toWatch.map((rec) => (
            <RecCard
              key={rec.id}
              rec={rec}
              showMarkWatched
              onMarkWatched={(id) => void markRecWatched(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

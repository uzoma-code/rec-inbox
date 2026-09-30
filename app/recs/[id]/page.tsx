"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RecCard } from "@/components/rec-card";
import { useRecs } from "@/components/recs-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RecDetailPage() {
  const params = useParams<{ id: string }>();
  const { recs, markRecWatched, rateRec } = useRecs();
  const rec = recs.find((item) => item.id === params.id);

  if (!rec) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">This rec could not be found.</p>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to To watch
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={rec.status === "watched" ? "/watched" : "/"}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Back
      </Link>
      <RecCard
        rec={rec}
        showMarkWatched={rec.status === "to_watch"}
        showRating={rec.status === "watched"}
        onMarkWatched={(id) => void markRecWatched(id)}
        onRate={(id, rating) => void rateRec(id, rating)}
      />
    </div>
  );
}

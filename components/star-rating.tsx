"use client";

import { Star } from "lucide-react";
import type { Rating } from "@/lib/types";

export function StarRating({
  value,
  onChange,
}: {
  value: Rating | null;
  onChange: (rating: Rating) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rating">
      {([1, 2, 3, 4, 5] as Rating[]).map((star) => {
        const filled = value !== null && star <= value;
        return (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} stars`}
            onClick={() => onChange(star)}
            className="rounded p-1 text-primary hover:bg-accent"
          >
            <Star
              className="size-4"
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
            />
          </button>
        );
      })}
      {value ? (
        <span className="ml-2 text-sm text-muted-foreground">{value}</span>
      ) : (
        <span className="ml-2 text-sm text-muted-foreground">Rate it</span>
      )}
    </div>
  );
}

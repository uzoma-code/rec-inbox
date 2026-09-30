"use client";

import { cn } from "@/lib/utils";

export function PosterImage({
  src,
  title,
  className,
}: {
  src: string | null | undefined;
  title: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-[132px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-muted",
        className,
      )}
    >
      {src ? (
        // Catalog posters are remote TMDB URLs; img keeps lookup simple.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${title} poster`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-lg font-medium text-muted-foreground">
          {title.slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );
}

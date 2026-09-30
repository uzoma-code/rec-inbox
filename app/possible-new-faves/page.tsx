"use client";

import { PossibleFavesList } from "@/components/possible-faves-list";

export default function PossibleNewFavesPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">Possible New Faves</h1>
        <p className="mt-2 text-muted-foreground">
          AI picks similar to your 5★ titles. Add one if you want it.
        </p>
      </div>
      <PossibleFavesList />
    </div>
  );
}

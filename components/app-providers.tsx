"use client";

import type { Rec } from "@/lib/types";
import { AuthProvider } from "./auth-provider";
import { RecsProvider } from "./recs-provider";
import { RequireAuth } from "./require-auth";

export function AppProviders({
  children,
  seedRecs,
  hasDatabase,
}: {
  children: React.ReactNode;
  seedRecs: Rec[];
  hasDatabase: boolean;
}) {
  return (
    <AuthProvider hasDatabase={hasDatabase}>
      <RecsProvider seedRecs={seedRecs} hasDatabase={hasDatabase}>
        <RequireAuth>{children}</RequireAuth>
      </RecsProvider>
    </AuthProvider>
  );
}

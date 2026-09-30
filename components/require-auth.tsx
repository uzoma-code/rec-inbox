"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./auth-provider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && pathname !== "/sign-in") {
      router.replace("/sign-in");
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-12 text-muted-foreground md:px-8">
        Loading…
      </div>
    );
  }

  if (!user && pathname !== "/sign-in") {
    return null;
  }

  return <>{children}</>;
}

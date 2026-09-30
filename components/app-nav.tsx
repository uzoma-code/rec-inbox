"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";

const links = [
  { href: "/", label: "To watch" },
  { href: "/watched", label: "Watched" },
  { href: "/favorites", label: "Favorites" },
  { href: "/possible-new-faves", label: "New faves" },
];

export function AppNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  if (pathname === "/sign-in") {
    return null;
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-[720px] flex-col gap-5 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          <Link href="/" className="text-base font-medium tracking-tight text-foreground">
            Rec Inbox
          </Link>
          <nav className="flex flex-wrap gap-5 text-sm">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "font-medium text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
      <h2 className="text-lg font-medium tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={cn(buttonVariants(), "mt-6 inline-flex")}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

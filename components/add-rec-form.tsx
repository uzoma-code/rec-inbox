"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateRecInput } from "@/lib/recs";
import type { RecType } from "@/lib/types";
import { useRecs } from "./recs-provider";

export function AddRecForm() {
  const router = useRouter();
  const { addRec } = useRecs();
  const [title, setTitle] = useState("");
  const [recommenderName, setRecommenderName] = useState("");
  const [type, setType] = useState<RecType>("show");
  const [errors, setErrors] = useState<{ title?: string; recommender_name?: string }>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateRecInput({
      title,
      recommender_name: recommenderName,
      type,
    });

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    await addRec(result.value);
    setSubmitting(false);
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Slow Horses"
        />
        {errors.title ? (
          <p className="text-sm text-destructive">{errors.title}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="recommender">Who recommended it *</Label>
        <Input
          id="recommender"
          value={recommenderName}
          onChange={(event) => setRecommenderName(event.target.value)}
          placeholder="Jake"
        />
        {errors.recommender_name ? (
          <p className="text-sm text-destructive">{errors.recommender_name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Type *</Label>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              checked={type === "movie"}
              onChange={() => setType("movie")}
              className="accent-primary"
            />
            Movie
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              checked={type === "show"}
              onChange={() => setType("show")}
              className="accent-primary"
            />
            Show
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Cancel
        </Link>
        <Button type="submit" disabled={submitting}>
          Add to To watch
        </Button>
      </div>
    </form>
  );
}

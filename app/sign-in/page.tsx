"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, signUp, user } = useAuth();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result =
      mode === "sign-in"
        ? await signIn(email, password)
        : await signUp(email, password);

    setSubmitting(false);

    if (result) {
      setError(result);
      return;
    }

    router.replace("/");
  }

  return (
    <div className="mx-auto max-w-md space-y-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">Rec Inbox</h1>
        <p className="mt-2 text-muted-foreground">
          Friend recs. Not a public watch diary.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{mode === "sign-in" ? "Sign in" : "Create account"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={submitting}>
              {mode === "sign-in" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <button
            type="button"
            className="mt-4 text-sm text-primary"
            onClick={() =>
              setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"))
            }
          >
            {mode === "sign-in"
              ? "Need an account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary">
          Back to app
        </Link>
      </p>
    </div>
  );
}

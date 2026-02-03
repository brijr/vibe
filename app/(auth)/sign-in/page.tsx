"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn.email({ email, password });

    if (error) {
      toast.error(error.message || "Failed to sign in");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-xs">
      <Link href="/" className="font-mono text-sm">
        brijr/vibe
      </Link>

      <h1 className="mt-8 text-sm">Sign in</h1>

      <form onSubmit={handleSubmit} className="mt-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email" className="text-muted-foreground text-xs">
              Email
            </FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1"
            />
            {errors.email && <FieldError>{errors.email}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="password" className="text-muted-foreground text-xs">
              Password
            </FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1"
            />
            {errors.password && <FieldError>{errors.password}</FieldError>}
          </Field>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-muted-foreground mt-8 text-sm">
        No account?{" "}
        <Link href="/sign-up" className="text-foreground underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters" });
      setIsLoading(false);
      return;
    }

    const { error } = await signUp.email({ name, email, password });

    if (error) {
      toast.error(error.message || "Failed to create account");
      setIsLoading(false);
      return;
    }

    toast.success("Account created! Please sign in.");
    router.push("/sign-in");
  }

  return (
    <div className="w-full max-w-xs">
      <Link href="/" className="font-mono text-sm">
        brijr/vibe
      </Link>

      <h1 className="mt-8 text-sm">Create account</h1>

      <form onSubmit={handleSubmit} className="mt-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name" className="text-muted-foreground text-xs">
              Name
            </FieldLabel>
            <Input id="name" name="name" required className="mt-1" />
            {errors.name && <FieldError>{errors.name}</FieldError>}
          </Field>
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
              minLength={8}
              required
              className="mt-1"
            />
            {errors.password && <FieldError>{errors.password}</FieldError>}
          </Field>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-muted-foreground mt-8 text-sm">
        Have an account?{" "}
        <Link href="/sign-in" className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}

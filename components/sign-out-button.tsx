"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-muted-foreground hover:text-foreground"
    >
      Sign out
    </button>
  );
}

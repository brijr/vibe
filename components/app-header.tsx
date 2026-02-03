"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AppHeaderProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <header className="flex h-12 items-center justify-between border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <button
        onClick={handleSignOut}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        Sign out
      </button>
    </header>
  );
}

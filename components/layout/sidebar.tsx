"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home03Icon,
  File01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home03Icon },
  { name: "Projects", href: "/projects", icon: File01Icon },
  { name: "Settings", href: "/settings", icon: Settings01Icon },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="border-border bg-background hidden w-64 flex-shrink-0 border-r lg:flex lg:flex-col">
      <div className="border-border flex h-16 items-center border-b px-6">
        <Link href="/" className="text-xl font-bold">
          SaaS Starter
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn("w-full justify-start gap-3")}
              >
                <HugeiconsIcon icon={item.icon} size={20} />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="border-border border-t p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
            <span className="text-primary text-sm font-medium">
              {user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

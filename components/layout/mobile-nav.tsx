"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu01Icon,
  Home03Icon,
  File01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface MobileNavProps {
  user: {
    name: string;
    email: string;
  };
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home03Icon },
  { name: "Documents", href: "/documents", icon: File01Icon },
  { name: "Settings", href: "/settings", icon: Settings01Icon },
];

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <HugeiconsIcon icon={Menu01Icon} size={20} />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-border border-b p-6">
          <SheetTitle className="text-left text-xl font-bold">
            SaaS Starter
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
              >
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
        <div className="border-border absolute inset-x-0 bottom-0 border-t p-4">
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
      </SheetContent>
    </Sheet>
  );
}

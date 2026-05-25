"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, GraduationCap, LogOut, Search } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/nav";
import type { UserRole } from "@/lib/types";

export function AppShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: UserRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const items = getNavItems(role);

  return (
    <div className="min-h-screen w-full bg-[color:var(--color-background)]">
      <div className="mx-auto flex min-h-screen w-full gap-4 px-3 py-3 md:px-6 md:py-6 2xl:px-10">
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="sticky top-6 flex h-[calc(100vh-48px)] flex-col rounded-3xl eduai-glass p-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-2 py-2 font-semibold"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-500/20">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="text-[color:var(--color-foreground)]">
                EduAI
              </span>
            </Link>

            <Separator className="my-4" />

            <nav className="space-y-1">
              {items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-muted)]",
                      active && "bg-indigo-600/10 text-indigo-700",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        active ? "text-indigo-700" : undefined,
                      )}
                    />
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-3">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  logout();
                  toast.success("Logged out");
                  router.push("/");
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 rounded-3xl eduai-glass">
            <div className="flex h-14 items-center justify-between gap-3 px-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="text-sm font-medium text-[color:var(--color-foreground)]">
                  {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                </div>
              </div>

              <div className="hidden w-full max-w-md items-center md:flex">
                <div className="relative w-full">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]" />
                  <Input
                    aria-label="Search"
                    placeholder="Search courses, topics..."
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user?.fullName?.slice(0, 1).toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden text-sm font-medium sm:inline">
                        {user?.fullName ?? "User"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-xs text-[color:var(--color-muted-foreground)]">
                      {user?.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        logout();
                        toast.success("Logged out");
                        router.push("/");
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 pt-4 md:pt-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

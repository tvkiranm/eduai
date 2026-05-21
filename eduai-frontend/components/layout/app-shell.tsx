"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/nav";
import type { UserRole } from "@/lib/types";

export function AppShell({ children, role }: { children: React.ReactNode; role: UserRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const items = getNavItems(role);

  return (
    <div className="min-h-screen w-full">
      <div className="flex min-h-screen w-full gap-4 px-3 py-3 md:px-6 md:py-6 2xl:px-10">
        <aside className="hidden w-72 shrink-0 rounded-3xl eduai-glass p-4 md:block">
          <Link href="/" className="flex items-center gap-2 px-2 py-2 font-semibold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/90 via-fuchsia-400/90 to-indigo-400/90 text-zinc-950 shadow-lg shadow-indigo-500/10">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-zinc-50">EduAI</span>
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
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/75 hover:bg-white/8",
                    active &&
                      "bg-white/10 text-zinc-50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 rounded-3xl eduai-glass">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="text-sm text-white/70">
                {role.charAt(0).toUpperCase() + role.slice(1)} Portal
              </div>
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
                  <div className="px-2 py-1.5 text-xs text-white/60">
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
          </header>

          <main className="flex-1 pt-4 md:pt-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

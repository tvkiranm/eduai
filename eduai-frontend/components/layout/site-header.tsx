"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#how", label: "How it works" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, role, logout } = useAuth();

  const dashboardHref =
    role === "admin"
      ? "/admin/dashboard"
      : role === "teacher"
        ? "/teacher/dashboard"
        : role === "student"
          ? "/student/dashboard"
          : "/auth/sign-in";

  return (
    <header className="sticky top-0 z-50 w-full eduai-glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/90 via-fuchsia-400/90 to-indigo-400/90 text-zinc-950 shadow-lg shadow-indigo-500/10">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-zinc-50">EduAI</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm text-white/70 hover:text-white",
                pathname !== "/" && "pointer-events-none opacity-50",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="outline" asChild className="hidden sm:inline-flex">
                <Link href={dashboardHref}>Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  toast.success("Logged out");
                  router.push("/");
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button variant="outline" asChild className="hidden sm:inline-flex">
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/join-teacher">Join as Teacher</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

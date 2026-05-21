"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import type { UserRole } from "@/lib/types";

export function RequireAuth({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/auth/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (role && !allowedRoles.includes(role)) {
      toast.error("You don't have access to this page");
      router.replace("/");
    }
  }, [allowedRoles, isAuthenticated, pathname, role, router]);

  if (!isAuthenticated) return null;
  if (role && !allowedRoles.includes(role)) return null;
  return children;
}


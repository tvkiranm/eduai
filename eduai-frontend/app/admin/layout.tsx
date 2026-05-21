"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/layout/require-auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={["admin"]}>
      <AppShell role="admin">{children}</AppShell>
    </RequireAuth>
  );
}


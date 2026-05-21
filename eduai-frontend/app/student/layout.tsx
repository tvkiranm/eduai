"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/layout/require-auth";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={["student"]}>
      <AppShell role="student">{children}</AppShell>
    </RequireAuth>
  );
}


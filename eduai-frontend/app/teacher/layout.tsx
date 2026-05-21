"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/layout/require-auth";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={["teacher"]}>
      <AppShell role="teacher">{children}</AppShell>
    </RequireAuth>
  );
}


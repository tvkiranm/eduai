"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search } from "lucide-react";

import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/layout/states";

function shortId(id: string): string {
  if (!id) return "-";
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

function formatTs(ts: string | null | undefined): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export function ChatShell({
  baseHref,
  children,
}: {
  baseHref: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [q, setQ] = useState("");

  const selectedConversationId = useMemo(() => {
    const base = baseHref.endsWith("/") ? baseHref.slice(0, -1) : baseHref;
    if (!pathname) return null;
    if (pathname === base) return null;
    if (!pathname.startsWith(`${base}/`)) return null;
    const raw = pathname.slice(base.length + 1);
    return raw ? decodeURIComponent(raw) : null;
  }, [baseHref, pathname]);

  const conversations = useQuery({
    queryKey: ["chat", "conversations", userId],
    enabled: Boolean(userId),
    queryFn: () => api.chat.conversations(userId as string),
  });

  useEffect(() => {
    if (conversations.isError) toast.error(getErrorMessage(conversations.error));
  }, [conversations.error, conversations.isError]);

  useEffect(() => {
    if (!pathname) return;
    if (!userId) return;
    if (selectedConversationId) return;
    const data = conversations.data ?? [];
    if (!data.length) return;

    const base = baseHref.endsWith("/") ? baseHref.slice(0, -1) : baseHref;
    if (pathname !== base) return;

    router.replace(`${baseHref}/${data[0].id}`);
  }, [baseHref, conversations.data, pathname, router, selectedConversationId, userId]);

  const filtered = useMemo(() => {
    const data = conversations.data ?? [];
    const needle = q.trim().toLowerCase();
    if (!needle) return data;
    return data.filter((c) => {
      const last = c.lastMessage ?? "";
      const participants = (c.participantIds ?? []).join(" ");
      return `${participants} ${last}`.toLowerCase().includes(needle);
    });
  }, [conversations.data, q]);

  return (
    <div className="eduai-glass overflow-hidden rounded-3xl">
      <div className="flex h-[calc(100vh-160px)] min-h-[560px] flex-col md:flex-row">
        <aside className="flex w-full flex-col md:w-[360px] md:border-r md:border-[color:var(--color-border)]">
          <div className="p-4">
            <div className="text-sm font-semibold text-[color:var(--color-foreground)]">Conversations</div>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="h-11 rounded-2xl pl-10"
              />
            </div>
          </div>

          <Separator />

          <div className="flex-1 overflow-y-auto">
            {conversations.isLoading ? (
              <div className="p-4">
                <LoadingState label="Loading conversations..." />
              </div>
            ) : null}

            {!conversations.isLoading && filtered.length === 0 ? (
              <div className="p-4 text-sm text-[color:var(--color-muted-foreground)]">
                No conversations found.
              </div>
            ) : null}

            <div className="p-2">
              {filtered.map((c) => {
                const others = userId ? (c.participantIds ?? []).filter((id) => id !== userId) : [];
                const title = others.length
                  ? others.map(shortId).join(", ")
                  : c.participantIds?.map(shortId).join(", ") ?? "-";
                const when = c.lastMessageAt ?? c.updatedAt ?? c.createdAt ?? null;
                const active = Boolean(selectedConversationId && selectedConversationId === c.id);

                return (
                  <Link
                    key={c.id}
                    href={`${baseHref}/${c.id}`}
                    className={cn(
                      "block rounded-2xl px-3 py-3 transition",
                      active ? "bg-indigo-600/10" : "hover:bg-[color:var(--color-muted)]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className={cn("truncate text-sm font-medium", active ? "text-indigo-700" : "text-[color:var(--color-foreground)]")}>
                        {title}
                      </div>
                      <div className="shrink-0 text-xs text-[color:var(--color-muted-foreground)]">
                        {formatTs(when)}
                      </div>
                    </div>
                    <div className="mt-1 truncate text-sm text-[color:var(--color-muted-foreground)]">
                      {c.lastMessage?.trim() ? c.lastMessage : "No messages yet"}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">{children}</section>
      </div>
    </div>
  );
}

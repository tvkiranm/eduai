"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SendHorizontal } from "lucide-react";

import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function shortId(id: string): string {
  if (!id) return "-";
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

export function ConversationView({
  conversationId,
  participantIds,
}: {
  conversationId: string;
  participantIds: string[] | null;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [text, setText] = useState("");
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const receiverId = useMemo(() => {
    if (!userId) return null;
    const others = (participantIds ?? []).filter((id) => id !== userId);
    return others[0] ?? null;
  }, [participantIds, userId]);

  const messages = useQuery({
    queryKey: ["chat", "messages", conversationId],
    queryFn: () => api.chat.messages(conversationId),
  });

  useEffect(() => {
    if (messages.isError) toast.error(getErrorMessage(messages.error));
  }, [messages.error, messages.isError]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.data?.length]);

  const send = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not authenticated");
      if (!receiverId) throw new Error("Receiver not found for this conversation");
      const content = text.trim();
      if (!content) throw new Error("Message is empty");
      return api.chat.sendMessage({ senderId: userId, receiverId, content });
    },
    onSuccess: async () => {
      setText("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["chat", "messages", conversationId] }),
        queryClient.invalidateQueries({ queryKey: ["chat", "conversations", userId] }),
      ]);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[color:var(--color-foreground)]">
            Conversation
          </div>
          <div className="truncate text-xs text-[color:var(--color-muted-foreground)]">
            ID: {shortId(conversationId)}
          </div>
        </div>
      </div>

      <Separator />

      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4">
        {messages.isLoading ? (
          <div className="text-sm text-[color:var(--color-muted-foreground)]">Loading messages…</div>
        ) : null}

        {!messages.isLoading && (messages.data ?? []).length === 0 ? (
          <div className="text-sm text-[color:var(--color-muted-foreground)]">No messages yet. Say hi!</div>
        ) : null}

        <div className="space-y-3">
          {(messages.data ?? []).map((m) => {
            const mine = Boolean(userId && m.senderId === userId);
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    mine
                      ? "bg-indigo-600 text-white shadow-indigo-500/20"
                      : "bg-[color:var(--color-muted)] text-[color:var(--color-foreground)]",
                  )}
                >
                  <div className="whitespace-pre-wrap break-words">{m.content}</div>
                  <div className={cn("mt-1 text-[11px]", mine ? "text-white/80" : "text-[color:var(--color-muted-foreground)]")}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="p-4">
        <div className="flex items-end gap-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            rows={1}
            className="min-h-[44px] resize-none rounded-2xl"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send.mutateAsync();
              }
            }}
          />
          <Button
            className="h-[44px] rounded-2xl"
            disabled={send.isPending || !text.trim() || !receiverId}
            onClick={() => void send.mutateAsync()}
          >
            <SendHorizontal className="h-4 w-4" />
            Send
          </Button>
        </div>
        {!receiverId ? (
          <div className="mt-2 text-xs text-amber-700">
            Can&apos;t send: this conversation doesn&apos;t have a receiverId.
          </div>
        ) : null}
      </div>
    </div>
  );
}

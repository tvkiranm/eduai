"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { LoadingState } from "@/components/layout/states";
import { ChatEmptyPane } from "@/components/chat/chat-empty-pane";
import { ConversationView } from "@/components/chat/conversation-view";

export function ConversationRoute({ conversationId }: { conversationId: string }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const conversations = useQuery({
    queryKey: ["chat", "conversations", userId],
    enabled: Boolean(userId),
    queryFn: () => api.chat.conversations(userId as string),
  });

  useEffect(() => {
    if (conversations.isError) toast.error(getErrorMessage(conversations.error));
  }, [conversations.error, conversations.isError]);

  const participantIds = useMemo(() => {
    const data = conversations.data ?? [];
    const match = data.find((c) => c.id === conversationId);
    return match?.participantIds ?? null;
  }, [conversationId, conversations.data]);

  if (!userId) return <ChatEmptyPane title="Sign in required" description="Please sign in to view your conversations." />;
  if (conversations.isLoading) return <div className="p-4"><LoadingState label="Loading conversation..." /></div>;

  if (!participantIds) {
    return (
      <ChatEmptyPane
        title="Conversation not found"
        description="This conversation may not belong to you, or it was deleted."
      />
    );
  }

  return <ConversationView conversationId={conversationId} participantIds={participantIds} />;
}

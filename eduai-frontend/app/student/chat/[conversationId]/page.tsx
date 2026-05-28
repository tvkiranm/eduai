"use client";

import { useParams } from "next/navigation";
import { ConversationRoute } from "@/components/chat/conversation-route";
import { ChatEmptyPane } from "@/components/chat/chat-empty-pane";

export default function StudentConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params?.conversationId;

  if (!conversationId) return <ChatEmptyPane title="Invalid conversation" description="Missing conversationId." />;
  return <ConversationRoute conversationId={conversationId} />;
}

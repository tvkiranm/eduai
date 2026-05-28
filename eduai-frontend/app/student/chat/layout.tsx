"use client";

import { ChatShell } from "@/components/chat/chat-shell";

export default function StudentChatLayout({ children }: { children: React.ReactNode }) {
  return <ChatShell baseHref="/student/chat">{children}</ChatShell>;
}


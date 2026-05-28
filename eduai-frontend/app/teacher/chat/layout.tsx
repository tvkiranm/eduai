"use client";

import { ChatShell } from "@/components/chat/chat-shell";

export default function TeacherChatLayout({ children }: { children: React.ReactNode }) {
  return <ChatShell baseHref="/teacher/chat">{children}</ChatShell>;
}


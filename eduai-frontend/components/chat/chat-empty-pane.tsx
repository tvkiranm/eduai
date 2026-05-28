import { MessageSquareText } from "lucide-react";

export function ChatEmptyPane({
  title = "Select a conversation",
  description = "Pick a conversation from the left to start chatting.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-8">
      <div className="eduai-glass max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-700">
          <MessageSquareText className="h-6 w-6" />
        </div>
        <div className="mt-4 text-base font-semibold text-[color:var(--color-foreground)]">{title}</div>
        <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">{description}</p>
      </div>
    </div>
  );
}


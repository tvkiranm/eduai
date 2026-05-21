import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="eduai-glass flex items-center justify-center rounded-2xl p-10 text-white/70">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function EmptyState({
  title = "Nothing here",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="eduai-glass rounded-2xl border-dashed p-10 text-center">
      <div className="text-sm font-semibold text-zinc-50">{title}</div>
      {description ? (
        <p className="mt-1 text-sm text-white/65">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

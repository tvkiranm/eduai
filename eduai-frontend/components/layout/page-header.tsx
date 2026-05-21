import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-white/65">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

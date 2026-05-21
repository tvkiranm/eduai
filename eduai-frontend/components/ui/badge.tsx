import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ring)]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-white/10 text-zinc-50 hover:bg-white/15",
        secondary:
          "border-transparent bg-white/8 text-white/80 hover:bg-white/12",
        outline:
          "text-zinc-50 border-white/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

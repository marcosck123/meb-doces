import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "error" | "success";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        variant === "default" && "border-white/10 bg-white/10 text-slate-200",
        variant === "error" && "border-rose-400/40 bg-rose-500/15 text-rose-100",
        variant === "success" &&
          "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
        className,
      )}
      {...props}
    />
  );
}

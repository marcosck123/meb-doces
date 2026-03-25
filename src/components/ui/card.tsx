import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full rounded-[28px] border border-white/12 bg-slate-950/55 p-6 shadow-2xl shadow-sky-950/25 backdrop-blur-xl sm:p-8",
        className,
      )}
      {...props}
    />
  );
}

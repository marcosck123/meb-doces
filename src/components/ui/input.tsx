import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  state?: "default" | "error" | "success";
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, state = "default", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-2xl border bg-white/8 px-4 py-3 text-sm text-white placeholder:text-slate-400/80 outline-none transition focus:border-cyan-300/80 focus:ring-2 focus:ring-cyan-300/30",
          state === "default" && "border-white/12",
          state === "error" && "border-rose-400/80 focus:border-rose-300 focus:ring-rose-300/30",
          state === "success" && "border-emerald-400/80 focus:border-emerald-300 focus:ring-emerald-300/30",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

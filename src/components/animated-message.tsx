"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function AnimatedMessage({
  message,
  type,
  className,
}: {
  message?: string | null;
  type: "error" | "success" | "info";
  className?: string;
}) {
  const Icon = type === "error" ? AlertCircle : CheckCircle2;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {message ? (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "flex items-center gap-2 text-sm",
            type === "error" && "text-rose-200",
            type === "success" && "text-emerald-200",
            type === "info" && "text-slate-200",
            className,
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

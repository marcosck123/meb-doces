import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AuthShell({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-72 w-72 animate-[float_11s_ease-in-out_infinite] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-16 h-96 w-96 animate-[float_13s_ease-in-out_infinite_reverse] rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 animate-[pulseGlow_9s_ease-in-out_infinite] rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_40%),linear-gradient(135deg,_#0f172a_0%,_#1e1b4b_50%,_#082f49_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <Card className={cn("space-y-6", className)}>
          <header className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">
              Firebase Auth
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {title}
            </h1>
            <p className="text-sm text-slate-300">{description}</p>
          </header>

          {children}

          {footer ? (
            <footer className="border-t border-white/10 pt-4 text-center text-sm text-slate-300">
              {footer}
            </footer>
          ) : null}
        </Card>
      </div>
    </main>
  );
}

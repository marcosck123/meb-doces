"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

const AUTH_PAGES = new Set(["/login", "/cadastro"]);
const PUBLIC_PATHS = new Set(["/", "/login", "/cadastro"]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user && !PUBLIC_PATHS.has(pathname)) {
      router.replace("/login");
      return;
    }

    if (!user && pathname === "/verificar-telefone") {
      router.replace("/login");
      return;
    }

    if (!user) {
      return;
    }

    if (pathname === "/") {
      router.replace("/dashboard");
      return;
    }

    if (AUTH_PAGES.has(pathname)) {
      router.replace("/dashboard");
    }
  }, [loading, pathname, router, user]);

  return <>{children}</>;
}

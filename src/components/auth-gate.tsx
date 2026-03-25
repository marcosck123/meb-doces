"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

const AUTH_PAGES = new Set(["/login", "/cadastro"]);
const PUBLIC_PATHS = new Set(["/", "/login", "/cadastro", "/verificar-telefone"]);
const PHONE_STEP_KEY = "pending-phone-verification";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { user, loading } = useAuth();
  const [phoneStepPending, setPhoneStepPending] = useState(false);

  useEffect(() => {
    if (!user) {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(PHONE_STEP_KEY);
      }
      setPhoneStepPending(false);
      return;
    }

    if (typeof window !== "undefined") {
      setPhoneStepPending(window.sessionStorage.getItem(PHONE_STEP_KEY) === "true");
    }
  }, [user, pathname]);

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

    if (pathname === "/verificar-telefone" && !phoneStepPending) {
      router.replace("/dashboard");
      return;
    }

    if (AUTH_PAGES.has(pathname)) {
      router.replace("/dashboard");
    }
  }, [loading, pathname, phoneStepPending, router, user]);

  return <>{children}</>;
}

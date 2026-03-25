"use client";

import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";

const AUTH_PAGES = new Set(["/login", "/cadastro"]);
const PUBLIC_PATHS = new Set(["/", "/login", "/cadastro", "/verificar-telefone"]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { user, loading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [hasPhone, setHasPhone] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setHasPhone(null);
      setProfileLoading(false);
      return;
    }

    let active = true;
    setProfileLoading(true);

    getDoc(doc(db, "usuarios", user.uid))
      .then((snapshot) => {
        if (!active) {
          return;
        }

        setHasPhone(Boolean(snapshot.data()?.telefone));
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setHasPhone(false);
      })
      .finally(() => {
        if (active) {
          setProfileLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (loading || profileLoading) {
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
      router.replace(hasPhone ? "/dashboard" : "/verificar-telefone");
      return;
    }

    if (!hasPhone && pathname !== "/verificar-telefone") {
      router.replace("/verificar-telefone");
      return;
    }

    if (hasPhone && (AUTH_PAGES.has(pathname) || pathname === "/verificar-telefone")) {
      router.replace("/dashboard");
    }
  }, [hasPhone, loading, pathname, profileLoading, router, user]);

  return <>{children}</>;
}

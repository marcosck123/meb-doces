"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth, ensureAuthPersistence } from "@/lib/firebase";

type UseAuthResult = {
  user: User | null;
  loading: boolean;
};

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = () => {};

    ensureAuthPersistence()
      .then(() =>
        onAuthStateChanged(auth, (nextUser) => {
          if (!isMounted) {
            return;
          }

          setUser(nextUser);
          setLoading(false);
        }),
      )
      .then((cleanup) => {
        unsubscribe = cleanup;
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setLoading(false);
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { user, loading };
}

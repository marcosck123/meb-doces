"use client";

import { doc, getDoc } from "firebase/firestore";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { auth, db, ensureAuthPersistence } from "@/lib/firebase";

type Profile = {
  username?: string;
  email?: string;
  telefone?: string | null;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    void ensureAuthPersistence();
    void getDoc(doc(db, "usuarios", user.uid)).then((snapshot) => {
      setProfile(snapshot.data() as Profile | null);
    });
  }, [user]);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/");
  }

  return (
    <AuthShell
      title="Dashboard"
      description="Sessão autenticada com persistência local ativa."
    >
      <div className="space-y-4 text-sm text-slate-200">
        <Badge variant="success">Usuário autenticado</Badge>
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/6 p-4">
          <p>
            <span className="text-slate-400">Usuário:</span>{" "}
            {profile?.username ?? "Não informado"}
          </p>
          <p>
            <span className="text-slate-400">E-mail:</span>{" "}
            {profile?.email ?? user?.email ?? "Não informado"}
          </p>
          <p>
            <span className="text-slate-400">Telefone:</span>{" "}
            {profile?.telefone ?? "Desativado por enquanto"}
          </p>
        </div>
        <Button onClick={handleLogout} type="button">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </AuthShell>
  );
}

"use client";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AnimatedMessage } from "@/components/animated-message";
import { AuthShell } from "@/components/auth-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emailRegex, mapAuthError, normalizeUsername } from "@/lib/auth";
import { auth, db, ensureAuthPersistence } from "@/lib/firebase";

type LoginMode = "username" | "email";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("username");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function resolveEmailFromMode() {
    if (mode === "email") {
      const normalizedEmail = identifier.trim();

      if (!emailRegex.test(normalizedEmail)) {
        throw new Error("Insira um e-mail válido");
      }

      return normalizedEmail;
    }

    const normalizedUsername = normalizeUsername(identifier);
    const usernameQuery = query(
      collection(db, "usuarios"),
      where("username", "==", normalizedUsername),
    );
    const snapshot = await getDocs(usernameQuery);

    if (snapshot.empty) {
      throw new Error("Usuário não encontrado");
    }

    return String(snapshot.docs[0]?.data().email ?? "");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      await ensureAuthPersistence();
      const resolvedEmail = await resolveEmailFromMode();
      await signInWithEmailAndPassword(auth, resolvedEmail, password);
      setFeedback({ type: "success", message: "Login realizado com sucesso ✓" });
      router.replace("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error && !error.message.startsWith("Firebase:")
          ? error.message
          : mapAuthError(error);

      setFeedback({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Entrar"
      description="Acesse com nome de usuário ou e-mail usando a mesma conta Firebase."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link className="text-cyan-200 hover:text-cyan-100" href="/cadastro">
            Cadastrar
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-white/10 bg-white/6 p-1">
          <div className="grid grid-cols-2 gap-1">
            {[
              { label: "Usuário", value: "username" as const },
              { label: "E-mail", value: "email" as const },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setMode(option.value);
                  setIdentifier("");
                  setFeedback(null);
                }}
                className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
                  mode === option.value
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/8"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
            {mode === "username" ? "Usuário" : "E-mail"}
          </label>
          <Input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder={mode === "username" ? "seu.usuario" : "nome@exemplo.com"}
            type={mode === "email" ? "email" : "text"}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
            Senha
          </label>
          <div className="relative">
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              type={showPassword ? "text" : "password"}
              className="pr-12"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 transition hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {feedback ? (
            <motion.div
              key={feedback.message}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="space-y-2"
            >
              <Badge variant={feedback.type === "error" ? "error" : "success"}>
                {feedback.message}
              </Badge>
              <AnimatedMessage
                message={feedback.type === "success" ? "Redirecionando para o dashboard..." : null}
                type="success"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <Button isLoading={isSubmitting} type="submit">
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}

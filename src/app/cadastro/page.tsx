"use client";

import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, query, where, getDocs, collection, serverTimestamp, setDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AnimatedMessage } from "@/components/animated-message";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  emailRegex,
  evaluatePassword,
  isPasswordValid,
  normalizeUsername,
} from "@/lib/auth";
import { auth, db, ensureAuthPersistence } from "@/lib/firebase";

type AvailabilityState = "idle" | "checking" | "available" | "unavailable";
const PHONE_STEP_KEY = "pending-phone-verification";

export default function CadastroPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [usernameState, setUsernameState] = useState<AvailabilityState>("idle");
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailState, setEmailState] = useState<AvailabilityState>("idle");
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = useMemo(() => evaluatePassword(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const confirmPasswordState =
    confirmPassword.length === 0 ? "default" : passwordsMatch ? "success" : "error";
  const usernameNormalized = normalizeUsername(username);
  const isFormValid =
    usernameNormalized.length >= 3 &&
    usernameState === "available" &&
    emailRegex.test(email) &&
    emailState === "available" &&
    isPasswordValid(password) &&
    passwordsMatch;

  async function checkUsernameAvailability() {
    const value = normalizeUsername(username);

    if (!value) {
      setUsernameState("idle");
      setUsernameMessage(null);
      return;
    }

    setUsernameState("checking");
    setUsernameMessage("Verificando disponibilidade...");

    const usernameQuery = query(
      collection(db, "usuarios"),
      where("username", "==", value),
    );

    const snapshot = await getDocs(usernameQuery);

    if (!snapshot.empty) {
      setUsernameState("unavailable");
      setUsernameMessage("Nome de usuário já está em uso, escolha outro");
      return;
    }

    setUsernameState("available");
    setUsernameMessage("Nome de usuário disponível ✓");
  }

  async function checkEmailAvailability() {
    const value = email.trim();

    if (!value) {
      setEmailState("idle");
      setEmailMessage(null);
      return;
    }

    if (!emailRegex.test(value)) {
      setEmailState("unavailable");
      setEmailMessage("Insira um e-mail válido");
      return;
    }

    setEmailState("checking");
    setEmailMessage("Verificando disponibilidade...");

    const methods = await fetchSignInMethodsForEmail(auth, value);

    if (methods.length > 0) {
      setEmailState("unavailable");
      setEmailMessage("E-mail já está em uso, tente outro");
      return;
    }

    setEmailState("available");
    setEmailMessage("E-mail disponível ✓");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    try {
      setSubmitError(null);
      setIsSubmitting(true);
      await ensureAuthPersistence();

      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      await setDoc(doc(db, "usuarios", credential.user.uid), {
        username: usernameNormalized,
        email: email.trim(),
        telefone: null,
        criadoEm: serverTimestamp(),
      });

      window.sessionStorage.setItem(PHONE_STEP_KEY, "true");
      router.replace("/verificar-telefone");
    } catch {
      setSubmitError("Não foi possível concluir o cadastro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Criar conta"
      description="Cadastre usuário, e-mail e senha antes de validar o telefone."
      footer={
        <>
          Já tem conta?{" "}
          <Link className="text-cyan-200 hover:text-cyan-100" href="/login">
            Entrar
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
            Usuário
          </label>
          <Input
            value={username}
            state={
              usernameState === "unavailable"
                ? "error"
                : usernameState === "available"
                  ? "success"
                  : "default"
            }
            onBlur={() => void checkUsernameAvailability()}
            onChange={(event) => {
              setUsername(event.target.value);
              setUsernameState("idle");
              setUsernameMessage(null);
            }}
            placeholder="seu.usuario"
            required
          />
          <AnimatedMessage
            message={usernameMessage}
            type={usernameState === "unavailable" ? "error" : "success"}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
            E-mail
          </label>
          <Input
            value={email}
            type="email"
            state={
              emailState === "unavailable"
                ? "error"
                : emailState === "available"
                  ? "success"
                  : "default"
            }
            onBlur={() => void checkEmailAvailability()}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailState("idle");
              setEmailMessage(null);
            }}
            placeholder="nome@exemplo.com"
            required
          />
          <AnimatedMessage
            message={emailMessage}
            type={emailState === "unavailable" ? "error" : "success"}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
            Senha
          </label>
          <Input
            value={password}
            type="password"
            state={password.length === 0 ? "default" : isPasswordValid(password) ? "success" : "error"}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Crie uma senha forte"
            required
          />
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/6 p-4">
            {passwordChecks.map((rule) => (
              <motion.div
                key={rule.key}
                layout
                className="flex items-center gap-2 text-sm text-slate-200"
              >
                {rule.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                ) : (
                  <CircleX className="h-4 w-4 text-rose-300" />
                )}
                <span>{rule.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
            Confirmar senha
          </label>
          <Input
            value={confirmPassword}
            type="password"
            state={confirmPasswordState}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repita a senha"
            required
          />
          <AnimatedMessage
            message={
              confirmPassword.length === 0
                ? null
                : passwordsMatch
                  ? "As senhas coincidem ✓"
                  : "As senhas precisam ser iguais"
            }
            type={passwordsMatch ? "success" : "error"}
          />
        </div>

        <AnimatePresence mode="wait">
          {submitError ? (
            <motion.div
              key={submitError}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <AnimatedMessage message={submitError} type="error" />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <Button isLoading={isSubmitting} type="submit" disabled={!isFormValid}>
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>
    </AuthShell>
  );
}

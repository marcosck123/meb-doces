"use client";

import {
  linkWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { AnimatedMessage } from "@/components/animated-message";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { digitsOnly, formatPhoneForFirestore, mapAuthError } from "@/lib/auth";
import { auth, db, ensureAuthPersistence } from "@/lib/firebase";

const PHONE_STEP_KEY = "pending-phone-verification";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function VerificarTelefonePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(
    null,
  );
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [smsCode, setSmsCode] = useState(["", "", "", "", "", ""]);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isConfirmingCode, setIsConfirmingCode] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const phoneDigits = useMemo(() => digitsOnly(phone), [phone]);
  const isPhoneValid = phoneDigits.length === 11;

  function formatPhoneMask(value: string) {
    const digits = digitsOnly(value).slice(0, 11);

    if (digits.length <= 2) {
      return digits.length ? `(${digits}` : "";
    }

    if (digits.length <= 3) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  useEffect(() => {
    void ensureAuthPersistence();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || window.recaptchaVerifier) {
      return;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });

    return () => {
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = undefined;
    };
  }, []);

  useEffect(() => {
    if (!confirmationResult) {
      return;
    }

    const code = smsCode.join("");

    if (code.length === 6) {
      void handleConfirmCode(code);
    }
  }, [confirmationResult, smsCode]);

  async function handleSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isPhoneValid) {
      setPhoneError("Número de telefone inválido");
      return;
    }

    try {
      setIsSendingCode(true);
      setPhoneError(null);
      setFeedback(null);

      const verifier = window.recaptchaVerifier;

      if (!verifier) {
        throw new Error("Não foi possível carregar o recaptcha.");
      }

      const fullPhone = `+55${phoneDigits}`;
      if (!user) {
        throw new Error("Sessão inválida. Faça o cadastro novamente.");
      }

      const result = await linkWithPhoneNumber(user, fullPhone, verifier);

      setConfirmationResult(result);
      setFeedback({ type: "success", message: "SMS enviado com sucesso ✓" });
    } catch (error) {
      setFeedback({ type: "error", message: mapAuthError(error) });
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = undefined;
    } finally {
      setIsSendingCode(false);
    }
  }

  async function handleConfirmCode(code: string) {
    if (!confirmationResult || isConfirmingCode) {
      return;
    }

    try {
      setIsConfirmingCode(true);
      setFeedback(null);

      const result = await confirmationResult.confirm(code);
      const uid = result.user.uid;

      await updateDoc(doc(db, "usuarios", uid), {
        telefone: formatPhoneForFirestore(phone),
      });

      window.sessionStorage.removeItem(PHONE_STEP_KEY);
      router.replace("/dashboard");
    } catch (error) {
      setFeedback({ type: "error", message: mapAuthError(error) });
      setSmsCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsConfirmingCode(false);
    }
  }

  function updateCodeAtIndex(index: number, nextValue: string) {
    if (!/^\d?$/.test(nextValue)) {
      return;
    }

    const nextCode = [...smsCode];
    nextCode[index] = nextValue;
    setSmsCode(nextCode);

    if (nextValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  return (
    <AuthShell
      title="Verificar telefone"
      description="Confirme seu número com SMS antes de acessar as rotas internas."
    >
      <form className="space-y-4" onSubmit={handleSendCode}>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
            Número de telefone
          </label>
          <Input
            value={phone}
            onChange={(event) => {
              setPhone(formatPhoneMask(event.target.value));
              setPhoneError(null);
            }}
            onBlur={() => {
              if (phone.length > 0 && !isPhoneValid) {
                setPhoneError("Número de telefone inválido");
              }
            }}
            state={phoneError ? "error" : isPhoneValid ? "success" : "default"}
            placeholder="(11) 9 9999-9999"
            inputMode="numeric"
            required
          />
          <AnimatedMessage message={phoneError} type="error" />
        </div>

        <Button isLoading={isSendingCode} type="submit">
          {isSendingCode ? "Enviando SMS..." : "Enviar código por SMS"}
        </Button>

        <div id="recaptcha-container" />
      </form>

      <AnimatePresence mode="wait">
        {feedback ? (
          <motion.div
            key={feedback.message}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <AnimatedMessage message={feedback.message} type={feedback.type} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {confirmationResult ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 rounded-2xl border border-white/10 bg-white/6 p-4"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              Código SMS
            </p>
            <p className="text-sm text-slate-300">
              Digite os 6 números recebidos no telefone.
            </p>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {smsCode.map((digit, index) => (
              <Input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                value={digit}
                inputMode="numeric"
                maxLength={1}
                className="px-0 text-center text-lg"
                onChange={(event) => updateCodeAtIndex(index, digitsOnly(event.target.value))}
                onKeyDown={(event) => {
                  if (!/^\d$/.test(event.key) && !["Backspace", "Tab", "ArrowLeft", "ArrowRight"].includes(event.key)) {
                    event.preventDefault();
                  }

                  if (event.key === "Backspace" && !smsCode[index] && index > 0) {
                    inputRefs.current[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </div>

          {isConfirmingCode ? (
            <AnimatedMessage
              message="Validando código e concluindo login..."
              type="success"
            />
          ) : null}
        </motion.div>
      ) : null}
    </AuthShell>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [tab, setTab] = useState<"login" | "cadastro">("login");

  return (
    <AuthShell
      title="Acesso ao Sistema"
      description="Escolha como deseja entrar. O fluxo de telefone foi desativado por enquanto."
    >
      <div className="rounded-2xl border border-white/10 bg-white/6 p-1">
        <div className="grid grid-cols-2 gap-1">
          {[
            { key: "login" as const, label: "Login" },
            { key: "cadastro" as const, label: "Cadastro" },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setTab(option.key)}
              className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
                tab === option.key
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-300 hover:bg-white/8"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/6 p-5 text-sm text-slate-200"
      >
        {tab === "login" ? (
          <>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Entrar na conta</h2>
              <p>
                Acesse com seu usuário ou e-mail e senha.
              </p>
            </div>
            <Link href="/login">
              <Button type="button">Ir para login</Button>
            </Link>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Criar conta</h2>
              <p>
                Cadastre usuário, e-mail e senha. A verificação de telefone está desligada por enquanto.
              </p>
            </div>
            <Link href="/cadastro">
              <Button type="button">Ir para cadastro</Button>
            </Link>
          </>
        )}
      </motion.div>
    </AuthShell>
  );
}

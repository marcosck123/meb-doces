import type { Metadata } from "next";

import { AuthGate } from "@/components/auth-gate";

import "./globals.css";

export const metadata: Metadata = {
  title: "Auth Firebase",
  description: "Fluxo de autenticação com Firebase Auth e Firestore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 font-sans antialiased">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}

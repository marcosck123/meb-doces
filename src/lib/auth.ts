import type { AuthError } from "firebase/auth";

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordRules = [
  {
    key: "length",
    label: "Mínimo de 8 caracteres",
    test: (value: string) => value.length >= 8,
  },
  {
    key: "lowercase",
    label: "1 letra minúscula",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    key: "uppercase",
    label: "1 letra maiúscula",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    key: "number",
    label: "1 número",
    test: (value: string) => /\d/.test(value),
  },
  {
    key: "special",
    label: "1 caractere especial",
    test: (value: string) => /[!@#$%&*()_+\-=\[\]{}]/.test(value),
  },
] as const;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function evaluatePassword(value: string) {
  return passwordRules.map((rule) => ({
    ...rule,
    valid: rule.test(value),
  }));
}

export function isPasswordValid(value: string) {
  return evaluatePassword(value).every((rule) => rule.valid);
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhoneForFirestore(value: string) {
  const digits = digitsOnly(value);
  return digits.length === 11 ? `55${digits}` : "";
}

export function mapAuthError(error: unknown) {
  const code = (error as AuthError | undefined)?.code;

  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Senha incorreta";
    case "auth/user-not-found":
      return "Usuário não encontrado";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde";
    case "auth/email-already-in-use":
      return "E-mail já está em uso, tente outro";
    case "auth/invalid-verification-code":
      return "Código incorreto, tente novamente";
    case "auth/invalid-phone-number":
      return "Número de telefone inválido";
    default:
      return "Não foi possível concluir a autenticação. Tente novamente.";
  }
}

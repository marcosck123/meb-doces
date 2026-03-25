import { z } from "https://cdn.jsdelivr.net/npm/zod@3.24.2/+esm";

function parseNumeroDecimal(valor) {
  if (typeof valor === "number") {
    return valor;
  }

  if (typeof valor !== "string") {
    return valor;
  }

  const texto = valor.trim().replace(",", ".");

  if (!texto) {
    return Number.NaN;
  }

  return Number(texto);
}

function parseNumeroInteiro(valor) {
  if (typeof valor === "number") {
    return valor;
  }

  if (typeof valor !== "string") {
    return valor;
  }

  const texto = valor.trim();

  if (!texto) {
    return undefined;
  }

  return Number(texto);
}

export const produtoSchema = z.object({
  nome: z.string().trim().min(3, "Informe ao menos 3 caracteres."),
  preco: z.preprocess(
    parseNumeroDecimal,
    z.number({ invalid_type_error: "Informe um preco valido." }).positive("O preco deve ser maior que zero."),
  ),
  categoria: z.preprocess(
    (valor) => {
      if (typeof valor !== "string") {
        return valor;
      }

      const texto = valor.trim();
      return texto ? texto : undefined;
    },
    z.string().optional(),
  ),
  estoque: z.preprocess(
    parseNumeroInteiro,
    z
      .number({ invalid_type_error: "Informe um estoque valido." })
      .int("O estoque deve ser um numero inteiro.")
      .min(0, "O estoque nao pode ser negativo.")
      .optional(),
  ),
});

export function formatarErrosZod(error) {
  return error.issues.reduce((acc, issue) => {
    const campo = issue.path[0];

    if (campo && !acc[campo]) {
      acc[campo] = issue.message;
    }

    return acc;
  }, {});
}

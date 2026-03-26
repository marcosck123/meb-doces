export function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function gerarId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function parseNumero(valor) {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : Number.NaN;
  }

  const texto = String(valor ?? "").trim();

  if (!texto) {
    return Number.NaN;
  }

  const temVirgula = texto.includes(",");
  const temPonto = texto.includes(".");

  if (temVirgula && temPonto) {
    return Number(texto.replaceAll(".", "").replace(",", "."));
  }

  if (temVirgula) {
    return Number(texto.replace(",", "."));
  }

  return Number(texto);
}

export function parseNumeroOpcional(valor) {
  const texto = String(valor ?? "").trim();
  return texto ? parseNumero(texto) : undefined;
}

export function normalizarTexto(valor = "") {
  return String(valor ?? "").trim();
}

export function normalizarChave(valor = "") {
  return normalizarTexto(valor).toLocaleLowerCase("pt-BR");
}

export function debounce(funcao, atraso = 300) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      funcao(...args);
    }, atraso);
  };
}

export function escapeHtml(texto = "") {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatarDataHora(data) {
  return new Date(data).toLocaleString("pt-BR");
}

export function delay(ms = 350) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

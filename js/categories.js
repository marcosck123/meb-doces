import { carregarLocalStorage, salvarLocalStorage } from "./storage.js";
import { gerarId, normalizarChave, normalizarTexto } from "./utils.js";

const STORAGE_PLATAFORMAS = "plataformas";
const STORAGE_MERCADOS = "mercados";

function normalizarPlataforma(plataforma = {}) {
  return {
    id: plataforma.id || gerarId(),
    nome: normalizarTexto(plataforma.nome),
    cobraTaxa: Boolean(plataforma.cobraTaxa),
    taxa: plataforma.cobraTaxa ? Number(plataforma.taxa) || 0 : 0,
  };
}

function normalizarMercado(mercado = {}) {
  return {
    id: mercado.id || gerarId(),
    nome: normalizarTexto(mercado.nome),
  };
}

let plataformas = carregarLocalStorage(STORAGE_PLATAFORMAS, []).map(normalizarPlataforma);
let mercados = carregarLocalStorage(STORAGE_MERCADOS, []).map(normalizarMercado);

function persistirPlataformas() {
  salvarLocalStorage(STORAGE_PLATAFORMAS, plataformas);
}

function persistirMercados() {
  salvarLocalStorage(STORAGE_MERCADOS, mercados);
}

function validarNomeDuplicado(lista, nome, idIgnorado = "") {
  const chave = normalizarChave(nome);
  return lista.some((item) => normalizarChave(item.nome) === chave && item.id !== idIgnorado);
}

export function listarPlataformas() {
  return [...plataformas].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function listarMercados() {
  return [...mercados].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function obterPlataformaPorId(id) {
  return plataformas.find((plataforma) => plataforma.id === id) ?? null;
}

export function obterMercadoPorId(id) {
  return mercados.find((mercado) => mercado.id === id) ?? null;
}

export function salvarPlataforma({ id, nome, cobraTaxa, taxa }) {
  const nomeNormalizado = normalizarTexto(nome);

  if (!nomeNormalizado) {
    throw new Error("Informe o nome da plataforma.");
  }

  if (validarNomeDuplicado(plataformas, nomeNormalizado, id)) {
    throw new Error("Ja existe uma plataforma com esse nome.");
  }

  if (cobraTaxa && !(Number(taxa) >= 0)) {
    throw new Error("Informe a taxa da plataforma.");
  }

  const plataforma = normalizarPlataforma({
    id: id || gerarId(),
    nome: nomeNormalizado,
    cobraTaxa,
    taxa,
  });

  plataformas = id
    ? plataformas.map((item) => (item.id === id ? plataforma : item))
    : [plataforma, ...plataformas];

  persistirPlataformas();
  return plataforma;
}

export function excluirPlataforma(id) {
  plataformas = plataformas.filter((plataforma) => plataforma.id !== id);
  persistirPlataformas();
}

export function salvarMercado({ id, nome }) {
  const nomeNormalizado = normalizarTexto(nome);

  if (!nomeNormalizado) {
    throw new Error("Informe o nome do mercado.");
  }

  if (validarNomeDuplicado(mercados, nomeNormalizado, id)) {
    throw new Error("Ja existe um mercado com esse nome.");
  }

  const mercado = normalizarMercado({
    id: id || gerarId(),
    nome: nomeNormalizado,
  });

  mercados = id
    ? mercados.map((item) => (item.id === id ? mercado : item))
    : [mercado, ...mercados];

  persistirMercados();
  return mercado;
}

export function excluirMercado(id) {
  mercados = mercados.filter((mercado) => mercado.id !== id);
  persistirMercados();
}

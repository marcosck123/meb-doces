import { carregarLocalStorage, salvarLocalStorage } from "./storage.js";
import {
  atualizarCategoriaNosProdutos,
  contarProdutosPorCategoria,
  limparCategoriaDosProdutos,
} from "./products.js";

const STORAGE_KEY = "categorias";

function normalizarCategoria(nome) {
  return String(nome ?? "").trim();
}

function obterChaveComparacao(nome) {
  return normalizarCategoria(nome).toLocaleLowerCase("pt-BR");
}

let categorias = carregarLocalStorage(STORAGE_KEY, [])
  .map(normalizarCategoria)
  .filter(Boolean)
  .filter((categoria, index, lista) => (
    lista.findIndex((item) => obterChaveComparacao(item) === obterChaveComparacao(categoria)) === index
  ));

function persistir() {
  salvarLocalStorage(STORAGE_KEY, categorias);
}

export function carregarCategorias() {
  return [...categorias];
}

export function salvarCategorias() {
  persistir();
}

export function listarCategorias() {
  return [...categorias];
}

export function existeCategoriaDuplicada(nome, ignorarNome = "") {
  const chave = obterChaveComparacao(nome);
  const chaveIgnorada = obterChaveComparacao(ignorarNome);

  return categorias.some((categoria) => {
    const chaveCategoria = obterChaveComparacao(categoria);
    return chaveCategoria === chave && chaveCategoria !== chaveIgnorada;
  });
}

export function adicionarCategoria(nome) {
  const categoria = normalizarCategoria(nome);

  if (categoria.length < 3) {
    throw new Error("Informe uma categoria com ao menos 3 caracteres.");
  }

  if (existeCategoriaDuplicada(categoria)) {
    throw new Error("Ja existe uma categoria com esse nome.");
  }

  categorias = [...categorias, categoria].sort((a, b) => a.localeCompare(b, "pt-BR"));
  persistir();

  return categoria;
}

export function editarCategoria(nomeAtual, novoNome) {
  const categoriaAtual = normalizarCategoria(nomeAtual);
  const categoriaNova = normalizarCategoria(novoNome);

  if (!categoriaAtual) {
    throw new Error("Categoria nao encontrada.");
  }

  if (categoriaNova.length < 3) {
    throw new Error("Informe uma categoria com ao menos 3 caracteres.");
  }

  if (existeCategoriaDuplicada(categoriaNova, categoriaAtual)) {
    throw new Error("Ja existe uma categoria com esse nome.");
  }

  categorias = categorias
    .map((categoria) => (categoria === categoriaAtual ? categoriaNova : categoria))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

  atualizarCategoriaNosProdutos(categoriaAtual, categoriaNova);
  persistir();

  return categoriaNova;
}

export function removerCategoria(nome) {
  const categoria = normalizarCategoria(nome);

  categorias = categorias.filter((item) => item !== categoria);
  limparCategoriaDosProdutos(categoria);
  persistir();
}

export function obterResumoCategorias() {
  return categorias.map((categoria) => ({
    nome: categoria,
    quantidadeProdutos: contarProdutosPorCategoria(categoria),
  }));
}

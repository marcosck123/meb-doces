import { carregarLocalStorage, salvarLocalStorage } from "./storage.js";
import { gerarId } from "./utils.js";

const STORAGE_KEY = "crud_produtos";

function normalizarProdutoPersistido(produto) {
  return {
    ...produto,
    nome: typeof produto.nome === "string" ? produto.nome.trim() : "",
    preco: Number(produto.preco) || 0,
    categoria: typeof produto.categoria === "string" ? produto.categoria.trim() : "",
    estoque:
      produto.estoque === undefined || produto.estoque === null || produto.estoque === ""
        ? undefined
        : Number(produto.estoque),
    criadoEm: Number(produto.criadoEm) || Date.now(),
  };
}

let produtos = carregarLocalStorage(STORAGE_KEY, []).map(normalizarProdutoPersistido);

function persistir() {
  salvarLocalStorage(STORAGE_KEY, produtos);
}

export function listarProdutos() {
  return [...produtos];
}

export function buscarProdutos(termo = "") {
  const busca = termo.trim().toLowerCase();

  if (!busca) {
    return listarProdutos();
  }

  return produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca),
  );
}

export function ordenarProdutos(lista, criterio = "recentes") {
  const produtosOrdenados = [...lista];

  switch (criterio) {
    case "menor-preco":
      produtosOrdenados.sort((a, b) => a.preco - b.preco);
      break;
    case "maior-preco":
      produtosOrdenados.sort((a, b) => b.preco - a.preco);
      break;
    case "nome":
      produtosOrdenados.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      break;
    default:
      produtosOrdenados.sort((a, b) => b.criadoEm - a.criadoEm);
  }

  return produtosOrdenados;
}

export function obterProdutosFiltrados({ busca = "", ordenacao = "recentes" } = {}) {
  return ordenarProdutos(buscarProdutos(busca), ordenacao);
}

export function obterProdutoPorId(id) {
  return produtos.find((produto) => produto.id === id) ?? null;
}

export function adicionarProduto({ nome, preco, categoria, estoque }) {
  const produto = {
    id: gerarId(),
    nome: nome.trim(),
    preco: Number(preco),
    categoria: categoria?.trim() ?? "",
    estoque: estoque === undefined ? undefined : Number(estoque),
    criadoEm: Date.now(),
  };

  produtos = [produto, ...produtos];
  persistir();

  return produto;
}

export function editarProduto(id, dadosAtualizados) {
  const produtoAtual = obterProdutoPorId(id);

  if (!produtoAtual) {
    return null;
  }

  const produtoAtualizado = {
    ...produtoAtual,
    ...dadosAtualizados,
    nome: dadosAtualizados.nome.trim(),
    preco: Number(dadosAtualizados.preco),
    categoria: dadosAtualizados.categoria?.trim() ?? "",
    estoque: dadosAtualizados.estoque === undefined ? undefined : Number(dadosAtualizados.estoque),
  };

  produtos = produtos.map((produto) =>
    produto.id === id ? produtoAtualizado : produto,
  );
  persistir();

  return produtoAtualizado;
}

export function removerProduto(id) {
  produtos = produtos.filter((produto) => produto.id !== id);
  persistir();
}

export function calcularTotal(lista = produtos) {
  return lista.reduce((total, produto) => total + produto.preco, 0);
}

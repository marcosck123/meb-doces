import { carregarLocalStorage, salvarLocalStorage } from "./storage.js";
import { gerarId, normalizarChave, normalizarTexto, parseNumeroOpcional } from "./utils.js";

const STORAGE_KEY = "produtos";

function normalizarProdutoPersistido(produto = {}) {
  return {
    id: produto.id || gerarId(),
    nome: normalizarTexto(produto.nome),
    quantidadeEstoque: Number(produto.quantidadeEstoque) || 0,
    unidade: normalizarTexto(produto.unidade),
    custoMedio: Number(produto.custoMedio) || 0,
    ultimaEntradaValor: Number(produto.ultimaEntradaValor) || 0,
    ultimoMercado: normalizarTexto(produto.ultimoMercado),
    criadoEm: produto.criadoEm || new Date().toISOString(),
    atualizadoEm: produto.atualizadoEm || new Date().toISOString(),
  };
}

let produtos = carregarLocalStorage(STORAGE_KEY, []).map(normalizarProdutoPersistido);

function persistir() {
  salvarLocalStorage(STORAGE_KEY, produtos);
}

function compararNome(nomeA, nomeB) {
  return normalizarChave(nomeA) === normalizarChave(nomeB);
}

export function listarProdutos() {
  return [...produtos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function obterProdutoPorId(id) {
  return produtos.find((produto) => produto.id === id) ?? null;
}

export function obterProdutoPorNome(nome) {
  return produtos.find((produto) => compararNome(produto.nome, nome)) ?? null;
}

export function buscarProdutos(termo = "") {
  const busca = normalizarChave(termo);

  if (!busca) {
    return listarProdutos();
  }

  return listarProdutos().filter((produto) => normalizarChave(produto.nome).includes(busca));
}

export function criarProduto({ nome, unidade = "", quantidadeEstoque = 0, custoMedio = 0, ultimoMercado = "" }) {
  const produto = normalizarProdutoPersistido({
    id: gerarId(),
    nome,
    unidade,
    quantidadeEstoque,
    custoMedio,
    ultimaEntradaValor: custoMedio,
    ultimoMercado,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  });

  produtos = [produto, ...produtos];
  persistir();

  return produto;
}

export function criarOuObterProduto({ nome, unidade = "", quantidadeEstoque = 0, custoMedio = 0, ultimoMercado = "" }) {
  const existente = obterProdutoPorNome(nome);

  if (existente) {
    return existente;
  }

  return criarProduto({ nome, unidade, quantidadeEstoque, custoMedio, ultimoMercado });
}

export function atualizarProduto(id, dadosAtualizados) {
  const produtoAtual = obterProdutoPorId(id);

  if (!produtoAtual) {
    return null;
  }

  const produtoAtualizado = normalizarProdutoPersistido({
    ...produtoAtual,
    ...dadosAtualizados,
    atualizadoEm: new Date().toISOString(),
  });

  produtos = produtos.map((produto) => (produto.id === id ? produtoAtualizado : produto));
  persistir();

  return produtoAtualizado;
}

export function removerProduto(id) {
  produtos = produtos.filter((produto) => produto.id !== id);
  persistir();
}

export function registrarEntradaNoProduto({
  produtoId,
  nomeProduto,
  valorPago,
  quantidade,
  unidade = "",
  mercado = "",
}) {
  const valor = Number(valorPago);
  const quantidadeInformada = parseNumeroOpcional(quantidade);
  const quantidadeEntrada = quantidadeInformada && quantidadeInformada > 0 ? quantidadeInformada : 1;

  let produto = produtoId ? obterProdutoPorId(produtoId) : null;

  if (!produto && nomeProduto) {
    produto = criarOuObterProduto({
      nome: nomeProduto,
      unidade,
      quantidadeEstoque: 0,
      custoMedio: 0,
      ultimoMercado: mercado,
    });
  }

  if (!produto) {
    throw new Error("Produto nao encontrado.");
  }

  const quantidadeAtual = Number(produto.quantidadeEstoque) || 0;
  const custoAtualTotal = (Number(produto.custoMedio) || 0) * quantidadeAtual;
  const novaQuantidade = quantidadeAtual + quantidadeEntrada;
  const novoCustoMedio = novaQuantidade > 0 ? (custoAtualTotal + valor) / novaQuantidade : valor;

  return atualizarProduto(produto.id, {
    unidade: unidade || produto.unidade,
    quantidadeEstoque: novaQuantidade,
    custoMedio: novoCustoMedio,
    ultimaEntradaValor: valor,
    ultimoMercado: mercado || produto.ultimoMercado,
  });
}

export function calcularValorTotalEstoque(lista = produtos) {
  return lista.reduce((total, produto) => total + (Number(produto.custoMedio) || 0) * (Number(produto.quantidadeEstoque) || 0), 0);
}

export function contarProdutosBaixoEstoque(limite = 3) {
  return produtos.filter((produto) => Number(produto.quantidadeEstoque) > 0 && Number(produto.quantidadeEstoque) <= limite).length;
}

import { carregarLocalStorage, salvarLocalStorage } from "./storage.js";
import { listarMercados, obterMercadoPorId } from "./categories.js";
import { listarProdutos, registrarEntradaNoProduto } from "./products.js";
import { gerarId, normalizarTexto, parseNumero, parseNumeroOpcional } from "./utils.js";

const STORAGE_KEY = "entradas";

function normalizarEntrada(entrada = {}) {
  return {
    id: entrada.id || gerarId(),
    data: entrada.data || new Date().toISOString(),
    produto: normalizarTexto(entrada.produto),
    mercado: normalizarTexto(entrada.mercado),
    valorPago: Number(entrada.valorPago) || 0,
    medida: normalizarTexto(entrada.medida),
    quantidade: entrada.quantidade === undefined ? undefined : Number(entrada.quantidade),
  };
}

let entradas = carregarLocalStorage(STORAGE_KEY, []).map(normalizarEntrada);

function persistir() {
  salvarLocalStorage(STORAGE_KEY, entradas);
}

export function listarEntradas() {
  return [...entradas].sort((a, b) => new Date(b.data) - new Date(a.data));
}

export function obterOpcoesProdutoEntrada() {
  return listarProdutos();
}

export function obterOpcoesMercadoEntrada() {
  return listarMercados();
}

export function registrarEntradaItem({
  produtoId = "",
  nomeProdutoNovo = "",
  mercadoId = "",
  valorPago,
  medida = "",
  quantidade = "",
}) {
  const valor = parseNumero(valorPago);
  const nomeNovo = normalizarTexto(nomeProdutoNovo);
  const mercado = mercadoId ? obterMercadoPorId(mercadoId) : null;
  const quantidadeNumerica = parseNumeroOpcional(quantidade);

  if (!produtoId && !nomeNovo) {
    throw new Error("Selecione um produto existente ou informe um nome novo.");
  }

  if (!mercado) {
    throw new Error("Selecione um mercado.");
  }

  if (!(valor > 0)) {
    throw new Error("Informe o valor pago pelo produto.");
  }

  if (medida && !(quantidadeNumerica > 0)) {
    throw new Error("Informe a quantidade para a medida selecionada.");
  }

  const produtoAtualizado = registrarEntradaNoProduto({
    produtoId,
    nomeProduto: nomeNovo,
    valorPago: valor,
    quantidade: medida ? quantidadeNumerica : 1,
    unidade: medida,
    mercado: mercado.nome,
  });

  const entrada = normalizarEntrada({
    id: gerarId(),
    data: new Date().toISOString(),
    produto: produtoAtualizado.nome,
    mercado: mercado.nome,
    valorPago: valor,
    medida,
    quantidade: medida ? quantidadeNumerica : undefined,
  });

  entradas = [entrada, ...entradas];
  persistir();

  return {
    entrada,
    produto: produtoAtualizado,
  };
}

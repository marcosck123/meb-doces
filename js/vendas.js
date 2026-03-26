import { carregarLocalStorage, salvarLocalStorage } from "./storage.js";
import { obterPlataformaPorId, listarPlataformas } from "./categories.js";
import { listarProdutos, obterProdutoPorId } from "./products.js";
import { registrarEntradaCarteira } from "./carteira.js";
import { gerarId, normalizarTexto, parseNumero } from "./utils.js";

const STORAGE_KEY = "vendas";

function normalizarVenda(venda = {}) {
  return {
    id: venda.id || gerarId(),
    data: venda.data || new Date().toISOString(),
    produto: normalizarTexto(venda.produto),
    plataforma: normalizarTexto(venda.plataforma),
    taxaAplicada: Number(venda.taxaAplicada) || 0,
    precoVenda: Number(venda.precoVenda) || 0,
    valorFinal: Number(venda.valorFinal) || 0,
  };
}

let vendas = carregarLocalStorage(STORAGE_KEY, []).map(normalizarVenda);

function persistir() {
  salvarLocalStorage(STORAGE_KEY, vendas);
}

export function listarVendas() {
  return [...vendas].sort((a, b) => new Date(b.data) - new Date(a.data));
}

export function obterOpcoesVenda() {
  return {
    produtos: listarProdutos(),
    plataformas: listarPlataformas(),
  };
}

export function calcularResumoVenda(plataformaId, precoVenda) {
  const plataforma = plataformaId ? obterPlataformaPorId(plataformaId) : null;
  const preco = parseNumero(precoVenda);
  const taxa = plataforma?.cobraTaxa ? Number(plataforma.taxa) || 0 : 0;

  if (!(preco > 0)) {
    return null;
  }

  const desconto = preco * (taxa / 100);
  const valorFinal = preco - desconto;

  return {
    plataforma,
    precoVenda: preco,
    taxaAplicada: taxa,
    desconto,
    valorFinal,
  };
}

export function registrarVenda({ produtoId, plataformaId, precoVenda }) {
  const produto = obterProdutoPorId(produtoId);
  const plataforma = obterPlataformaPorId(plataformaId);
  const resumo = calcularResumoVenda(plataformaId, precoVenda);

  if (!produto) {
    throw new Error("Selecione um produto.");
  }

  if (!plataforma) {
    throw new Error("Selecione uma plataforma.");
  }

  if (!resumo) {
    throw new Error("Informe um preco de venda valido.");
  }

  const venda = normalizarVenda({
    id: gerarId(),
    data: new Date().toISOString(),
    produto: produto.nome,
    plataforma: plataforma.nome,
    taxaAplicada: resumo.taxaAplicada,
    precoVenda: resumo.precoVenda,
    valorFinal: resumo.valorFinal,
  });

  vendas = [venda, ...vendas];
  persistir();

  registrarEntradaCarteira({
    categoria: "Venda de Produto",
    descricao: `Venda - ${produto.nome} - ${plataforma.nome}`,
    valor: resumo.valorFinal,
    bolso: "banco",
    data: venda.data,
  });

  return venda;
}

import { carregarLocalStorage, salvarLocalStorage } from "./storage.js";
import { gerarId, normalizarTexto } from "./utils.js";

const STORAGE_KEY = "carteira";
const INFO_KEY = "cartaoInfo";

const carteiraPadrao = {
  banco: 0,
  caixa: 0,
  transacoes: [],
};

const cartaoInfoPadrao = {
  nomeNegocio: "Minha Empresa",
  responsavel: "Responsavel",
  documento: "",
  telefone: "",
  observacoes: "",
};

function normalizarTransacao(transacao = {}) {
  return {
    id: transacao.id || gerarId(),
    tipo: transacao.tipo === "saida" ? "saida" : "entrada",
    categoria: normalizarTexto(transacao.categoria) || "Outro",
    descricao: normalizarTexto(transacao.descricao),
    valor: Number(transacao.valor) || 0,
    bolso: transacao.bolso === "caixa" ? "caixa" : "banco",
    data: transacao.data || new Date().toISOString(),
  };
}

function normalizarCarteira(valor = carteiraPadrao) {
  return {
    banco: Number(valor.banco) || 0,
    caixa: Number(valor.caixa) || 0,
    transacoes: Array.isArray(valor.transacoes) ? valor.transacoes.map(normalizarTransacao) : [],
  };
}

let carteira = normalizarCarteira(carregarLocalStorage(STORAGE_KEY, carteiraPadrao));
let cartaoInfo = {
  ...cartaoInfoPadrao,
  ...carregarLocalStorage(INFO_KEY, cartaoInfoPadrao),
};

function persistirCarteira() {
  salvarLocalStorage(STORAGE_KEY, carteira);
}

function persistirCartaoInfo() {
  salvarLocalStorage(INFO_KEY, cartaoInfo);
}

function aplicarTransacaoAoSaldo({ tipo, bolso, valor }) {
  const saldoAtual = Number(carteira[bolso]) || 0;

  if (tipo === "saida" && saldoAtual < valor) {
    throw new Error(`Saldo insuficiente no ${bolso}.`);
  }

  carteira[bolso] = tipo === "saida" ? saldoAtual - valor : saldoAtual + valor;
}

export function obterCarteira() {
  return {
    ...carteira,
    saldoTotal: (Number(carteira.banco) || 0) + (Number(carteira.caixa) || 0),
  };
}

export function obterCartaoInfo() {
  return { ...cartaoInfo };
}

export function atualizarCartaoInfo(campo, valor) {
  if (!(campo in cartaoInfo)) {
    return obterCartaoInfo();
  }

  cartaoInfo = {
    ...cartaoInfo,
    [campo]: normalizarTexto(valor),
  };
  persistirCartaoInfo();
  return obterCartaoInfo();
}

export function registrarTransacao({ tipo, categoria, descricao = "", valor, bolso, data }) {
  const valorNumerico = Number(valor);

  if (!(valorNumerico > 0)) {
    throw new Error("Informe um valor valido.");
  }

  if (!["banco", "caixa"].includes(bolso)) {
    throw new Error("Selecione Banco ou Caixa.");
  }

  const transacao = normalizarTransacao({
    id: gerarId(),
    tipo,
    categoria,
    descricao,
    valor: valorNumerico,
    bolso,
    data: data || new Date().toISOString(),
  });

  aplicarTransacaoAoSaldo(transacao);
  carteira.transacoes = [transacao, ...carteira.transacoes].slice(0, 100);
  persistirCarteira();

  return transacao;
}

export function registrarEntradaCarteira(dados) {
  return registrarTransacao({
    ...dados,
    tipo: "entrada",
  });
}

export function registrarSaidaCarteira(dados) {
  return registrarTransacao({
    ...dados,
    tipo: "saida",
  });
}

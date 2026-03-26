import { mostrarToast } from "../../components/toast.js";
import { renderProductCard } from "../../components/card.js";
import { listarProdutos, buscarProdutos, removerProduto, calcularValorTotalEstoque } from "../../js/products.js";
import { listarEntradas, registrarEntradaItem } from "../../js/entradas.js";
import { listarMercados } from "../../js/categories.js";
import { abrirModal, fecharModal, limparErrosFormulario, aplicarErrosFormulario } from "../../js/ui.js";
import { escapeHtml, formatarDataHora, formatarMoeda } from "../../js/utils.js";

const state = {
  busca: "",
};

function renderEntradaModal() {
  const produtos = listarProdutos();
  const mercados = listarMercados();

  return `
    <form id="entrada-form" class="form-fields" novalidate>
      <div class="field-group" data-field="produtoId">
        <label for="entrada-produto">Produto existente</label>
        <select id="entrada-produto" name="produtoId">
          <option value="">Selecionar depois / cadastrar novo</option>
          ${produtos.map((produto) => `<option value="${produto.id}">${escapeHtml(produto.nome)}</option>`).join("")}
        </select>
        <p class="field-error" data-error-for="produtoId"></p>
      </div>

      <div class="field-group" data-field="nomeProdutoNovo">
        <label for="entrada-produto-novo">Ou digite um produto novo</label>
        <input id="entrada-produto-novo" name="nomeProdutoNovo" type="text" placeholder="Ex: Frango" />
        <p class="field-error" data-error-for="nomeProdutoNovo"></p>
      </div>

      <div class="field-group" data-field="mercadoId">
        <label for="entrada-mercado">Mercado/Fornecedor</label>
        <select id="entrada-mercado" name="mercadoId">
          <option value="">Selecione</option>
          ${mercados.map((mercado) => `<option value="${mercado.id}">${escapeHtml(mercado.nome)}</option>`).join("")}
        </select>
        <p class="field-error" data-error-for="mercadoId"></p>
      </div>

      <div class="field-group" data-field="valorPago">
        <label for="entrada-valor">Valor pago pelo produto (R$)</label>
        <input id="entrada-valor" name="valorPago" type="text" inputmode="decimal" placeholder="Ex: 25,90" />
        <p class="field-error" data-error-for="valorPago"></p>
      </div>

      <div class="field-group" data-field="medida">
        <label for="entrada-medida">Medida/Unidade</label>
        <select id="entrada-medida" name="medida">
          <option value="">Sem medida</option>
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="ml">ml</option>
          <option value="L">L</option>
          <option value="Unidade">Unidade</option>
        </select>
        <p class="field-error" data-error-for="medida"></p>
      </div>

      <div class="field-group hidden" data-field="quantidade">
        <label for="entrada-quantidade">Quantidade</label>
        <input id="entrada-quantidade" name="quantidade" type="text" inputmode="decimal" placeholder="Ex: 2,5" />
        <p class="field-error" data-error-for="quantidade"></p>
      </div>

      <div class="form-actions">
        <button class="button button-primary" type="submit">Registrar Entrada</button>
      </div>
    </form>
  `;
}

function renderEntradasRecentes() {
  const entradas = listarEntradas().slice(0, 5);

  if (!entradas.length) {
    return '<div class="empty-state"><p>Nenhuma entrada registrada ainda.</p></div>';
  }

  return entradas.map((entrada) => `
    <article class="mini-history-card">
      <div>
        <strong>${escapeHtml(entrada.produto)}</strong>
        <p>${escapeHtml(entrada.mercado)} · ${escapeHtml(formatarDataHora(entrada.data))}</p>
      </div>
      <div class="history-card-side">
        <strong>${formatarMoeda(entrada.valorPago)}</strong>
        <span>${entrada.medida ? `${entrada.quantidade} ${escapeHtml(entrada.medida)}` : "Sem medida"}</span>
      </div>
    </article>
  `).join("");
}

function obterListaAtual() {
  return state.busca ? buscarProdutos(state.busca) : listarProdutos();
}

function atualizarLista() {
  const lista = obterListaAtual();
  const listaElement = document.querySelector("#product-list");
  const totalElement = document.querySelector("#stock-total-value");
  const countElement = document.querySelector("#stock-count");

  if (listaElement) {
    listaElement.innerHTML = lista.length
      ? lista.map(renderProductCard).join("")
      : '<div class="empty-state"><p>Nenhum item encontrado.</p></div>';
  }

  if (totalElement) {
    totalElement.textContent = formatarMoeda(calcularValorTotalEstoque(lista));
  }

  if (countElement) {
    countElement.textContent = `${lista.length} item(ns)`;
  }
}

function abrirModalEntrada() {
  if (!listarMercados().length) {
    mostrarToast("Cadastre ao menos um mercado antes de registrar entradas.", "error");
    window.location.hash = "#/mercados";
    return;
  }

  abrirModal({
    titulo: "Registrar Entrada de Item",
    descricao: "Toda movimentacao de estoque passa por este checkout.",
    conteudo: renderEntradaModal(),
    onOpen(root) {
      const form = root.querySelector("#entrada-form");
      const selectMedida = root.querySelector("#entrada-medida");
      const campoQuantidade = root.querySelector('[data-field="quantidade"]');

      selectMedida?.addEventListener("change", () => {
        campoQuantidade?.classList.toggle("hidden", !selectMedida.value);
      });

      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        limparErrosFormulario(form);

        const formData = new FormData(form);
        const dados = Object.fromEntries(formData.entries());

        try {
          const { produto } = registrarEntradaItem(dados);
          fecharModal();
          atualizarLista();
          const historico = document.querySelector("#entries-history");
          if (historico) {
            historico.innerHTML = renderEntradasRecentes();
          }
          mostrarToast(`Entrada registrada para ${produto.nome}.`, "success");
        } catch (error) {
          const mensagem = error.message || "Nao foi possivel registrar a entrada.";
          const erros = {};

          if (mensagem.includes("produto")) erros.nomeProdutoNovo = mensagem;
          if (mensagem.includes("mercado")) erros.mercadoId = mensagem;
          if (mensagem.includes("valor")) erros.valorPago = mensagem;
          if (mensagem.includes("quantidade")) erros.quantidade = mensagem;

          aplicarErrosFormulario(form, erros);
          mostrarToast(mensagem, "error");
        }
      });
    },
  });
}

export function renderProdutos() {
  const lista = obterListaAtual();
  const valorEstoque = calcularValorTotalEstoque(lista);

  return `
    <section class="page-grid products-layout inventory-layout">
      <div class="stack-layout">
        <article class="panel">
          <div class="section-header">
            <div>
              <h1 class="section-title">Estoque</h1>
              <p class="panel-subtitle">O cadastro direto saiu. Agora toda entrada acontece por checkout modal.</p>
            </div>
            <button class="button button-primary" type="button" id="open-entry-modal">
              Registrar Entrada de Item
            </button>
          </div>

          <div class="summary-grid compact-summary">
            <article class="stat-card">
              <p class="stat-label">Itens cadastrados</p>
              <p class="stat-value" id="stock-count">${lista.length} item(ns)</p>
            </article>
            <article class="stat-card">
              <p class="stat-label">Valor total do estoque</p>
              <p class="stat-value" id="stock-total-value">${formatarMoeda(valorEstoque)}</p>
            </article>
          </div>

          <div class="toolbar">
            <input id="search-product" type="text" placeholder="Buscar item do estoque..." value="${escapeHtml(state.busca)}" />
            <button class="button button-secondary" type="button" data-stock-shortcut="mercados">Gerenciar Mercados</button>
          </div>
        </article>

        <article class="panel">
          <div class="section-header">
            <div>
              <h2 class="section-title">Ultimas Entradas</h2>
              <p class="panel-subtitle">Historico recente de compras e reposicoes.</p>
            </div>
          </div>
          <div id="entries-history" class="history-list">
            ${renderEntradasRecentes()}
          </div>
        </article>
      </div>

      <article class="panel">
        <div class="list-header">
          <div>
            <h2 class="section-title">Produtos cadastrados</h2>
            <p class="panel-subtitle">Lista viva do estoque atual.</p>
          </div>
        </div>
        <div id="product-list" class="product-list">
          ${lista.length ? lista.map(renderProductCard).join("") : '<div class="empty-state"><p>Nenhum produto cadastrado ainda.</p></div>'}
        </div>
      </article>
    </section>
  `;
}

export function bindProdutosEvents() {
  document.querySelector("#open-entry-modal")?.addEventListener("click", abrirModalEntrada);
  document.querySelector("#search-product")?.addEventListener("input", (event) => {
    state.busca = event.target.value;
    atualizarLista();
  });

  document.querySelector("[data-stock-shortcut='mercados']")?.addEventListener("click", () => {
    window.location.hash = "#/mercados";
  });

  document.querySelector("#product-list")?.addEventListener("click", (event) => {
    const botao = event.target.closest("[data-action='remover']");

    if (!botao) {
      return;
    }

    const confirmou = window.confirm("Deseja realmente excluir este item do estoque?");

    if (!confirmou) {
      return;
    }

    removerProduto(botao.dataset.id);
    atualizarLista();
    mostrarToast("Produto removido do estoque.", "success");
  });
}

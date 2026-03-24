import { renderProductCard } from "../components/card.js";
import { mostrarToast } from "../components/toast.js";
import {
  adicionarProduto,
  calcularTotal,
  editarProduto,
  obterProdutoPorId,
  obterProdutosFiltrados,
  removerProduto,
} from "../js/products.js";
import { setButtonLoading } from "../js/ui.js";
import { debounce, delay, formatarMoeda } from "../js/utils.js";

const state = {
  busca: "",
  ordenacao: "recentes",
  editandoId: null,
};

function obterTextoBotao() {
  return state.editandoId ? "Salvar edicao" : "Adicionar produto";
}

function validarFormulario(nome, preco) {
  if (!nome.trim()) {
    return "Informe o nome do produto.";
  }

  if (Number.isNaN(Number(preco)) || Number(preco) <= 0) {
    return "Informe um preco valido maior que zero.";
  }

  return "";
}

function atualizarResumoLista() {
  const lista = obterProdutosFiltrados({
    busca: state.busca,
    ordenacao: state.ordenacao,
  });
  const listaElement = document.querySelector("#product-list");
  const totalElement = document.querySelector("#total-price");

  if (!listaElement || !totalElement) {
    return;
  }

  totalElement.textContent = formatarMoeda(calcularTotal(lista));

  if (!lista.length) {
    listaElement.innerHTML = `
      <div class="empty-state">
        <p>Nenhum produto encontrado para os filtros atuais.</p>
      </div>
    `;
    return;
  }

  listaElement.innerHTML = lista.map(renderProductCard).join("");
}

function preencherFormulario(produto) {
  const nomeInput = document.querySelector("#product-name");
  const precoInput = document.querySelector("#product-price");
  const submitButton = document.querySelector("#submit-product");
  const cancelButton = document.querySelector("#cancel-edit");

  if (!nomeInput || !precoInput || !submitButton || !cancelButton) {
    return;
  }

  if (produto) {
    nomeInput.value = produto.nome;
    precoInput.value = produto.preco;
    state.editandoId = produto.id;
    submitButton.textContent = obterTextoBotao();
    cancelButton.classList.remove("hidden");
    nomeInput.focus();
    mostrarToast("Modo de edicao ativado.", "info");
    return;
  }

  state.editandoId = null;
  nomeInput.value = "";
  precoInput.value = "";
  submitButton.textContent = obterTextoBotao();
  cancelButton.classList.add("hidden");
}

async function onSubmit(event) {
  event.preventDefault();

  const nomeInput = document.querySelector("#product-name");
  const precoInput = document.querySelector("#product-price");
  const submitButton = document.querySelector("#submit-product");

  if (!nomeInput || !precoInput || !submitButton) {
    return;
  }

  const nome = nomeInput.value;
  const preco = precoInput.value;
  const erro = validarFormulario(nome, preco);

  if (erro) {
    mostrarToast(erro, "error");
    return;
  }

  const textoPadrao = obterTextoBotao();
  setButtonLoading(submitButton, true, textoPadrao, "Salvando...");
  await delay();

  if (state.editandoId) {
    editarProduto(state.editandoId, { nome, preco });
    mostrarToast("Produto atualizado com sucesso.", "success");
  } else {
    adicionarProduto({ nome, preco });
    mostrarToast("Produto adicionado com sucesso.", "success");
  }

  preencherFormulario(null);
  atualizarResumoLista();
  setButtonLoading(submitButton, false, obterTextoBotao(), "Salvando...");
}

function onClickLista(event) {
  const botao = event.target.closest("[data-action]");

  if (!botao) {
    return;
  }

  const { action, id } = botao.dataset;

  if (action === "editar") {
    preencherFormulario(obterProdutoPorId(id));
    return;
  }

  if (action === "remover") {
    const confirmou = window.confirm("Deseja realmente excluir este produto?");

    if (!confirmou) {
      return;
    }

    removerProduto(id);

    if (state.editandoId === id) {
      preencherFormulario(null);
    }

    atualizarResumoLista();
    mostrarToast("Produto removido com sucesso.", "success");
  }
}

export function renderProdutos() {
  const lista = obterProdutosFiltrados({
    busca: state.busca,
    ordenacao: state.ordenacao,
  });

  return `
    <section class="page-grid products-layout">
      <article class="panel">
        <div>
          <h1 class="section-title">Cadastro de produtos</h1>
          <p class="panel-subtitle">Formulario isolado da listagem para manter o fluxo do CRUD claro e escalavel.</p>
        </div>

        <form id="product-form" class="form-fields">
          <div class="field-group">
            <label for="product-name">Nome do produto</label>
            <input id="product-name" name="product-name" type="text" placeholder="Ex: Notebook gamer" />
          </div>

          <div class="field-group">
            <label for="product-price">Preco</label>
            <input id="product-price" name="product-price" type="number" min="0.01" step="0.01" placeholder="Ex: 2999.90" />
          </div>

          <div class="form-actions">
            <button id="submit-product" class="button button-primary" type="submit">${obterTextoBotao()}</button>
            <button id="cancel-edit" class="button button-secondary ${state.editandoId ? "" : "hidden"}" type="button">
              Cancelar edicao
            </button>
          </div>
        </form>

        <p class="helper-text">Os dados ficam salvos no navegador usando `localStorage`.</p>
      </article>

      <article class="panel">
        <div class="list-header">
          <div>
            <h2 class="section-title">Lista de produtos</h2>
            <p class="panel-subtitle">Busca em tempo real com debounce e ordenacao por multiplos criterios.</p>
          </div>
          <span class="total-badge">Total: <strong id="total-price">${formatarMoeda(calcularTotal(lista))}</strong></span>
        </div>

        <div class="toolbar">
          <input id="search-product" type="text" placeholder="Buscar por nome..." value="${state.busca}" />
          <select id="sort-products" aria-label="Ordenar produtos">
            <option value="recentes" ${state.ordenacao === "recentes" ? "selected" : ""}>Mais recentes</option>
            <option value="menor-preco" ${state.ordenacao === "menor-preco" ? "selected" : ""}>Menor preco</option>
            <option value="maior-preco" ${state.ordenacao === "maior-preco" ? "selected" : ""}>Maior preco</option>
            <option value="nome" ${state.ordenacao === "nome" ? "selected" : ""}>Nome</option>
          </select>
        </div>

        <div id="product-list" class="product-list">
          ${
            lista.length
              ? lista.map(renderProductCard).join("")
              : `
                <div class="empty-state">
                  <p>Nenhum produto cadastrado ainda.</p>
                  <button class="button button-secondary" type="button" data-create-first>Criar primeiro produto</button>
                </div>
              `
          }
        </div>
      </article>
    </section>
  `;
}

export function bindProdutosEvents() {
  const form = document.querySelector("#product-form");
  const lista = document.querySelector("#product-list");
  const buscaInput = document.querySelector("#search-product");
  const ordenacaoSelect = document.querySelector("#sort-products");
  const cancelButton = document.querySelector("#cancel-edit");
  const createFirstButton = document.querySelector("[data-create-first]");

  form?.addEventListener("submit", onSubmit);
  lista?.addEventListener("click", onClickLista);
  cancelButton?.addEventListener("click", () => preencherFormulario(null));
  createFirstButton?.addEventListener("click", () => {
    document.querySelector("#product-name")?.focus();
  });
  ordenacaoSelect?.addEventListener("change", (event) => {
    state.ordenacao = event.target.value;
    atualizarResumoLista();
  });
  buscaInput?.addEventListener(
    "input",
    debounce((event) => {
      state.busca = event.target.value;
      atualizarResumoLista();
    }, 250),
  );
}

import { mostrarToast } from "../components/toast.js";
import {
  calcularTotal,
  obterProdutoPorId,
  obterProdutosFiltrados,
  removerProduto,
} from "../js/products.js";
import { bindProdutoForm } from "../js/form.js";
import {
  preencherFormularioProduto,
  renderListaProdutos,
  renderPaginaProdutos,
} from "../js/ui.js";
import { debounce, formatarMoeda } from "../js/utils.js";

const state = {
  busca: "",
  ordenacao: "recentes",
  editandoId: null,
};

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
  listaElement.innerHTML = renderListaProdutos(lista);
  document.querySelector("[data-create-first]")?.addEventListener("click", () => {
    document.querySelector("#product-name")?.focus();
  });
}

function onClickLista(event) {
  const botao = event.target.closest("[data-action]");

  if (!botao) {
    return;
  }

  const { action, id } = botao.dataset;

  if (action === "editar") {
    state.editandoId = id;
    preencherFormularioProduto(obterProdutoPorId(id));
    document.querySelector("#product-name")?.focus();
    mostrarToast("Modo de edicao ativado.", "info");
    return;
  }

  if (action === "remover") {
    const confirmou = window.confirm("Deseja realmente excluir este produto?");

    if (!confirmou) {
      return;
    }

    removerProduto(id);

    if (state.editandoId === id) {
      state.editandoId = null;
      preencherFormularioProduto(null);
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

  return renderPaginaProdutos({
    lista,
    busca: state.busca,
    ordenacao: state.ordenacao,
    editando: Boolean(state.editandoId),
  });
}

export function bindProdutosEvents() {
  const lista = document.querySelector("#product-list");
  const buscaInput = document.querySelector("#search-product");
  const ordenacaoSelect = document.querySelector("#sort-products");
  const cancelButton = document.querySelector("#cancel-edit");
  const createFirstButton = document.querySelector("[data-create-first]");

  bindProdutoForm({
    obterEditandoId: () => state.editandoId,
    setEditandoId: (id) => {
      state.editandoId = id;
    },
    onSuccess: () => {
      atualizarResumoLista();
    },
  });
  lista?.addEventListener("click", onClickLista);
  cancelButton?.addEventListener("click", () => {
    state.editandoId = null;
    preencherFormularioProduto(null);
  });
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

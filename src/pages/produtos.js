import { mostrarToast } from "../components/toast.js";
import {
  adicionarCategoria,
  editarCategoria,
  listarCategorias,
  obterResumoCategorias,
  removerCategoria,
} from "../js/categories.js";
import {
  calcularTotal,
  obterProdutoPorId,
  obterProdutosFiltrados,
  removerProduto,
} from "../js/products.js";
import { bindProdutoForm } from "../js/form.js";
import {
  atualizarSelectCategorias,
  aplicarErroCategoria,
  preencherFormularioCategoria,
  preencherFormularioProduto,
  renderListaCategorias,
  renderListaProdutos,
  renderPaginaProdutos,
  setButtonLoading,
} from "../js/ui.js";
import { debounce, delay, formatarMoeda } from "../js/utils.js";

const state = {
  busca: "",
  ordenacao: "recentes",
  editandoId: null,
  editandoCategoria: null,
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

function atualizarResumoCategorias() {
  const listaElement = document.querySelector("#category-list");

  if (!listaElement) {
    return;
  }

  listaElement.innerHTML = renderListaCategorias(obterResumoCategorias());
}

function sincronizarCategoriasUI({ categoriaSelecionada = "", resetCategoriaForm = false } = {}) {
  atualizarSelectCategorias(listarCategorias(), categoriaSelecionada);
  atualizarResumoCategorias();

  if (resetCategoriaForm) {
    state.editandoCategoria = null;
    preencherFormularioCategoria(null);
  }
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
    atualizarResumoCategorias();
    mostrarToast("Produto removido com sucesso.", "success");
  }
}

async function onSubmitCategoria(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const input = document.querySelector("#category-name");
  const botao = document.querySelector("#submit-category");

  if (!form || !input || !botao) {
    return;
  }

  aplicarErroCategoria("");

  const nome = input.value.trim();
  const textoPadrao = state.editandoCategoria ? "Atualizar" : "Adicionar Categoria";
  setButtonLoading(botao, true, textoPadrao, "Salvando...");

  try {
    await delay();

    if (state.editandoCategoria) {
      const nomeAnterior = state.editandoCategoria;
      const categoriaAtualizada = editarCategoria(nomeAnterior, nome);
      const categoriaSelecionada = document.querySelector("#product-category")?.value ?? "";
      const proximaSelecionada = categoriaSelecionada === nomeAnterior ? categoriaAtualizada : categoriaSelecionada;

      sincronizarCategoriasUI({
        categoriaSelecionada: proximaSelecionada,
        resetCategoriaForm: true,
      });

      if (state.editandoId) {
        preencherFormularioProduto(obterProdutoPorId(state.editandoId));
      }

      atualizarResumoLista();
      mostrarToast("Categoria atualizada.", "success");
    } else {
      const categoriaCriada = adicionarCategoria(nome);
      const categoriaSelecionada = document.querySelector("#product-category")?.value ?? "";

      sincronizarCategoriasUI({
        categoriaSelecionada: categoriaSelecionada || categoriaCriada,
        resetCategoriaForm: true,
      });
      mostrarToast("Categoria criada.", "success");
    }

    form.reset();
  } catch (error) {
    aplicarErroCategoria(error.message);
    mostrarToast(error.message, "error");
  } finally {
    setButtonLoading(
      botao,
      false,
      state.editandoCategoria ? "Atualizar" : "Adicionar Categoria",
      "Salvando...",
    );
  }
}

function onClickCategorias(event) {
  const botao = event.target.closest("[data-category-action]");

  if (!botao) {
    return;
  }

  const { categoryAction, categoryName } = botao.dataset;

  if (categoryAction === "editar") {
    state.editandoCategoria = categoryName;
    preencherFormularioCategoria(categoryName);
    document.querySelector("#category-name")?.focus();
    return;
  }

  if (categoryAction === "remover") {
    const confirmou = window.confirm("Deseja realmente excluir esta categoria?");

    if (!confirmou) {
      return;
    }

    const categoriaSelecionada = document.querySelector("#product-category")?.value ?? "";
    const proximaSelecionada = categoriaSelecionada === categoryName ? "" : categoriaSelecionada;

    removerCategoria(categoryName);

    if (state.editandoCategoria === categoryName) {
      state.editandoCategoria = null;
      preencherFormularioCategoria(null);
    }

    sincronizarCategoriasUI({
      categoriaSelecionada: proximaSelecionada,
    });

    if (state.editandoId) {
      preencherFormularioProduto(obterProdutoPorId(state.editandoId));
    }

    atualizarResumoLista();
    mostrarToast("Categoria removida.", "success");
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
    categorias: obterResumoCategorias(),
    editandoCategoria: Boolean(state.editandoCategoria),
  });
}

export function bindProdutosEvents() {
  const lista = document.querySelector("#product-list");
  const buscaInput = document.querySelector("#search-product");
  const ordenacaoSelect = document.querySelector("#sort-products");
  const cancelButton = document.querySelector("#cancel-edit");
  const createFirstButton = document.querySelector("[data-create-first]");
  const categoryForm = document.querySelector("#category-form");
  const categoryList = document.querySelector("#category-list");
  const categoryCancelButton = document.querySelector("#cancel-category-edit");
  const categoryInput = document.querySelector("#category-name");

  bindProdutoForm({
    obterEditandoId: () => state.editandoId,
    setEditandoId: (id) => {
      state.editandoId = id;
    },
    obterCategorias: () => listarCategorias(),
    onSuccess: () => {
      atualizarResumoLista();
      atualizarResumoCategorias();
    },
  });

  lista?.addEventListener("click", onClickLista);
  categoryForm?.addEventListener("submit", onSubmitCategoria);
  categoryList?.addEventListener("click", onClickCategorias);
  categoryCancelButton?.addEventListener("click", () => {
    state.editandoCategoria = null;
    preencherFormularioCategoria(null);
  });
  categoryInput?.addEventListener("input", () => {
    aplicarErroCategoria("");
  });
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

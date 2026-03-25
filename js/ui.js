import { carregarLocalStorage, salvarLocalStorage } from "./storage.js";
import { renderProductCard } from "../components/card.js";
import { calcularTotal } from "./products.js";
import { escapeHtml, formatarMoeda } from "./utils.js";

const THEME_KEY = "crud_tema";

export function renderNoApp(html) {
  const app = document.querySelector("#app");

  if (app) {
    app.innerHTML = html;
  }
}

export function atualizarBotaoAtivo(pagina) {
  document.querySelectorAll("[data-route]").forEach((botao) => {
    botao.classList.toggle("active", botao.dataset.route === pagina);
  });
}

export function obterTemaAtual() {
  return carregarLocalStorage(THEME_KEY, "dark");
}

export function aplicarTema(tema) {
  document.body.classList.toggle("theme-light", tema === "light");

  const botaoTema = document.querySelector("#theme-toggle");

  if (botaoTema) {
    botaoTema.textContent = tema === "light" ? "Dark mode" : "Light mode";
  }
}

export function alternarTema() {
  const proximoTema = obterTemaAtual() === "light" ? "dark" : "light";
  salvarLocalStorage(THEME_KEY, proximoTema);
  aplicarTema(proximoTema);
}

export function setButtonLoading(botao, carregando, textoPadrao, textoLoading) {
  if (!botao) {
    return;
  }

  botao.disabled = carregando;
  botao.classList.toggle("loading", carregando);
  botao.textContent = carregando ? textoLoading : textoPadrao;
}

function renderOptionsCategorias(categorias, categoriaSelecionada = "") {
  return [
    '<option value="">Sem categoria</option>',
    ...categorias.map((categoria) => `
      <option value="${escapeHtml(categoria)}" ${categoria === categoriaSelecionada ? "selected" : ""}>${escapeHtml(categoria)}</option>
    `),
  ].join("");
}

export function renderFormularioProduto(editando = false, categorias = []) {
  return `
    <form id="product-form" class="form-fields" novalidate>
      <div class="field-group" data-field="nome">
        <label for="product-name">Nome do produto</label>
        <input id="product-name" name="nome" type="text" placeholder="Ex: Notebook gamer" autocomplete="off" />
        <p class="field-error" id="product-name-error" aria-live="polite"></p>
      </div>

      <div class="field-group" data-field="preco">
        <label for="product-price">Preco</label>
        <input id="product-price" name="preco" type="number" min="0.01" step="0.01" placeholder="Ex: 2999.90" />
        <p class="field-error" id="product-price-error" aria-live="polite"></p>
      </div>

      <div class="field-group" data-field="categoria">
        <label for="product-category">Categoria</label>
        <select id="product-category" name="categoria">
          ${renderOptionsCategorias(categorias)}
        </select>
        <p class="field-error" id="product-category-error" aria-live="polite"></p>
      </div>

      <div class="field-group" data-field="estoque">
        <label for="product-stock">Quantidade em estoque</label>
        <input id="product-stock" name="estoque" type="number" min="0" step="1" placeholder="Ex: 12" />
        <p class="field-error" id="product-stock-error" aria-live="polite"></p>
      </div>

      <div class="form-actions">
        <button id="submit-product" class="button button-primary" type="submit">${editando ? "Salvar edicao" : "Salvar"}</button>
        <button id="cancel-edit" class="button button-secondary ${editando ? "" : "hidden"}" type="button">
          Cancelar edicao
        </button>
      </div>
    </form>
  `;
}

export function renderFormularioCategoria(editando = false) {
  return `
    <form id="category-form" class="form-fields category-form" novalidate>
      <div class="field-group">
        <label for="category-name">Nome da categoria</label>
        <input id="category-name" name="nome-categoria" type="text" placeholder="Ex: Doces" autocomplete="off" />
        <p class="field-error" id="category-name-error" aria-live="polite"></p>
      </div>

      <div class="form-actions">
        <button id="submit-category" class="button button-primary" type="submit">${editando ? "Atualizar" : "Adicionar Categoria"}</button>
        <button id="cancel-category-edit" class="button button-secondary ${editando ? "" : "hidden"}" type="button">
          Cancelar
        </button>
      </div>
    </form>
  `;
}

export function renderListaProdutos(lista) {
  if (!lista.length) {
    return `
      <div class="empty-state">
        <p>Nenhum produto cadastrado ainda.</p>
        <button class="button button-secondary" type="button" data-create-first>Criar primeiro produto</button>
      </div>
    `;
  }

  return lista.map(renderProductCard).join("");
}

export function renderListaCategorias(categorias) {
  if (!categorias.length) {
    return `
      <div class="empty-state">
        <p>Nenhuma categoria cadastrada.</p>
      </div>
    `;
  }

  return categorias.map((categoria) => `
    <article class="category-card">
      <div>
        <h3 class="product-name">${escapeHtml(categoria.nome)}</h3>
        <div class="product-meta">
          <span>${categoria.quantidadeProdutos} produto(s)</span>
        </div>
      </div>

      <div class="action-group">
        <button
          class="action-button action-edit category-icon-button"
          type="button"
          data-category-action="editar"
          data-category-name="${escapeHtml(categoria.nome)}"
          aria-label="Editar categoria ${escapeHtml(categoria.nome)}"
        >
          &#9998;
        </button>
        <button
          class="action-button action-delete category-icon-button"
          type="button"
          data-category-action="remover"
          data-category-name="${escapeHtml(categoria.nome)}"
          aria-label="Excluir categoria ${escapeHtml(categoria.nome)}"
        >
          &#128465;
        </button>
      </div>
    </article>
  `).join("");
}

export function renderPaginaProdutos({
  lista,
  busca,
  ordenacao,
  editando,
  categorias,
  editandoCategoria,
}) {
  return `
    <section class="page-grid products-layout">
      <div class="stack-layout">
        <article class="panel">
          <div>
            <h1 class="section-title">Cadastro de produtos</h1>
            <p class="panel-subtitle">Formulario validado com Zod, feedback imediato e persistencia local automatica.</p>
          </div>

          ${renderFormularioProduto(editando, categorias.map((categoria) => categoria.nome))}

          <p class="helper-text">Os dados ficam salvos no navegador usando localStorage.</p>
        </article>

        <article class="panel">
          <div>
            <h2 class="section-title">Gerenciar Categorias</h2>
            <p class="panel-subtitle">CRUD completo de categorias com integracao direta aos produtos.</p>
          </div>

          ${renderFormularioCategoria(editandoCategoria)}

          <div id="category-list" class="product-list category-list">
            ${renderListaCategorias(categorias)}
          </div>
        </article>
      </div>

      <article class="panel">
        <div class="list-header">
          <div>
            <h2 class="section-title">Lista de produtos</h2>
            <p class="panel-subtitle">Busca em tempo real, ordenacao, atualizacao imediata e cards com dados completos.</p>
          </div>
          <span class="total-badge">Total: <strong id="total-price">${formatarMoeda(calcularTotal(lista))}</strong></span>
        </div>

        <div class="toolbar">
          <input id="search-product" type="text" placeholder="Buscar por nome..." value="${busca}" />
          <select id="sort-products" aria-label="Ordenar produtos">
            <option value="recentes" ${ordenacao === "recentes" ? "selected" : ""}>Mais recentes</option>
            <option value="menor-preco" ${ordenacao === "menor-preco" ? "selected" : ""}>Menor preco</option>
            <option value="maior-preco" ${ordenacao === "maior-preco" ? "selected" : ""}>Maior preco</option>
            <option value="nome" ${ordenacao === "nome" ? "selected" : ""}>Nome</option>
          </select>
        </div>

        <div id="product-list" class="product-list">${renderListaProdutos(lista)}</div>
      </article>
    </section>
  `;
}

export function obterDadosFormularioProduto(form) {
  const formData = new FormData(form);

  return {
    nome: String(formData.get("nome") ?? ""),
    preco: String(formData.get("preco") ?? ""),
    categoria: String(formData.get("categoria") ?? ""),
    estoque: String(formData.get("estoque") ?? ""),
  };
}

export function atualizarSelectCategorias(categorias, valorSelecionado = "") {
  const select = document.querySelector("#product-category");

  if (!select) {
    return;
  }

  select.innerHTML = renderOptionsCategorias(categorias, valorSelecionado);
}

const fieldConfig = {
  nome: {
    container: '[data-field="nome"]',
    input: "#product-name",
    error: "#product-name-error",
  },
  preco: {
    container: '[data-field="preco"]',
    input: "#product-price",
    error: "#product-price-error",
  },
  categoria: {
    container: '[data-field="categoria"]',
    input: "#product-category",
    error: "#product-category-error",
  },
  estoque: {
    container: '[data-field="estoque"]',
    input: "#product-stock",
    error: "#product-stock-error",
  },
};

export function limparErrosFormularioProduto(campos = Object.keys(fieldConfig)) {
  campos.forEach((campo) => {
    const config = fieldConfig[campo];

    if (!config) {
      return;
    }

    const container = document.querySelector(config.container);
    const input = document.querySelector(config.input);
    const error = document.querySelector(config.error);

    container?.classList.remove("has-error");
    input?.removeAttribute("aria-invalid");

    if (error) {
      error.textContent = "";
    }
  });
}

export function aplicarErrosFormularioProduto(erros) {
  Object.entries(erros).forEach(([campo, mensagem]) => {
    const config = fieldConfig[campo];

    if (!config) {
      return;
    }

    const container = document.querySelector(config.container);
    const input = document.querySelector(config.input);
    const error = document.querySelector(config.error);

    container?.classList.add("has-error");
    input?.setAttribute("aria-invalid", "true");

    if (error) {
      error.textContent = mensagem;
    }
  });
}

export function preencherFormularioProduto(produto) {
  const nomeInput = document.querySelector("#product-name");
  const precoInput = document.querySelector("#product-price");
  const categoriaInput = document.querySelector("#product-category");
  const estoqueInput = document.querySelector("#product-stock");
  const submitButton = document.querySelector("#submit-product");
  const cancelButton = document.querySelector("#cancel-edit");

  if (!nomeInput || !precoInput || !categoriaInput || !estoqueInput || !submitButton || !cancelButton) {
    return;
  }

  limparErrosFormularioProduto();

  if (!produto) {
    nomeInput.value = "";
    precoInput.value = "";
    categoriaInput.value = "";
    estoqueInput.value = "";
    submitButton.textContent = "Salvar";
    cancelButton.classList.add("hidden");
    return;
  }

  nomeInput.value = produto.nome;
  precoInput.value = produto.preco;
  categoriaInput.value = produto.categoria ?? "";
  estoqueInput.value = produto.estoque ?? "";
  submitButton.textContent = "Salvar edicao";
  cancelButton.classList.remove("hidden");
}

export function preencherFormularioCategoria(nomeCategoria) {
  const input = document.querySelector("#category-name");
  const submitButton = document.querySelector("#submit-category");
  const cancelButton = document.querySelector("#cancel-category-edit");

  if (!input || !submitButton || !cancelButton) {
    return;
  }

  aplicarErroCategoria("");

  if (!nomeCategoria) {
    input.value = "";
    submitButton.textContent = "Adicionar Categoria";
    cancelButton.classList.add("hidden");
    return;
  }

  input.value = nomeCategoria;
  submitButton.textContent = "Atualizar";
  cancelButton.classList.remove("hidden");
}

export function aplicarErroCategoria(mensagem = "") {
  const error = document.querySelector("#category-name-error");
  const input = document.querySelector("#category-name");

  if (!error || !input) {
    return;
  }

  error.textContent = mensagem;

  if (mensagem) {
    input.setAttribute("aria-invalid", "true");
    return;
  }

  input.removeAttribute("aria-invalid");
}

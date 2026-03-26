import { mostrarToast } from "../../components/toast.js";
import { excluirMercado, listarMercados, obterMercadoPorId, salvarMercado } from "../../js/categories.js";
import { abrirModal, fecharModal, limparErrosFormulario, aplicarErrosFormulario } from "../../js/ui.js";
import { escapeHtml } from "../../js/utils.js";

function renderLista() {
  const mercados = listarMercados();

  if (!mercados.length) {
    return '<div class="empty-state"><p>Nenhum mercado cadastrado.</p></div>';
  }

  return mercados.map((mercado) => `
    <article class="category-card">
      <div>
        <h3 class="product-name">${escapeHtml(mercado.nome)}</h3>
      </div>

      <div class="action-group">
        <button class="action-button action-edit" type="button" data-market-action="editar" data-id="${mercado.id}">Editar</button>
        <button class="action-button action-delete" type="button" data-market-action="excluir" data-id="${mercado.id}">Excluir</button>
      </div>
    </article>
  `).join("");
}

function renderModal(mercado = null) {
  return `
    <form id="market-form" class="form-fields" novalidate>
      <div class="field-group" data-field="nome">
        <label for="market-name">Nome do Mercado</label>
        <input id="market-name" name="nome" type="text" value="${escapeHtml(mercado?.nome || "")}" placeholder="Ex: Atacadao" />
        <p class="field-error" data-error-for="nome"></p>
      </div>

      <div class="form-actions">
        <button class="button button-primary" type="submit">${mercado ? "Salvar Mercado" : "Cadastrar Mercado"}</button>
      </div>
    </form>
  `;
}

function abrirModalMercado(id = "") {
  const mercado = id ? obterMercadoPorId(id) : null;

  abrirModal({
    titulo: mercado ? "Editar Mercado" : "Novo Mercado",
    descricao: "Use mercados para amarrar compras e entradas de estoque.",
    conteudo: renderModal(mercado),
    onOpen(root) {
      const form = root.querySelector("#market-form");

      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        limparErrosFormulario(form);

        const formData = new FormData(form);
        const dados = Object.fromEntries(formData.entries());

        try {
          salvarMercado({
            id,
            nome: dados.nome,
          });
          fecharModal();
          const lista = document.querySelector("#market-list");
          if (lista) {
            lista.innerHTML = renderLista();
          }
          mostrarToast("Mercado salvo com sucesso.", "success");
        } catch (error) {
          const mensagem = error.message || "Nao foi possivel salvar o mercado.";
          aplicarErrosFormulario(form, { nome: mensagem });
          mostrarToast(mensagem, "error");
        }
      });
    },
  });
}

export function renderMercados() {
  return `
    <section class="page-grid">
      <article class="panel">
        <div class="section-header">
          <div>
            <h1 class="section-title">Mercados</h1>
            <p class="panel-subtitle">Cadastre fornecedores e locais de compra usados no checkout de entrada.</p>
          </div>
          <button class="button button-primary" type="button" id="new-market-button">Novo Mercado</button>
        </div>
      </article>

      <section id="market-list" class="product-list">
        ${renderLista()}
      </section>
    </section>
  `;
}

export function bindMercadosEvents() {
  document.querySelector("#new-market-button")?.addEventListener("click", () => abrirModalMercado());
  document.querySelector("#market-list")?.addEventListener("click", (event) => {
    const botao = event.target.closest("[data-market-action]");

    if (!botao) {
      return;
    }

    if (botao.dataset.marketAction === "editar") {
      abrirModalMercado(botao.dataset.id);
      return;
    }

    if (window.confirm("Deseja excluir este mercado?")) {
      excluirMercado(botao.dataset.id);
      document.querySelector("#market-list").innerHTML = renderLista();
      mostrarToast("Mercado excluido.", "success");
    }
  });
}

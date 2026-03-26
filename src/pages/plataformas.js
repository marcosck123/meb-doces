import { mostrarToast } from "../../components/toast.js";
import { excluirPlataforma, listarPlataformas, obterPlataformaPorId, salvarPlataforma } from "../../js/categories.js";
import { abrirModal, fecharModal, limparErrosFormulario, aplicarErrosFormulario } from "../../js/ui.js";
import { escapeHtml } from "../../js/utils.js";

function renderLista() {
  const plataformas = listarPlataformas();

  if (!plataformas.length) {
    return '<div class="empty-state"><p>Nenhuma plataforma cadastrada.</p></div>';
  }

  return plataformas.map((plataforma) => `
    <article class="category-card">
      <div>
        <h3 class="product-name">${escapeHtml(plataforma.nome)}</h3>
        <div class="product-meta">
          <span>${plataforma.cobraTaxa ? `Taxa: ${plataforma.taxa}%` : "Sem taxa"}</span>
        </div>
      </div>

      <div class="action-group">
        <button class="action-button action-edit" type="button" data-platform-action="editar" data-id="${plataforma.id}">Editar</button>
        <button class="action-button action-delete" type="button" data-platform-action="excluir" data-id="${plataforma.id}">Excluir</button>
      </div>
    </article>
  `).join("");
}

function renderModal(plataforma = null) {
  return `
    <form id="platform-form" class="form-fields" novalidate>
      <div class="field-group" data-field="nome">
        <label for="platform-name">Nome da Plataforma</label>
        <input id="platform-name" name="nome" type="text" value="${escapeHtml(plataforma?.nome || "")}" placeholder="Ex: Delivery Much" />
        <p class="field-error" data-error-for="nome"></p>
      </div>

      <div class="field-group" data-field="cobraTaxa">
        <label for="platform-fee-toggle">Cobra comissao ou taxa?</label>
        <select id="platform-fee-toggle" name="cobraTaxa">
          <option value="nao" ${plataforma?.cobraTaxa ? "" : "selected"}>Nao</option>
          <option value="sim" ${plataforma?.cobraTaxa ? "selected" : ""}>Sim</option>
        </select>
        <p class="field-error" data-error-for="cobraTaxa"></p>
      </div>

      <div class="field-group ${plataforma?.cobraTaxa ? "" : "hidden"}" data-field="taxa">
        <label for="platform-fee">Taxa (%)</label>
        <input id="platform-fee" name="taxa" type="text" inputmode="decimal" value="${plataforma?.cobraTaxa ? escapeHtml(String(plataforma.taxa)) : ""}" placeholder="Ex: 12,5" />
        <p class="field-error" data-error-for="taxa"></p>
      </div>

      <div class="form-actions">
        <button class="button button-primary" type="submit">${plataforma ? "Salvar Plataforma" : "Cadastrar Plataforma"}</button>
      </div>
    </form>
  `;
}

function abrirModalPlataforma(id = "") {
  const plataforma = id ? obterPlataformaPorId(id) : null;

  abrirModal({
    titulo: plataforma ? "Editar Plataforma" : "Nova Plataforma",
    descricao: "Cadastre a plataforma e defina se ha taxa de intermediação.",
    conteudo: renderModal(plataforma),
    onOpen(root) {
      const form = root.querySelector("#platform-form");
      const toggle = root.querySelector("#platform-fee-toggle");
      const campoTaxa = root.querySelector('[data-field="taxa"]');

      toggle?.addEventListener("change", () => {
        campoTaxa?.classList.toggle("hidden", toggle.value !== "sim");
      });

      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        limparErrosFormulario(form);

        const formData = new FormData(form);
        const dados = Object.fromEntries(formData.entries());

        try {
          salvarPlataforma({
            id,
            nome: dados.nome,
            cobraTaxa: dados.cobraTaxa === "sim",
            taxa: dados.cobraTaxa === "sim" ? dados.taxa : 0,
          });
          fecharModal();
          const lista = document.querySelector("#platform-list");
          if (lista) {
            lista.innerHTML = renderLista();
          }
          mostrarToast("Plataforma salva com sucesso.", "success");
        } catch (error) {
          const mensagem = error.message || "Nao foi possivel salvar a plataforma.";
          const erros = {};
          if (mensagem.includes("nome")) erros.nome = mensagem;
          if (mensagem.includes("taxa")) erros.taxa = mensagem;
          aplicarErrosFormulario(form, erros);
          mostrarToast(mensagem, "error");
        }
      });
    },
  });
}

export function renderPlataformas() {
  return `
    <section class="page-grid">
      <article class="panel">
        <div class="section-header">
          <div>
            <h1 class="section-title">Plataformas</h1>
            <p class="panel-subtitle">Defina canais de venda e a taxa aplicada por cada um.</p>
          </div>
          <button class="button button-primary" type="button" id="new-platform-button">Nova Plataforma</button>
        </div>
      </article>

      <section id="platform-list" class="product-list">
        ${renderLista()}
      </section>
    </section>
  `;
}

export function bindPlataformasEvents() {
  document.querySelector("#new-platform-button")?.addEventListener("click", () => abrirModalPlataforma());
  document.querySelector("#platform-list")?.addEventListener("click", (event) => {
    const botao = event.target.closest("[data-platform-action]");

    if (!botao) {
      return;
    }

    if (botao.dataset.platformAction === "editar") {
      abrirModalPlataforma(botao.dataset.id);
      return;
    }

    if (window.confirm("Deseja excluir esta plataforma?")) {
      excluirPlataforma(botao.dataset.id);
      document.querySelector("#platform-list").innerHTML = renderLista();
      mostrarToast("Plataforma excluida.", "success");
    }
  });
}

import { escapeHtml, formatarMoeda } from "../js/utils.js";

export function renderProductCard(produto) {
  return `
    <article class="product-card">
      <div>
        <h3 class="product-name">${escapeHtml(produto.nome)}</h3>
        <div class="product-meta">
          <span class="price-badge">${formatarMoeda(produto.preco)}</span>
          <span>ID: ${escapeHtml(produto.id)}</span>
        </div>
      </div>

      <div class="action-group">
        <button class="action-button action-edit" type="button" data-action="editar" data-id="${produto.id}">
          Editar
        </button>
        <button class="action-button action-delete" type="button" data-action="remover" data-id="${produto.id}">
          Excluir
        </button>
      </div>
    </article>
  `;
}

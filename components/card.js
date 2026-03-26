import { escapeHtml, formatarMoeda } from "../js/utils.js";

export function renderProductCard(produto) {
  const quantidade = Number(produto.quantidadeEstoque) || 0;
  const unidade = produto.unidade ? ` ${escapeHtml(produto.unidade)}` : " un.";

  return `
    <article class="product-card">
      <div>
        <h3 class="product-name">${escapeHtml(produto.nome)}</h3>
        <div class="product-meta">
          <span class="price-badge">Custo medio: ${formatarMoeda(produto.custoMedio)}</span>
          <span>Estoque: ${escapeHtml(`${quantidade}${unidade}`)}</span>
          <span>Ultimo mercado: ${escapeHtml(produto.ultimoMercado || "Nao informado")}</span>
          <span>Valor em estoque: ${formatarMoeda(quantidade * (Number(produto.custoMedio) || 0))}</span>
        </div>
      </div>

      <div class="action-group">
        <button class="action-button action-delete" type="button" data-action="remover" data-id="${produto.id}">
          Excluir
        </button>
      </div>
    </article>
  `;
}

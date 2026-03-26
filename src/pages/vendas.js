import { mostrarToast } from "../../components/toast.js";
import { listarVendas, obterOpcoesVenda, calcularResumoVenda, registrarVenda } from "../../js/vendas.js";
import { atualizarCarteiraPopupSeAberto } from "../../js/ui.js";
import { escapeHtml, formatarDataHora, formatarMoeda } from "../../js/utils.js";

function renderResumoVenda(resumo) {
  if (!resumo) {
    return `
      <div class="empty-state summary-preview">
        <p>Preencha produto, plataforma e preco para ver o valor final.</p>
      </div>
    `;
  }

  return `
    <article class="sale-summary-card">
      <p>Preco digitado: <strong>${formatarMoeda(resumo.precoVenda)}</strong></p>
      <p>Taxa da plataforma: <strong>${resumo.taxaAplicada}%</strong></p>
      <p>Desconto da taxa: <strong>${formatarMoeda(resumo.desconto)}</strong></p>
      <p class="sale-summary-highlight">Valor final recebido: ${formatarMoeda(resumo.valorFinal)}</p>
    </article>
  `;
}

function renderHistorico() {
  const vendas = listarVendas().slice(0, 8);

  if (!vendas.length) {
    return '<div class="empty-state"><p>Nenhuma venda registrada.</p></div>';
  }

  return vendas.map((venda) => `
    <article class="mini-history-card">
      <div>
        <strong>${escapeHtml(venda.produto)}</strong>
        <p>${escapeHtml(venda.plataforma)} · ${escapeHtml(formatarDataHora(venda.data))}</p>
      </div>
      <div class="history-card-side">
        <strong>${formatarMoeda(venda.valorFinal)}</strong>
        <span>Bruto: ${formatarMoeda(venda.precoVenda)}</span>
      </div>
    </article>
  `).join("");
}

function atualizarResumo() {
  const produtoId = document.querySelector("#sale-product")?.value || "";
  const plataformaId = document.querySelector("#sale-platform")?.value || "";
  const precoVenda = document.querySelector("#sale-price")?.value || "";
  const resumo = produtoId && plataformaId ? calcularResumoVenda(plataformaId, precoVenda) : null;
  const resumoElement = document.querySelector("#sale-summary");

  if (resumoElement) {
    resumoElement.innerHTML = renderResumoVenda(resumo);
  }
}

export function renderVendas() {
  const { produtos, plataformas } = obterOpcoesVenda();

  return `
    <section class="page-grid products-layout sales-layout">
      <article class="panel">
        <div>
          <h1 class="section-title">Registrar Venda</h1>
          <p class="panel-subtitle">Selecione o produto, a plataforma e veja a taxa aplicada antes de confirmar.</p>
        </div>

        <form id="sale-form" class="form-fields" novalidate>
          <div class="field-group">
            <label for="sale-product">Produto</label>
            <select id="sale-product" name="produtoId">
              <option value="">Selecione</option>
              ${produtos.map((produto) => `<option value="${produto.id}">${escapeHtml(produto.nome)}</option>`).join("")}
            </select>
          </div>

          <div class="field-group">
            <label for="sale-platform">Plataforma</label>
            <select id="sale-platform" name="plataformaId">
              <option value="">Selecione</option>
              ${plataformas.map((plataforma) => `<option value="${plataforma.id}">${escapeHtml(plataforma.nome)}</option>`).join("")}
            </select>
          </div>

          <div class="field-group">
            <label for="sale-price">Preco de Venda (R$)</label>
            <input id="sale-price" name="precoVenda" type="text" inputmode="decimal" placeholder="Ex: 50,00" />
          </div>

          <div id="sale-summary">
            ${renderResumoVenda(null)}
          </div>

          <div class="form-actions">
            <button class="button button-primary" type="submit">Registrar Venda</button>
          </div>
        </form>
      </article>

      <article class="panel">
        <div class="section-header">
          <div>
            <h2 class="section-title">Historico de Vendas</h2>
            <p class="panel-subtitle">A receita liquida de cada venda vai automaticamente para a carteira.</p>
          </div>
        </div>

        <div id="sales-history" class="history-list">
          ${renderHistorico()}
        </div>
      </article>
    </section>
  `;
}

export function bindVendasEvents() {
  const form = document.querySelector("#sale-form");

  ["#sale-product", "#sale-platform", "#sale-price"].forEach((selector) => {
    document.querySelector(selector)?.addEventListener("input", atualizarResumo);
    document.querySelector(selector)?.addEventListener("change", atualizarResumo);
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const dados = Object.fromEntries(formData.entries());

    try {
      const venda = registrarVenda(dados);
      form.reset();
      atualizarResumo();
      document.querySelector("#sales-history").innerHTML = renderHistorico();
      atualizarCarteiraPopupSeAberto();
      mostrarToast(`Venda registrada para ${venda.produto}.`, "success");
    } catch (error) {
      mostrarToast(error.message || "Nao foi possivel registrar a venda.", "error");
    }
  });
}

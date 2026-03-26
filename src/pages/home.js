import { listarProdutos, calcularValorTotalEstoque, contarProdutosBaixoEstoque } from "../../js/products.js";
import { listarPlataformas, listarMercados } from "../../js/categories.js";
import { listarVendas } from "../../js/vendas.js";
import { obterCarteira } from "../../js/carteira.js";
import { formatarMoeda } from "../../js/utils.js";

function obterResumo() {
  const produtos = listarProdutos();
  const vendas = listarVendas();
  const carteira = obterCarteira();

  return {
    produtos: produtos.length,
    valorEstoque: calcularValorTotalEstoque(produtos),
    baixoEstoque: contarProdutosBaixoEstoque(),
    plataformas: listarPlataformas().length,
    mercados: listarMercados().length,
    vendas: vendas.length,
    carteira: carteira.saldoTotal,
  };
}

export function renderHome() {
  const resumo = obterResumo();

  return `
    <section class="page-grid home-grid">
      <article class="panel hero-panel">
        <span class="eyebrow">Operacao Integrada</span>
        <h1 class="hero-title">Controle entradas, vendas e caixa sem sair da mesma SPA.</h1>
        <p class="hero-text">
          Estoque por checkout, categorias auxiliares, venda com taxa de plataforma e carteira com banco + caixa.
        </p>

        <div class="hero-actions">
          <button class="button button-primary" type="button" data-go-products>
            Abrir estoque
          </button>
          <button class="button button-secondary" type="button" data-go-sales>
            Registrar venda
          </button>
        </div>
      </article>

      <aside class="stats-stack">
        <article class="stat-card">
          <p class="stat-label">Saldo da carteira</p>
          <p class="stat-value">${formatarMoeda(resumo.carteira)}</p>
        </article>
        <article class="stat-card">
          <p class="stat-label">Produtos em estoque</p>
          <p class="stat-value">${resumo.produtos}</p>
        </article>
        <article class="stat-card">
          <p class="stat-label">Valor do estoque</p>
          <p class="stat-value">${formatarMoeda(resumo.valorEstoque)}</p>
        </article>
      </aside>
    </section>

    <section class="summary-grid dashboard-grid">
      <article class="stat-card">
        <p class="stat-label">Plataformas</p>
        <p class="stat-value">${resumo.plataformas}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Mercados</p>
        <p class="stat-value">${resumo.mercados}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Vendas registradas</p>
        <p class="stat-value">${resumo.vendas}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Itens com baixo estoque</p>
        <p class="stat-value">${resumo.baixoEstoque}</p>
      </article>
    </section>

    <section class="panel">
      <div class="section-header">
        <div>
          <h2 class="section-title">Fluxo implementado</h2>
          <p class="section-text">A operacao agora nasce de categorias, passa por entradas e termina integrada na carteira.</p>
        </div>
      </div>

      <div class="highlights-list">
        <div class="highlight-item">
          <span class="highlight-icon">01</span>
          <div>
            <h3>Entradas controladas</h3>
            <p class="section-text">O estoque nao recebe mais item por formulario direto. Toda entrada passa pelo checkout modal.</p>
          </div>
        </div>
        <div class="highlight-item">
          <span class="highlight-icon">02</span>
          <div>
            <h3>Venda com taxa</h3>
            <p class="section-text">A plataforma selecionada recalcula o valor final antes do registro e envia a receita liquida para a carteira.</p>
          </div>
        </div>
        <div class="highlight-item">
          <span class="highlight-icon">03</span>
          <div>
            <h3>Carteira com flip</h3>
            <p class="section-text">Banco e caixa ficam no popup flutuante com edicao inline dos dados do cartao e historico resumido.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

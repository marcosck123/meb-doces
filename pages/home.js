import { listarProdutos, calcularTotal } from "../js/products.js";
import { formatarMoeda } from "../js/utils.js";

function obterResumo() {
  const produtos = listarProdutos();
  const total = calcularTotal(produtos);
  const maiorPreco = produtos.length
    ? Math.max(...produtos.map((produto) => produto.preco))
    : 0;

  return {
    quantidade: produtos.length,
    total,
    maiorPreco,
  };
}

export function renderHome() {
  const resumo = obterResumo();

  return `
    <section class="page-grid home-grid">
      <article class="panel hero-panel">
        <span class="eyebrow">SPA Profissional</span>
        <h1 class="hero-title">CRUD de produtos com estrutura escalavel e organizada.</h1>
        <p class="hero-text">
          Navegacao sem reload, componentes reutilizaveis, persistencia local,
          busca com debounce, ordenacao e tema dark/light em uma base modular.
        </p>

        <div class="hero-actions">
          <button class="button button-primary" type="button" data-go-products>
            Abrir produtos
          </button>
          <button class="button button-secondary" type="button" data-go-products>
            Gerenciar agora
          </button>
        </div>
      </article>

      <aside class="stats-stack">
        <article class="stat-card">
          <p class="stat-label">Produtos cadastrados</p>
          <p class="stat-value">${resumo.quantidade}</p>
        </article>
        <article class="stat-card">
          <p class="stat-label">Total do estoque</p>
          <p class="stat-value">${formatarMoeda(resumo.total)}</p>
        </article>
        <article class="stat-card">
          <p class="stat-label">Maior preco</p>
          <p class="stat-value">${formatarMoeda(resumo.maiorPreco)}</p>
        </article>
      </aside>
    </section>

    <section class="panel">
      <div class="section-header">
        <div>
          <h2 class="section-title">Resumo do projeto</h2>
          <p class="section-text">Separacao clara entre rota, estado, UI e componentes.</p>
        </div>
      </div>

      <div class="highlights-list">
        <div class="highlight-item">
          <span class="highlight-icon">01</span>
          <div>
            <h3>Arquitetura modular</h3>
            <p class="section-text">Responsabilidades divididas em `main`, `routes`, `storage`, `products`, `ui`, `utils`, `pages` e `components`.</p>
          </div>
        </div>
        <div class="highlight-item">
          <span class="highlight-icon">02</span>
          <div>
            <h3>CRUD completo</h3>
            <p class="section-text">Adicionar, editar, remover, buscar e ordenar com persistencia em `localStorage`.</p>
          </div>
        </div>
        <div class="highlight-item">
          <span class="highlight-icon">03</span>
          <div>
            <h3>Experiencia refinada</h3>
            <p class="section-text">Toast de feedback, loading no botao, confirmacao de exclusao e atualizacao imediata do dashboard.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

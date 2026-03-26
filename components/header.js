export function renderHeader() {
  return `
    <header class="topbar">
      <div class="container topbar-inner">
        <div class="brand">
          <span class="brand-title">MEB Doces</span>
          <span class="brand-subtitle">Estoque, vendas e carteira em JavaScript puro</span>
        </div>

        <div class="topbar-actions">
          <nav class="nav-links" aria-label="Navegacao principal">
            <button class="nav-button" data-route="home">Home</button>
            <button class="nav-button" data-route="produtos">Estoque</button>
            <button class="nav-button" data-route="plataformas">Plataformas</button>
            <button class="nav-button" data-route="mercados">Mercados</button>
            <button class="nav-button" data-route="vendas">Registrar Venda</button>
          </nav>
          <button id="wallet-trigger" class="theme-button" type="button">💳 Carteira</button>
          <button id="theme-toggle" class="theme-button" type="button">Light mode</button>
        </div>
      </div>
    </header>
  `;
}

export function renderHeader() {
  return `
    <header class="topbar">
      <div class="container topbar-inner">
        <div class="brand">
          <span class="brand-title">Produtos SPA</span>
          <span class="brand-subtitle">Arquitetura modular com JavaScript puro</span>
        </div>

        <div class="topbar-actions">
          <nav class="nav-links" aria-label="Navegacao principal">
            <button class="nav-button" data-route="home">Home</button>
            <button class="nav-button" data-route="produtos">Produtos</button>
          </nav>
          <button id="theme-toggle" class="theme-button" type="button">Light mode</button>
        </div>
      </div>
    </header>
  `;
}

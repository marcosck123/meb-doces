let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let editandoIndex = null;
let paginaAtual = 'home';

function irPara(pagina) {
  paginaAtual = pagina;

  if (pagina === 'produtos') {
    renderProdutos();
  } else {
    renderHome();
  }

  atualizarMenuAtivo();
}

function atualizarMenuAtivo() {
  const botoes = document.querySelectorAll('.menu-link');
  botoes.forEach((botao) => botao.classList.remove('ativo'));

  const homeBtn = document.querySelector('.menu-link[onclick="irPara(\'home\')"]');
  const produtosBtn = document.querySelector('.menu-link[onclick="irPara(\'produtos\')"]');

  if (paginaAtual === 'produtos' && produtosBtn) {
    produtosBtn.classList.add('ativo');
  }

  if (paginaAtual === 'home' && homeBtn) {
    homeBtn.classList.add('ativo');
  }
}

function renderHome() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <section class="hero-card">
      <h2>Sistema de Produtos</h2>
      <p>Gerencie cadastro, edição e remoção de produtos em uma experiência SPA moderna, sem recarregar a página.</p>
      <button class="btn-principal" onclick="irPara('produtos')">Ir para Produtos</button>
    </section>

    <section class="features">
      <article class="feature-item">
        <span>📦</span>
        <h4>Cadastro rápido</h4>
        <p>Adicione produtos em segundos com nome e preço.</p>
      </article>
      <article class="feature-item">
        <span>✏️</span>
        <h4>Edição simples</h4>
        <p>Atualize qualquer item com poucos cliques.</p>
      </article>
      <article class="feature-item">
        <span>🗑️</span>
        <h4>Remoção prática</h4>
        <p>Exclua produtos facilmente da sua lista.</p>
      </article>
      <article class="feature-item">
        <span>💾</span>
        <h4>Dados persistentes</h4>
        <p>Informações salvas no localStorage automaticamente.</p>
      </article>
    </section>
  `;
}

function renderProdutos() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <section class="crud-card">
      <h2>Cadastro de Produtos</h2>
      <p class="crud-subtitle">Adicione e gerencie seus produtos sem sair da página.</p>

      <div class="form-grid">
        <div class="campo">
          <label for="nomeProduto">Nome do Produto</label>
          <input id="nomeProduto" type="text" placeholder="Ex: Notebook" />
        </div>
        <div class="campo">
          <label for="precoProduto">Preço (R$)</label>
          <input id="precoProduto" type="number" step="0.01" min="0" placeholder="Ex: 2999.90" />
        </div>
      </div>

      <button id="btnAdicionarSalvar" class="btn-principal">Salvar produto</button>

      <div class="lista-header">
        <h3>Produtos cadastrados</h3>
        <span id="totalPrecos">Total: R$ 0,00</span>
      </div>

      <div id="listaProdutos" class="lista-produtos"></div>
    </section>
  `;

  document.getElementById('btnAdicionarSalvar').addEventListener('click', adicionarProduto);
  renderizarLista();
}

function salvarNoLocalStorage() {
  localStorage.setItem('produtos', JSON.stringify(produtos));
}

function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function limparInputs() {
  const nomeInput = document.getElementById('nomeProduto');
  const precoInput = document.getElementById('precoProduto');

  nomeInput.value = '';
  precoInput.value = '';
  nomeInput.focus();
}

function adicionarProduto() {
  const nomeInput = document.getElementById('nomeProduto');
  const precoInput = document.getElementById('precoProduto');

  const nome = nomeInput.value.trim();
  const preco = Number(precoInput.value);

  if (!nome || Number.isNaN(preco) || preco < 0) {
    alert('Informe nome e preço válidos.');
    return;
  }

  const produto = { nome, preco };

  if (editandoIndex !== null) {
    produtos[editandoIndex] = produto;
    editandoIndex = null;
    document.getElementById('btnAdicionarSalvar').textContent = 'Salvar produto';
  } else {
    produtos.push(produto);
  }

  salvarNoLocalStorage();
  limparInputs();
  renderizarLista();
}

function renderizarLista() {
  const listaProdutos = document.getElementById('listaProdutos');
  const totalPrecos = document.getElementById('totalPrecos');

  if (!listaProdutos) return;

  if (produtos.length === 0) {
    listaProdutos.innerHTML = '<div class="lista-vazia">Nenhum produto cadastrado</div>';
    totalPrecos.textContent = 'Total: R$ 0,00';
    return;
  }

  listaProdutos.innerHTML = produtos
    .map(
      (produto, index) => `
        <div class="item-produto">
          <div class="info-produto">
            <strong>${produto.nome}</strong>
            <p>${formatarPreco(produto.preco)}</p>
          </div>
          <div class="acoes">
            <button class="btn-editar" onclick="editar(${index})">Editar</button>
            <button class="btn-remover" onclick="remover(${index})">Excluir</button>
          </div>
        </div>
      `
    )
    .join('');

  const total = produtos.reduce((soma, produto) => soma + produto.preco, 0);
  totalPrecos.textContent = `Total: ${formatarPreco(total)}`;
}

function editar(index) {
  const produto = produtos[index];
  if (!produto) return;

  const nomeInput = document.getElementById('nomeProduto');
  const precoInput = document.getElementById('precoProduto');
  const botao = document.getElementById('btnAdicionarSalvar');

  nomeInput.value = produto.nome;
  precoInput.value = produto.preco;
  editandoIndex = index;
  botao.textContent = 'Salvar edição';
  nomeInput.focus();
}

function remover(index) {
  produtos.splice(index, 1);

  if (editandoIndex === index) {
    editandoIndex = null;
    document.getElementById('btnAdicionarSalvar').textContent = 'Salvar produto';
    limparInputs();
  }

  salvarNoLocalStorage();
  renderizarLista();
}

renderHome();
atualizarMenuAtivo();

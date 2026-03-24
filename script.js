let produtos = carregarProdutos();
let editandoId = null;
let paginaAtual = 'home';
let filtroBusca = '';
let ordenacaoPreco = 'padrao';
let temaEscuro = carregarTema();

function carregarProdutos() {
  return JSON.parse(localStorage.getItem('produtos')) || [];
}

function salvarProdutos() {
  localStorage.setItem('produtos', JSON.stringify(produtos));
}

function carregarTema() {
  return localStorage.getItem('tema') !== 'claro';
}

function salvarTema() {
  localStorage.setItem('tema', temaEscuro ? 'escuro' : 'claro');
}

function aplicarTema() {
  document.body.classList.toggle('tema-claro', !temaEscuro);
  const toggle = document.getElementById('btnTema');
  if (toggle) {
    toggle.textContent = temaEscuro ? '🌙 Dark' : '☀️ Light';
  }
}

function alternarTema() {
  temaEscuro = !temaEscuro;
  salvarTema();
  aplicarTema();
}

function irPara(pagina) {
  paginaAtual = pagina;
  if (pagina === 'produtos') {
    renderProdutos();
  } else {
    renderHome();
  }
  atualizarMenuAtivo();
  aplicarTema();
}

function atualizarMenuAtivo() {
  const botoes = document.querySelectorAll('.menu-link');
  botoes.forEach((botao) => botao.classList.remove('ativo'));

  const homeBtn = document.querySelector('[data-pagina="home"]');
  const produtosBtn = document.querySelector('[data-pagina="produtos"]');

  if (paginaAtual === 'home' && homeBtn) homeBtn.classList.add('ativo');
  if (paginaAtual === 'produtos' && produtosBtn) produtosBtn.classList.add('ativo');
}

function renderHome() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="hero-card">
      <h2>Sistema de Produtos</h2>
      <p>Gerencie produtos com busca, ordenação, edição e persistência local em uma SPA profissional.</p>
      <button class="btn-principal" onclick="irPara('produtos')">Ir para Produtos</button>
    </section>

    <section class="features">
      <article class="feature-item"><span>🔎</span><h4>Busca em tempo real</h4><p>Filtre produtos instantaneamente.</p></article>
      <article class="feature-item"><span>↕️</span><h4>Ordenação por preço</h4><p>Visualize do menor para maior e vice-versa.</p></article>
      <article class="feature-item"><span>🧠</span><h4>CRUD inteligente</h4><p>Edição por ID único e feedback visual.</p></article>
      <article class="feature-item"><span>🎨</span><h4>Dark mode</h4><p>Alterne tema escuro/claro com um clique.</p></article>
    </section>
  `;
}

function renderProdutos() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <section class="crud-card">
      <h2>Cadastro de Produtos</h2>
      <p class="crud-subtitle">Cadastre, busque e organize seus produtos sem recarregar a página.</p>

      <form id="formProduto" class="form-produto">
        <div class="form-grid">
          <div class="campo">
            <label for="nomeProduto">Nome do Produto</label>
            <input id="nomeProduto" type="text" placeholder="Ex: Notebook" />
          </div>
          <div class="campo">
            <label for="precoProduto">Preço (R$)</label>
            <input id="precoProduto" type="number" step="0.01" min="0.01" placeholder="Ex: 2999.90" />
          </div>
        </div>

        <button id="btnAdicionarSalvar" class="btn-principal" type="submit">Salvar produto</button>
      </form>

      <div id="mensagem" class="mensagem"></div>

      <div class="filtros">
        <input id="buscaProduto" type="text" placeholder="Buscar por nome..." value="${filtroBusca}" />
        <select id="ordenacaoPreco">
          <option value="padrao">Ordenar por preço</option>
          <option value="crescente" ${ordenacaoPreco === 'crescente' ? 'selected' : ''}>Menor preço</option>
          <option value="decrescente" ${ordenacaoPreco === 'decrescente' ? 'selected' : ''}>Maior preço</option>
        </select>
      </div>

      <div class="lista-header">
        <h3>Produtos cadastrados</h3>
        <span id="totalPrecos">Total: R$ 0,00</span>
      </div>

      <div id="listaProdutos" class="lista-produtos"></div>
    </section>
  `;

  registrarEventosProdutos();
  renderizarLista();
  atualizarBotao();
}

function registrarEventosProdutos() {
  document.getElementById('formProduto').addEventListener('submit', (event) => {
    event.preventDefault();
    adicionarProduto();
  });

  document.getElementById('buscaProduto').addEventListener('input', (event) => {
    filtroBusca = event.target.value.toLowerCase().trim();
    renderizarLista();
  });

  document.getElementById('ordenacaoPreco').addEventListener('change', (event) => {
    ordenacaoPreco = event.target.value;
    renderizarLista();
  });
}

function gerarIdUnico() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function validarFormulario(nome, preco) {
  if (!nome) return 'Nome é obrigatório.';
  if (Number.isNaN(preco) || preco <= 0) return 'Preço deve ser maior que zero.';
  return '';
}

function mostrarMensagem(texto, tipo = 'sucesso') {
  const mensagem = document.getElementById('mensagem');
  if (!mensagem) return;

  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo} visivel`;

  setTimeout(() => {
    mensagem.classList.remove('visivel');
  }, 2200);
}

function atualizarBotao() {
  const botao = document.getElementById('btnAdicionarSalvar');
  if (!botao) return;

  botao.textContent = editandoId ? 'Salvar edição' : 'Salvar produto';
  botao.classList.toggle('editando', Boolean(editandoId));
}

function limparInputs() {
  const nomeInput = document.getElementById('nomeProduto');
  const precoInput = document.getElementById('precoProduto');
  if (!nomeInput || !precoInput) return;

  nomeInput.value = '';
  precoInput.value = '';
  nomeInput.focus();
}

function adicionarProduto() {
  const nomeInput = document.getElementById('nomeProduto');
  const precoInput = document.getElementById('precoProduto');

  const nome = nomeInput.value.trim();
  const preco = Number(precoInput.value);
  const erro = validarFormulario(nome, preco);

  if (erro) {
    mostrarMensagem(erro, 'erro');
    return;
  }

  if (editandoId) {
    produtos = produtos.map((produto) =>
      produto.id === editandoId ? { ...produto, nome, preco } : produto
    );
    editandoId = null;
    mostrarMensagem('Produto atualizado com sucesso!', 'sucesso');
  } else {
    produtos.push({ id: gerarIdUnico(), nome, preco });
    mostrarMensagem('Produto adicionado com sucesso!', 'sucesso');
  }

  salvarProdutos();
  limparInputs();
  atualizarBotao();
  renderizarLista();
}

function obterProdutosVisiveis() {
  let lista = [...produtos];

  if (filtroBusca) {
    lista = lista.filter((produto) => produto.nome.toLowerCase().includes(filtroBusca));
  }

  if (ordenacaoPreco === 'crescente') {
    lista.sort((a, b) => a.preco - b.preco);
  }

  if (ordenacaoPreco === 'decrescente') {
    lista.sort((a, b) => b.preco - a.preco);
  }

  return lista;
}

function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderizarLista() {
  const listaProdutos = document.getElementById('listaProdutos');
  const totalPrecos = document.getElementById('totalPrecos');
  if (!listaProdutos || !totalPrecos) return;

  const visiveis = obterProdutosVisiveis();
  const total = visiveis.reduce((soma, produto) => soma + produto.preco, 0);
  totalPrecos.textContent = `Total: ${formatarPreco(total)}`;

  if (visiveis.length === 0) {
    listaProdutos.innerHTML = '<div class="lista-vazia">Nenhum produto encontrado.</div>';
    return;
  }

  listaProdutos.innerHTML = visiveis
    .map(
      (produto) => `
        <div class="item-produto">
          <div class="info-produto">
            <strong>${produto.nome}</strong>
            <p>${formatarPreco(produto.preco)}</p>
          </div>
          <div class="acoes">
            <button class="btn-editar" onclick="editar(${produto.id})">Editar</button>
            <button class="btn-remover" onclick="remover(${produto.id})">Excluir</button>
          </div>
        </div>
      `
    )
    .join('');
}

function editar(id) {
  const produto = produtos.find((item) => item.id === id);
  if (!produto) return;

  const nomeInput = document.getElementById('nomeProduto');
  const precoInput = document.getElementById('precoProduto');

  nomeInput.value = produto.nome;
  precoInput.value = produto.preco;
  editandoId = id;
  atualizarBotao();
  mostrarMensagem('Modo edição ativado.', 'info');
  nomeInput.focus();
}

function remover(id) {
  produtos = produtos.filter((produto) => produto.id !== id);

  if (editandoId === id) {
    editandoId = null;
    limparInputs();
    atualizarBotao();
  }

  salvarProdutos();
  renderizarLista();
  mostrarMensagem('Produto removido.', 'sucesso');
}

renderHome();
atualizarMenuAtivo();
aplicarTema();

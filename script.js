let produtos = carregarLocalStorage();
let paginaAtual = 'home';
let editandoId = null;
let termoBusca = '';
let ordemPreco = 'crescente';
let isSaving = false;
let temaEscuro = localStorage.getItem('tema') !== 'claro';

function carregarLocalStorage() {
  return JSON.parse(localStorage.getItem('produtos')) || [];
}

function salvarLocalStorage() {
  localStorage.setItem('produtos', JSON.stringify(produtos));
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function totalPrecos(lista = produtos) {
  return lista.reduce((soma, item) => soma + item.preco, 0);
}

function alternarTema() {
  temaEscuro = !temaEscuro;
  localStorage.setItem('tema', temaEscuro ? 'escuro' : 'claro');
  aplicarTema();
}

function aplicarTema() {
  document.body.classList.toggle('tema-claro', !temaEscuro);
  const btnTema = document.getElementById('btnTema');
  if (btnTema) btnTema.textContent = temaEscuro ? '🌙 Dark' : '☀️ Light';
}

function atualizarMenuAtivo() {
  document.querySelectorAll('.menu-link[data-pagina]').forEach((botao) => {
    botao.classList.toggle('ativo', botao.dataset.pagina === paginaAtual);
  });
}

function animarTrocaTela(callback) {
  const app = document.getElementById('app');
  app.classList.add('animando-saida');

  setTimeout(() => {
    callback();
    app.classList.remove('animando-saida');
    app.classList.add('animando-entrada');
    setTimeout(() => app.classList.remove('animando-entrada'), 280);
  }, 180);
}

function irPara(pagina) {
  paginaAtual = pagina;
  const renderer = pagina === 'produtos' ? renderProdutos : renderHome;
  animarTrocaTela(renderer);
  atualizarMenuAtivo();
}

function renderHome() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <section class="painel hero">
      <h2>Dashboard de Produtos</h2>
      <p>Uma SPA moderna para cadastrar, editar, excluir, buscar e organizar produtos com armazenamento local.</p>
      <button class="btn" onclick="irPara('produtos')">Ir para Produtos</button>

      <div class="dashboard-cards">
        <article class="card">
          <small>Total de produtos</small>
          <strong>${produtos.length}</strong>
        </article>
        <article class="card">
          <small>Soma total dos preços</small>
          <strong>${formatarMoeda(totalPrecos(produtos))}</strong>
        </article>
      </div>
    </section>
  `;
}

function renderProdutos() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <section class="painel">
      <h2>Cadastro de Produtos</h2>
      <p class="sub">Gerencie seu catálogo com experiência premium.</p>

      <div class="toolbar">
        <input id="busca" type="text" placeholder="Buscar produto..." value="${termoBusca}" />
        <button id="btnOrdenar" class="menu-link" type="button">Ordenar: ${ordemPreco === 'crescente' ? 'Crescente' : 'Decrescente'}</button>
      </div>

      <form id="formProduto" class="form-grid">
        <input id="nomeProduto" type="text" placeholder="Nome do produto" />
        <input id="precoProduto" type="number" min="0.01" step="0.01" placeholder="Preço" />
        <button id="btnSalvar" class="btn" type="submit">${editandoId ? 'Salvar edição' : 'Salvar produto'}</button>
      </form>

      <div class="lista-topo">
        <span id="contadorItens">Total de itens: 0</span>
        <span id="totalValor">Total: R$ 0,00</span>
      </div>

      <div id="lista" class="lista"></div>
    </section>
  `;

  registrarEventosProdutos();
  renderLista();
}

function registrarEventosProdutos() {
  const form = document.getElementById('formProduto');
  const busca = document.getElementById('busca');
  const btnOrdenar = document.getElementById('btnOrdenar');

  form.addEventListener('submit', adicionarProduto);

  busca.addEventListener('input', (event) => {
    termoBusca = event.target.value.trim().toLowerCase();
    renderLista();
  });

  btnOrdenar.addEventListener('click', () => {
    ordemPreco = ordemPreco === 'crescente' ? 'decrescente' : 'crescente';
    btnOrdenar.textContent = `Ordenar: ${ordemPreco === 'crescente' ? 'Crescente' : 'Decrescente'}`;
    renderLista();
  });
}

function produtosFiltrados() {
  const filtrados = produtos.filter((produto) => produto.nome.toLowerCase().includes(termoBusca));
  return filtrados.sort((a, b) => ordemPreco === 'crescente' ? a.preco - b.preco : b.preco - a.preco);
}

function validar(nome, preco) {
  if (!nome) return 'Nome obrigatório.';
  if (Number.isNaN(preco) || preco <= 0) return 'Preço deve ser maior que 0.';
  return '';
}

function toast(mensagem, tipo = 'info') {
  const container = document.getElementById('toastContainer');
  const item = document.createElement('div');
  item.className = `toast ${tipo}`;
  item.textContent = mensagem;
  container.appendChild(item);

  setTimeout(() => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(12px)';
    setTimeout(() => item.remove(), 220);
  }, 3000);
}

function setBotaoLoading(ativo) {
  const btn = document.getElementById('btnSalvar');
  if (!btn) return;

  btn.disabled = ativo;
  btn.textContent = ativo ? 'Salvando...' : (editandoId ? 'Salvar edição' : 'Salvar produto');
  btn.classList.toggle('editando', Boolean(editandoId));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function adicionarProduto(event) {
  event.preventDefault();
  if (isSaving) return;

  const nomeInput = document.getElementById('nomeProduto');
  const precoInput = document.getElementById('precoProduto');
  const nome = nomeInput.value.trim();
  const preco = Number(precoInput.value);
  const erro = validar(nome, preco);

  if (erro) {
    toast(erro, 'erro');
    return;
  }

  isSaving = true;
  setBotaoLoading(true);
  await delay(500);

  if (editandoId) {
    produtos = produtos.map((produto) => produto.id === editandoId ? { ...produto, nome, preco } : produto);
    toast('Produto atualizado', 'sucesso');
    editandoId = null;
  } else {
    produtos.push({ id: Date.now(), nome, preco });
    toast('Produto adicionado', 'sucesso');
  }

  salvarLocalStorage();
  nomeInput.value = '';
  precoInput.value = '';
  nomeInput.focus();

  isSaving = false;
  setBotaoLoading(false);
  renderLista();
}

function renderLista() {
  const lista = document.getElementById('lista');
  const contador = document.getElementById('contadorItens');
  const total = document.getElementById('totalValor');
  if (!lista || !contador || !total) return;

  const itens = produtosFiltrados();
  contador.textContent = `Total de itens: ${itens.length}`;
  total.textContent = `Total: ${formatarMoeda(totalPrecos(itens))}`;

  if (itens.length === 0) {
    lista.innerHTML = '<div class="vazio">Nenhum produto cadastrado</div>';
    return;
  }

  lista.innerHTML = itens
    .map((produto) => `
      <article class="item" data-id="${produto.id}">
        <div>
          <strong>${produto.nome}</strong>
          <p>${formatarMoeda(produto.preco)}</p>
        </div>
        <div class="actions">
          <button class="btn-icon" onclick="editar(${produto.id})">✏️ Editar</button>
          <button class="btn-icon btn-danger" onclick="remover(${produto.id})">🗑️ Excluir</button>
        </div>
      </article>
    `)
    .join('');

  setBotaoLoading(false);
}

function editar(id) {
  const produto = produtos.find((item) => item.id === id);
  if (!produto) return;

  document.getElementById('nomeProduto').value = produto.nome;
  document.getElementById('precoProduto').value = produto.preco;
  editandoId = id;
  setBotaoLoading(false);
  toast('Modo edição ativado', 'info');
}

function remover(id) {
  if (!confirm('Deseja realmente excluir este produto?')) return;

  const card = document.querySelector(`.item[data-id="${id}"]`);
  if (card) card.classList.add('removendo');

  setTimeout(() => {
    produtos = produtos.filter((produto) => produto.id !== id);
    if (editandoId === id) editandoId = null;
    salvarLocalStorage();
    renderLista();
    toast('Produto removido', 'sucesso');
  }, 220);
}

renderHome();
atualizarMenuAtivo();
aplicarTema();

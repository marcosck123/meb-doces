let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let editandoIndex = null;

const nomeInput = document.getElementById('nomeProduto');
const precoInput = document.getElementById('precoProduto');
const btnAdicionarSalvar = document.getElementById('btnAdicionarSalvar');
const listaProdutos = document.getElementById('listaProdutos');
const totalPrecos = document.getElementById('totalPrecos');
const btnAcessarCadastro = document.getElementById('btnAcessarCadastro');

if (btnAcessarCadastro) {
  btnAcessarCadastro.addEventListener('click', () => {
    window.location.href = '/produtos';
  });
}

if (btnAdicionarSalvar) {
  btnAdicionarSalvar.addEventListener('click', adicionarProduto);
  renderizar();
}

function salvarNoLocalStorage() {
  localStorage.setItem('produtos', JSON.stringify(produtos));
}

function limparInputs() {
  nomeInput.value = '';
  precoInput.value = '';
  nomeInput.focus();
}

function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function adicionarProduto() {
  const nome = nomeInput.value.trim();
  const preco = Number(precoInput.value);

  if (!nome || Number.isNaN(preco) || preco < 0) {
    alert('Informe um nome e um preço válido.');
    return;
  }

  const produto = { nome, preco };

  if (editandoIndex !== null) {
    produtos[editandoIndex] = produto;
    editandoIndex = null;
    btnAdicionarSalvar.textContent = 'Adicionar';
  } else {
    produtos.push(produto);
  }

  salvarNoLocalStorage();
  limparInputs();
  renderizar();
}

function renderizar() {
  if (!listaProdutos) return;

  if (produtos.length === 0) {
    listaProdutos.innerHTML = '<div class="lista-vazia">Nenhum produto cadastrado</div>';
    if (totalPrecos) totalPrecos.textContent = 'Total: R$ 0,00';
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
  if (totalPrecos) totalPrecos.textContent = `Total: ${formatarPreco(total)}`;
}

function editar(index) {
  const produto = produtos[index];
  if (!produto) return;

  nomeInput.value = produto.nome;
  precoInput.value = produto.preco;
  editandoIndex = index;
  btnAdicionarSalvar.textContent = 'Salvar';
  nomeInput.focus();
}

function remover(index) {
  produtos.splice(index, 1);

  if (editandoIndex === index) {
    editandoIndex = null;
    btnAdicionarSalvar.textContent = 'Adicionar';
    limparInputs();
  }

  salvarNoLocalStorage();
  renderizar();
}

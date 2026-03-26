import { obterCarteira, obterCartaoInfo, atualizarCartaoInfo } from "./carteira.js";
import { escapeHtml, formatarDataHora, formatarMoeda } from "./utils.js";
import { carregarLocalStorage, salvarLocalStorage } from "./storage.js";

const THEME_KEY = "crud_tema";
let modalAtual = null;
let walletPopupAberto = false;

function garantirModalRoot() {
  let root = document.querySelector("#modal-root");

  if (!root) {
    root = document.createElement("div");
    root.id = "modal-root";
    document.body.appendChild(root);
  }

  return root;
}

function fecharModalPorEsc(event) {
  if (event.key === "Escape") {
    fecharModal();
  }
}

export function renderNoApp(html) {
  const app = document.querySelector("#app");

  if (app) {
    app.innerHTML = html;
  }
}

export function atualizarBotaoAtivo(pagina) {
  document.querySelectorAll("[data-route]").forEach((botao) => {
    botao.classList.toggle("active", botao.dataset.route === pagina);
  });
}

export function obterTemaAtual() {
  return carregarLocalStorage(THEME_KEY, "dark");
}

export function aplicarTema(tema) {
  document.body.classList.toggle("theme-light", tema === "light");

  const botaoTema = document.querySelector("#theme-toggle");

  if (botaoTema) {
    botaoTema.textContent = tema === "light" ? "Dark mode" : "Light mode";
  }
}

export function alternarTema() {
  const proximoTema = obterTemaAtual() === "light" ? "dark" : "light";
  salvarLocalStorage(THEME_KEY, proximoTema);
  aplicarTema(proximoTema);
}

export function setButtonLoading(botao, carregando, textoPadrao, textoLoading) {
  if (!botao) {
    return;
  }

  botao.disabled = carregando;
  botao.classList.toggle("loading", carregando);
  botao.textContent = carregando ? textoLoading : textoPadrao;
}

export function abrirModal({ titulo, descricao = "", conteudo, largura = "560px", onOpen } = {}) {
  fecharModal();

  const root = garantirModalRoot();

  root.innerHTML = `
    <div class="modal-backdrop" data-modal-backdrop>
      <section class="modal-dialog" style="--modal-width: ${largura};" role="dialog" aria-modal="true" aria-label="${escapeHtml(titulo || "Modal")}">
        <header class="modal-header">
          <div>
            <h2 class="section-title">${escapeHtml(titulo || "Modal")}</h2>
            ${descricao ? `<p class="panel-subtitle">${escapeHtml(descricao)}</p>` : ""}
          </div>
          <button class="icon-button" type="button" data-modal-close aria-label="Fechar modal">×</button>
        </header>
        <div class="modal-body">${conteudo || ""}</div>
      </section>
    </div>
  `;

  modalAtual = root.querySelector(".modal-backdrop");
  modalAtual?.addEventListener("click", (event) => {
    if (event.target.matches("[data-modal-backdrop]")) {
      fecharModal();
    }
  });

  root.querySelector("[data-modal-close]")?.addEventListener("click", () => fecharModal());
  document.addEventListener("keydown", fecharModalPorEsc);
  onOpen?.(root);
}

export function fecharModal() {
  const root = document.querySelector("#modal-root");

  if (root) {
    root.innerHTML = "";
  }

  modalAtual = null;
  document.removeEventListener("keydown", fecharModalPorEsc);
}

export function limparErrosFormulario(form) {
  form?.querySelectorAll(".field-group.has-error").forEach((campo) => {
    campo.classList.remove("has-error");
  });

  form?.querySelectorAll("[aria-invalid='true']").forEach((input) => {
    input.removeAttribute("aria-invalid");
  });

  form?.querySelectorAll("[data-error-for]").forEach((erro) => {
    erro.textContent = "";
  });
}

export function aplicarErrosFormulario(form, erros = {}) {
  Object.entries(erros).forEach(([campo, mensagem]) => {
    const grupo = form?.querySelector(`[data-field="${campo}"]`);
    const erro = form?.querySelector(`[data-error-for="${campo}"]`);
    const input = grupo?.querySelector("input, select, textarea");

    grupo?.classList.add("has-error");
    input?.setAttribute("aria-invalid", "true");

    if (erro) {
      erro.textContent = mensagem;
    }
  });
}

function renderCarteiraPopup() {
  const carteira = obterCarteira();
  const info = obterCartaoInfo();
  const transacoes = carteira.transacoes.slice(0, 8);

  return `
    <div class="wallet-backdrop" data-wallet-close>
      <aside class="wallet-popup" aria-label="Carteira">
        <div class="wallet-popup-header">
          <div>
            <h2 class="section-title">Carteira</h2>
            <p class="panel-subtitle">Banco e caixa centralizados em um cartao interativo.</p>
          </div>
          <button class="icon-button" type="button" data-wallet-dismiss aria-label="Fechar carteira">×</button>
        </div>

        <div class="wallet-card-scene ${walletPopupAberto ? "" : ""}">
          <div class="wallet-card" id="wallet-card">
            <div class="wallet-face wallet-face-front">
              <div class="wallet-brand-row">
                <div>
                  <p class="wallet-mini-label">Negocio</p>
                  <h3>${escapeHtml(info.nomeNegocio || "Minha Empresa")}</h3>
                </div>
                <div class="wallet-chip" aria-hidden="true"></div>
              </div>

              <div class="wallet-balance-wrap">
                <span class="wallet-mini-label">Saldo total</span>
                <button class="wallet-total-button" type="button" id="wallet-balance-trigger">
                  ${formatarMoeda(carteira.saldoTotal)}
                </button>
                <div class="wallet-balance-tooltip" id="wallet-balance-tooltip">
                  <span>🏦 Banco: ${formatarMoeda(carteira.banco)}</span>
                  <span>💵 Caixa: ${formatarMoeda(carteira.caixa)}</span>
                </div>
              </div>

              <div class="wallet-card-actions">
                <button class="button button-primary" type="button" data-wallet-action="entrada">+ Registrar Entrada</button>
                <button class="button button-secondary" type="button" data-wallet-action="saida">- Registrar Saida</button>
              </div>

              <button class="wallet-flip-button" type="button" data-wallet-flip="back">Virar cartao</button>
            </div>

            <div class="wallet-face wallet-face-back">
              <div class="wallet-back-fields">
                <div class="editable-row"><span class="wallet-mini-label">Nome do negocio</span><span class="editable-value" data-editable="nomeNegocio">${escapeHtml(info.nomeNegocio)}</span></div>
                <div class="editable-row"><span class="wallet-mini-label">Responsavel</span><span class="editable-value" data-editable="responsavel">${escapeHtml(info.responsavel)}</span></div>
                <div class="editable-row"><span class="wallet-mini-label">CNPJ ou CPF</span><span class="editable-value" data-editable="documento">${escapeHtml(info.documento || "Clique para editar")}</span></div>
                <div class="editable-row"><span class="wallet-mini-label">Telefone</span><span class="editable-value" data-editable="telefone">${escapeHtml(info.telefone || "Clique para editar")}</span></div>
                <div class="editable-row"><span class="wallet-mini-label">Observacoes</span><span class="editable-value" data-editable="observacoes">${escapeHtml(info.observacoes || "Clique para editar")}</span></div>
              </div>
              <button class="wallet-flip-button" type="button" data-wallet-flip="front">Voltar</button>
            </div>
          </div>
        </div>

        <section class="wallet-transactions">
          <div class="section-header">
            <h3 class="section-title">Ultimas transacoes</h3>
            <span class="total-badge">${transacoes.length} registro(s)</span>
          </div>
          <div class="wallet-transaction-list">
            ${transacoes.length
              ? transacoes.map((transacao) => `
                  <article class="wallet-transaction-item">
                    <div>
                      <strong>${escapeHtml(transacao.categoria)}</strong>
                      <p>${escapeHtml(transacao.descricao || "Sem descricao")}</p>
                    </div>
                    <div class="wallet-transaction-side">
                      <strong class="${transacao.tipo === "saida" ? "text-danger" : "text-accent"}">${transacao.tipo === "saida" ? "-" : "+"}${formatarMoeda(transacao.valor)}</strong>
                      <span>${escapeHtml(transacao.bolso)} · ${escapeHtml(formatarDataHora(transacao.data))}</span>
                    </div>
                  </article>
                `).join("")
              : '<div class="empty-state"><p>Nenhuma transacao registrada.</p></div>'}
          </div>
        </section>
      </aside>
    </div>
  `;
}

function abrirEditorInline(elemento) {
  const campo = elemento.dataset.editable;
  const valorAtual = elemento.textContent === "Clique para editar" ? "" : elemento.textContent;
  const input = document.createElement("input");

  input.type = "text";
  input.value = valorAtual;
  input.className = "inline-edit-input";
  elemento.replaceWith(input);
  input.focus();
  input.select();

  const salvar = () => {
    atualizarCartaoInfo(campo, input.value);
    atualizarCarteiraPopupSeAberto();
  };

  input.addEventListener("blur", salvar, { once: true });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      input.blur();
    }
  });
}

function renderModalCarteira(tipo) {
  const configuracao = tipo === "saida"
    ? {
        titulo: "Registrar Saida",
        submit: "Registrar Saida",
        categoriaLabel: "Motivo da saida",
        categoriaName: "categoria",
        categorias: [
          "Emergencia",
          "Compra de Insumo/Ingrediente",
          "Despesa Operacional",
          "Retirada dos Proprietarios",
          "Outro",
        ],
        bolsoLabel: "Origem",
      }
    : {
        titulo: "Registrar Entrada",
        submit: "Registrar Entrada",
        categoriaLabel: "Tipo de entrada",
        categoriaName: "categoria",
        categorias: [
          "Venda de Produto",
          "Entrada de Dinheiro em Caixa (papel)",
          "Investimento pelos Proprietarios",
          "Outro",
        ],
        bolsoLabel: "Destino",
      };

  return `
    <form id="wallet-form" class="form-fields" novalidate data-wallet-form-type="${tipo}">
      <div class="field-group" data-field="categoria">
        <label for="wallet-category">${configuracao.categoriaLabel}</label>
        <select id="wallet-category" name="categoria">
          <option value="">Selecione</option>
          ${configuracao.categorias.map((categoria) => `<option value="${escapeHtml(categoria)}">${escapeHtml(categoria)}</option>`).join("")}
        </select>
        <p class="field-error" data-error-for="categoria"></p>
      </div>

      <div class="field-group hidden" data-field="categoriaOutro">
        <label for="wallet-category-other">Descreva o motivo</label>
        <input id="wallet-category-other" name="categoriaOutro" type="text" />
        <p class="field-error" data-error-for="categoriaOutro"></p>
      </div>

      <div class="field-group" data-field="valor">
        <label for="wallet-value">Valor (R$)</label>
        <input id="wallet-value" name="valor" type="text" inputmode="decimal" placeholder="Ex: 150,00" />
        <p class="field-error" data-error-for="valor"></p>
      </div>

      <div class="field-group" data-field="bolso">
        <label for="wallet-pocket">${configuracao.bolsoLabel}</label>
        <select id="wallet-pocket" name="bolso">
          <option value="">Selecione</option>
          <option value="banco">Banco</option>
          <option value="caixa">Caixa</option>
        </select>
        <p class="field-error" data-error-for="bolso"></p>
      </div>

      <div class="field-group" data-field="descricao">
        <label for="wallet-description">Descricao/Observacao</label>
        <textarea id="wallet-description" name="descricao" rows="3" placeholder="Opcional"></textarea>
        <p class="field-error" data-error-for="descricao"></p>
      </div>

      <div class="form-actions">
        <button class="button button-primary" type="submit">${configuracao.submit}</button>
      </div>
    </form>
  `;
}

export function abrirModalCarteira(tipo, onSubmit) {
  abrirModal({
    titulo: tipo === "saida" ? "Registrar Saida Manual" : "Registrar Entrada Manual",
    descricao: "Os valores sao aplicados imediatamente ao bolso selecionado.",
    conteudo: renderModalCarteira(tipo),
    onOpen(root) {
      const form = root.querySelector("#wallet-form");
      const selectCategoria = root.querySelector("#wallet-category");
      const campoOutro = root.querySelector('[data-field="categoriaOutro"]');

      selectCategoria?.addEventListener("change", () => {
        const mostrarOutro = selectCategoria.value === "Outro";
        campoOutro?.classList.toggle("hidden", !mostrarOutro);
      });

      form?.addEventListener("submit", (event) => {
        onSubmit(event, form);
      });
    },
  });
}

export function abrirCarteiraPopup() {
  const root = garantirModalRoot();
  walletPopupAberto = true;
  document.removeEventListener("keydown", onWalletEsc);
  root.innerHTML = renderCarteiraPopup();

  root.querySelector("[data-wallet-dismiss]")?.addEventListener("click", fecharCarteiraPopup);
  root.querySelector("[data-wallet-close]")?.addEventListener("click", (event) => {
    if (event.target.matches("[data-wallet-close]")) {
      fecharCarteiraPopup();
    }
  });

  root.querySelectorAll("[data-wallet-flip]").forEach((botao) => {
    botao.addEventListener("click", () => {
      root.querySelector("#wallet-card")?.classList.toggle("is-flipped", botao.dataset.walletFlip === "back");
      if (botao.dataset.walletFlip === "front") {
        root.querySelector("#wallet-card")?.classList.remove("is-flipped");
      }
    });
  });

  root.querySelectorAll("[data-editable]").forEach((elemento) => {
    elemento.addEventListener("click", () => abrirEditorInline(elemento));
  });

  document.addEventListener("keydown", onWalletEsc);
}

function onWalletEsc(event) {
  if (event.key === "Escape") {
    fecharCarteiraPopup();
  }
}

export function fecharCarteiraPopup() {
  const root = document.querySelector("#modal-root");

  if (walletPopupAberto && root?.querySelector(".wallet-backdrop")) {
    root.innerHTML = "";
  }

  walletPopupAberto = false;
  document.removeEventListener("keydown", onWalletEsc);
}

export function atualizarCarteiraPopupSeAberto() {
  if (walletPopupAberto) {
    abrirCarteiraPopup();
  }
}

export function inicializarCarteiraUI({ onEntrada, onSaida }) {
  document.querySelector("#wallet-trigger")?.addEventListener("click", () => abrirCarteiraPopup());

  document.addEventListener("click", (event) => {
    const botao = event.target.closest("[data-wallet-action]");

    if (!botao) {
      return;
    }

    if (botao.dataset.walletAction === "entrada") {
      onEntrada?.();
      return;
    }

    if (botao.dataset.walletAction === "saida") {
      onSaida?.();
    }
  });
}

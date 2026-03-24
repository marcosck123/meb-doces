import { bindProdutosEvents, renderProdutos } from "../pages/produtos.js";
import { renderHome } from "../pages/home.js";
import { renderNoApp, atualizarBotaoAtivo } from "./ui.js";

const rotas = {
  home: {
    render: renderHome,
    afterRender() {
      document.querySelectorAll("[data-go-products]").forEach((botao) => {
        botao.addEventListener("click", () => irPara("produtos"));
      });
    },
  },
  produtos: {
    render: renderProdutos,
    afterRender: bindProdutosEvents,
  },
};

export function irPara(pagina) {
  const rotaExiste = Object.prototype.hasOwnProperty.call(rotas, pagina);
  const rota = rotaExiste ? pagina : "home";

  if (window.location.hash !== `#/${rota}`) {
    window.location.hash = `#/${rota}`;
    return;
  }

  renderizarRota(rota);
}

function obterPaginaAtual() {
  const hash = window.location.hash.replace("#/", "");
  return rotas[hash] ? hash : "home";
}

export function renderizarRota(pagina = obterPaginaAtual()) {
  const rota = rotas[pagina] ?? rotas.home;
  renderNoApp(rota.render());
  atualizarBotaoAtivo(pagina);
  rota.afterRender?.();
}

export function iniciarRotas() {
  window.addEventListener("hashchange", () => {
    renderizarRota(obterPaginaAtual());
  });

  document.querySelectorAll("[data-route]").forEach((botao) => {
    botao.addEventListener("click", () => {
      irPara(botao.dataset.route);
    });
  });
}

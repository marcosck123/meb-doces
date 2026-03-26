import { bindProdutosEvents, renderProdutos } from "../src/pages/produtos.js";
import { renderHome } from "../src/pages/home.js";
import { bindPlataformasEvents, renderPlataformas } from "../src/pages/plataformas.js";
import { bindMercadosEvents, renderMercados } from "../src/pages/mercados.js";
import { bindVendasEvents, renderVendas } from "../src/pages/vendas.js";
import { renderNoApp, atualizarBotaoAtivo } from "./ui.js";

const rotas = {
  home: {
    render: renderHome,
    afterRender() {
      document.querySelectorAll("[data-go-products]").forEach((botao) => {
        botao.addEventListener("click", () => irPara("produtos"));
      });
      document.querySelectorAll("[data-go-sales]").forEach((botao) => {
        botao.addEventListener("click", () => irPara("vendas"));
      });
    },
  },
  produtos: {
    render: renderProdutos,
    afterRender: bindProdutosEvents,
  },
  plataformas: {
    render: renderPlataformas,
    afterRender: bindPlataformasEvents,
  },
  mercados: {
    render: renderMercados,
    afterRender: bindMercadosEvents,
  },
  vendas: {
    render: renderVendas,
    afterRender: bindVendasEvents,
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

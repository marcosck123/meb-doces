import { renderHeader } from "../components/header.js";
import { renderHome } from "../pages/home.js";
import { iniciarRotas, renderizarRota } from "./routes.js";
import { alternarTema, aplicarTema, obterTemaAtual, renderNoApp } from "./ui.js";

function inicializarLayout() {
  const header = document.querySelector("#header");

  if (header) {
    header.innerHTML = renderHeader();
  }
}

function inicializarTema() {
  aplicarTema(obterTemaAtual());

  document.querySelector("#theme-toggle")?.addEventListener("click", () => {
    alternarTema();
  });
}

function inicializarAplicacao() {
  inicializarLayout();
  inicializarTema();
  iniciarRotas();
  renderNoApp(renderHome());
  renderizarRota();
}

inicializarAplicacao();

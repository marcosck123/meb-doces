import { renderHeader } from "../components/header.js";
import { iniciarRotas, renderizarRota } from "./routes.js";
import { alternarTema, aplicarTema, obterTemaAtual } from "./ui.js";

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
  renderizarRota();
}

inicializarAplicacao();

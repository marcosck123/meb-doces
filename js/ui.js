import { carregarLocalStorage, salvarLocalStorage } from "./storage.js";

const THEME_KEY = "crud_tema";

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

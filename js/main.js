import { renderHeader } from "../components/header.js";
import { iniciarRotas, renderizarRota } from "./routes.js";
import {
  alternarTema,
  aplicarTema,
  obterTemaAtual,
  abrirModalCarteira,
  fecharModal,
  inicializarCarteiraUI,
  limparErrosFormulario,
  aplicarErrosFormulario,
  atualizarCarteiraPopupSeAberto,
} from "./ui.js";
import { registrarEntradaCarteira, registrarSaidaCarteira } from "./carteira.js";
import { mostrarToast } from "../components/toast.js";
import { parseNumero } from "./utils.js";

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
  inicializarCarteira();
  iniciarRotas();
  renderizarRota();
}

function inicializarCarteira() {
  inicializarCarteiraUI({
    onEntrada() {
      abrirModalCarteira("entrada", (event, form) => {
        event.preventDefault();
        limparErrosFormulario(form);

        const formData = new FormData(form);
        const dados = Object.fromEntries(formData.entries());
        const categoria = dados.categoria === "Outro" ? dados.categoriaOutro : dados.categoria;
        const valor = parseNumero(dados.valor);

        const erros = {};

        if (!categoria) erros.categoria = "Selecione o tipo de entrada.";
        if (dados.categoria === "Outro" && !dados.categoriaOutro) erros.categoriaOutro = "Descreva a entrada.";
        if (!(valor > 0)) erros.valor = "Informe um valor valido.";
        if (!dados.bolso) erros.bolso = "Selecione Banco ou Caixa.";

        if (Object.keys(erros).length) {
          aplicarErrosFormulario(form, erros);
          return;
        }

        try {
          registrarEntradaCarteira({
            categoria,
            descricao: dados.descricao,
            valor,
            bolso: dados.bolso,
          });
          fecharModal();
          atualizarCarteiraPopupSeAberto();
          mostrarToast("Entrada registrada na carteira.", "success");
        } catch (error) {
          mostrarToast(error.message || "Nao foi possivel registrar a entrada.", "error");
        }
      });
    },
    onSaida() {
      abrirModalCarteira("saida", (event, form) => {
        event.preventDefault();
        limparErrosFormulario(form);

        const formData = new FormData(form);
        const dados = Object.fromEntries(formData.entries());
        const categoria = dados.categoria === "Outro" ? dados.categoriaOutro : dados.categoria;
        const valor = parseNumero(dados.valor);

        const erros = {};

        if (!categoria) erros.categoria = "Selecione o motivo da saida.";
        if (dados.categoria === "Outro" && !dados.categoriaOutro) erros.categoriaOutro = "Descreva a saida.";
        if (!(valor > 0)) erros.valor = "Informe um valor valido.";
        if (!dados.bolso) erros.bolso = "Selecione Banco ou Caixa.";

        if (Object.keys(erros).length) {
          aplicarErrosFormulario(form, erros);
          return;
        }

        try {
          registrarSaidaCarteira({
            categoria,
            descricao: dados.descricao,
            valor,
            bolso: dados.bolso,
          });
          fecharModal();
          atualizarCarteiraPopupSeAberto();
          mostrarToast("Saida registrada na carteira.", "success");
        } catch (error) {
          mostrarToast(error.message || "Nao foi possivel registrar a saida.", "error");
        }
      });
    },
  });
}

inicializarAplicacao();

import { mostrarToast } from "../components/toast.js";
import { adicionarProduto, editarProduto } from "./products.js";
import { produtoSchema, formatarErrosZod } from "./schema.js";
import {
  aplicarErrosFormularioProduto,
  limparErrosFormularioProduto,
  obterDadosFormularioProduto,
  preencherFormularioProduto,
  setButtonLoading,
} from "./ui.js";
import { delay } from "./utils.js";

export function bindProdutoForm({ obterEditandoId, setEditandoId, onSuccess }) {
  const form = document.querySelector("#product-form");
  const submitButton = document.querySelector("#submit-product");

  if (!form || !submitButton) {
    return;
  }

  const limparCampo = (event) => {
    const field = event.target.closest("[data-field]");

    if (!field) {
      return;
    }

    limparErrosFormularioProduto([field.dataset.field]);
  };

  form.addEventListener("input", limparCampo);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    limparErrosFormularioProduto();

    const dados = obterDadosFormularioProduto(form);
    const validacao = produtoSchema.safeParse(dados);

    if (!validacao.success) {
      aplicarErrosFormularioProduto(formatarErrosZod(validacao.error));
      mostrarToast("Revise os campos obrigatorios.", "error");
      return;
    }

    const textoPadrao = obterEditandoId() ? "Salvar edicao" : "Salvar";
    setButtonLoading(submitButton, true, textoPadrao, "Salvando...");

    try {
      await delay();

      const editandoId = obterEditandoId();

      if (editandoId) {
        editarProduto(editandoId, validacao.data);
        mostrarToast("Produto atualizado.", "success");
      } else {
        adicionarProduto(validacao.data);
        mostrarToast("Produto adicionado.", "success");
      }

      form.reset();
      preencherFormularioProduto(null);
      setEditandoId(null);
      onSuccess?.();
    } catch {
      mostrarToast("Nao foi possivel salvar o produto.", "error");
    } finally {
      setButtonLoading(
        submitButton,
        false,
        obterEditandoId() ? "Salvar edicao" : "Salvar",
        "Salvando...",
      );
    }
  });
}

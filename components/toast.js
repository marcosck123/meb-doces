export function mostrarToast(mensagem, tipo = "success") {
  const toastRoot = document.querySelector("#toast-root");

  if (!toastRoot) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensagem;
  toastRoot.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2800);
}

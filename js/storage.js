export function salvarLocalStorage(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

export function carregarLocalStorage(chave, valorPadrao) {
  const valor = localStorage.getItem(chave);

  if (!valor) {
    return valorPadrao;
  }

  try {
    return JSON.parse(valor);
  } catch {
    return valorPadrao;
  }
}

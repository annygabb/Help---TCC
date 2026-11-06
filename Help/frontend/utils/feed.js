export const deduplicarPublicacoes = (publicacoes = []) => {
  const ids = new Set();
  return publicacoes.filter((publicacao) => {
    if (publicacao?.id == null || ids.has(publicacao.id)) return false;
    ids.add(publicacao.id);
    return true;
  });
};

export const deveExibirVagasRecomendadas = (tipoConta = '') =>
  tipoConta.toUpperCase() !== 'EMPRESA';

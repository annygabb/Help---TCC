export const MOTIVOS_DENUNCIA = [
  'Conteúdo impróprio',
  'Assédio ou ameaça',
  'Informação enganosa',
  'Fraude',
  'Spam',
  'Outro'
];

export const LIMITE_DESCRICAO_DENUNCIA = 2000;

// Código curto para a pessoa identificar a denúncia (8 primeiros caracteres do UUID).
export function protocoloDaDenuncia(id) {
  const limpo = String(id || '').replace(/[^0-9a-f]/gi, '');
  return limpo ? `#${limpo.slice(0, 8).toUpperCase()}` : '';
}

function textoDoServidor(dados) {
  if (!dados) return '';
  if (typeof dados === 'string') return dados.trim();
  if (Array.isArray(dados)) return textoDoServidor(dados[0]);
  return String(dados.error || dados.mensagem || dados.message || '').trim();
}

// Traduz a falha do POST /denuncias em uma mensagem para a pessoa
// e informa se faz sentido tentar de novo sem mudar nada.
export function mensagemErroDenuncia(erro) {
  if (erro?.code === 'ERR_CANCELED' || erro?.name === 'CanceledError') {
    return { mensagem: 'A sessão mudou antes do envio terminar. Entre novamente e tente de novo.', podeTentarDeNovo: false };
  }

  const status = erro?.response?.status;
  const doServidor = textoDoServidor(erro?.response?.data);

  if (!status) {
    return { mensagem: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.', podeTentarDeNovo: true };
  }
  if (status === 401) {
    return { mensagem: 'Sua sessão expirou. Entre novamente para enviar a denúncia.', podeTentarDeNovo: false };
  }
  if (status === 403) {
    return { mensagem: doServidor || 'Sua conta não pode enviar denúncias no momento.', podeTentarDeNovo: false };
  }
  if (status === 404) {
    return { mensagem: doServidor || 'Este conteúdo não está mais disponível.', podeTentarDeNovo: false };
  }
  if (status === 409) {
    return { mensagem: doServidor || 'Você já denunciou isto. A denúncia está em análise.', podeTentarDeNovo: false };
  }
  if (status >= 500) {
    return { mensagem: 'O servidor não conseguiu registrar a denúncia agora. Tente novamente em instantes.', podeTentarDeNovo: true };
  }
  return { mensagem: doServidor || 'Confira o motivo e os detalhes da denúncia.', podeTentarDeNovo: false };
}

// Opções do menu "⋯" de uma publicação: a própria publicação e a conta que publicou.
export function alvosDeDenunciaDaPublicacao(post) {
  if (!post?.id) return [];
  const autor = post.autorNome || 'esta conta';
  const alvos = [{
    chave: 'publicacao',
    rotulo: 'Denunciar publicação',
    alvoTipo: 'PUBLICACAO',
    alvoId: post.id,
    alvoNome: `publicação de ${autor}`
  }];
  const tipoAutor = String(post.autorTipo || '').toUpperCase();
  if (post.autorId && (tipoAutor === 'USUARIO' || tipoAutor === 'EMPRESA')) {
    alvos.push({
      chave: 'autor',
      rotulo: `Denunciar ${autor}`,
      alvoTipo: tipoAutor,
      alvoId: post.autorId,
      alvoNome: autor
    });
  }
  return alvos;
}

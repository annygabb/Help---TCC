import { normalizarContato } from './contatos.js';

export function destinoDaNotificacao(notificacao) {
  if (!notificacao || typeof notificacao !== 'object') return null;

  const origem = normalizarContato({
    contaId: notificacao.origemId,
    tipoConta: notificacao.origemTipo,
    nome: notificacao.origemNome,
    fotoUrl: notificacao.origemFotoUrl
  });
  if (!origem) return null;

  if (notificacao.tipo === 'NOVO_SEGUIDOR') {
    return {
      pathname: `/perfil/${origem.tipoConta}/${origem.contaId}`,
      state: undefined
    };
  }

  if (notificacao.tipo === 'NOVA_MENSAGEM') {
    return {
      pathname: '/mensagens',
      state: { iniciarCom: origem }
    };
  }

  return null;
}

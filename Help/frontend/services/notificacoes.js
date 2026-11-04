import { destinoDaNotificacao } from '../utils/notificacoes.js';

export function resolverDestinoDaNotificacao(notificacao) {
  return destinoDaNotificacao(notificacao);
}

export function criarServicoNotificacoes(cliente) {
  if (!cliente?.get || !cliente?.put) throw new TypeError('O cliente HTTP é obrigatório.');
  return {
    async listar() {
      const resposta = await cliente.get('/notificacoes');
      return Array.isArray(resposta.data) ? resposta.data : [];
    },
    async marcarComoLida(notificacaoId) {
      if (!notificacaoId) throw new TypeError('A notificação informada é inválida.');
      await cliente.put(`/notificacoes/${notificacaoId}/marcar-lida`, {});
    },
    async marcarTodasComoLidas() { await cliente.put('/notificacoes/marcar-todas-lidas', {}); },
    async totalNaoLidas() {
      const resposta = await cliente.get('/notificacoes/nao-lidas/total');
      const total = Number(resposta.data?.total);
      return Number.isFinite(total) && total >= 0 ? total : 0;
    }
  };
}

async function servicoPadrao() { const { default: api } = await import('./api'); return criarServicoNotificacoes(api); }
export async function listarNotificacoes() { return (await servicoPadrao()).listar(); }
export async function marcarNotificacaoComoLida(notificacaoId) { return (await servicoPadrao()).marcarComoLida(notificacaoId); }
export async function marcarTodasNotificacoesComoLidas() { return (await servicoPadrao()).marcarTodasComoLidas(); }
export async function totalDeNotificacoesNaoLidas() { return (await servicoPadrao()).totalNaoLidas(); }

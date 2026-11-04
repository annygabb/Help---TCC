import { normalizarContato } from '../utils/contatos.js';

function contaObrigatoria(conta) {
  const contaNormalizada = normalizarContato(conta);
  if (!contaNormalizada) throw new TypeError('A conta informada é inválida.');
  return contaNormalizada;
}

function contagemNormalizada(contagem) {
  return {
    seguidores: Number.isFinite(Number(contagem?.seguidores)) ? Number(contagem.seguidores) : 0,
    seguindo: Number.isFinite(Number(contagem?.seguindo)) ? Number(contagem.seguindo) : 0
  };
}

export function criarServicoSeguidores(cliente) {
  if (!cliente?.get || !cliente?.post || !cliente?.delete) throw new TypeError('O cliente HTTP é obrigatório.');
  return {
    async seguir(conta) { const { tipoConta, contaId } = contaObrigatoria(conta); await cliente.post(`/seguidores/seguir/${tipoConta}/${contaId}`, {}); },
    async deixarDeSeguir(conta) { const { tipoConta, contaId } = contaObrigatoria(conta); await cliente.delete(`/seguidores/deixar-de-seguir/${tipoConta}/${contaId}`); },
    async consultarStatus(conta) { const { tipoConta, contaId } = contaObrigatoria(conta); const resposta = await cliente.get(`/seguidores/status/${tipoConta}/${contaId}`); return resposta.data?.seguindo === true; },
    async consultarContagem(conta) { const { tipoConta, contaId } = contaObrigatoria(conta); const resposta = await cliente.get(`/seguidores/contagem/${tipoConta}/${contaId}`); return contagemNormalizada(resposta.data); }
  };
}

async function servicoPadrao() { const { default: api } = await import('./api'); return criarServicoSeguidores(api); }
export async function seguir(conta) { return (await servicoPadrao()).seguir(conta); }
export async function deixarDeSeguir(conta) { return (await servicoPadrao()).deixarDeSeguir(conta); }
export async function consultarStatus(conta) { return (await servicoPadrao()).consultarStatus(conta); }
export async function consultarContagem(conta) { return (await servicoPadrao()).consultarContagem(conta); }

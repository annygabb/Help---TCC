import { normalizarContato } from '../utils/contatos.js';

const TIPOS_DE_CONTA = new Set(['USUARIO', 'EMPRESA']);

export function normalizarTipoConta(tipoConta) {
  const tipoNormalizado = String(tipoConta || '').trim().toUpperCase();
  return TIPOS_DE_CONTA.has(tipoNormalizado) ? tipoNormalizado : null;
}

export function chaveDaConta(contato) {
  const contatoNormalizado = normalizarContato(contato);
  return contatoNormalizado ? `${contatoNormalizado.tipoConta}:${contatoNormalizado.contaId}` : null;
}

function contatoObrigatorio(contato) {
  const contatoNormalizado = normalizarContato(contato);
  if (!contatoNormalizado) throw new TypeError('A conta informada é inválida.');
  return contatoNormalizado;
}

export function criarServicoComunicacao(cliente) {
  if (!cliente?.get) throw new TypeError('O cliente HTTP é obrigatório.');

  return {
    async listarContatos({ busca, tipoConta, signal } = {}) {
      const tipo = tipoConta ? normalizarTipoConta(tipoConta) : null;
      if (tipoConta && !tipo) throw new TypeError('O tipo da conta é inválido.');
      const params = {};
      if (busca?.trim()) params.busca = busca.trim();
      if (tipo) params.tipo = tipo;
      const resposta = await cliente.get('/comunicacao/contatos', { params, signal });
      return (resposta.data || []).map(normalizarContato).filter(Boolean);
    },
    async obterContato(contato, { signal } = {}) {
      const { tipoConta, contaId } = contatoObrigatorio(contato);
      const resposta = await cliente.get(`/comunicacao/contatos/${tipoConta}/${contaId}`, { signal });
      return contatoObrigatorio(resposta.data);
    },
    async abrirConversaTipada(contato, { signal } = {}) {
      const { tipoConta, contaId } = contatoObrigatorio(contato);
      const resposta = await cliente.get(`/mensagens/conversa/${tipoConta}/${contaId}`, { signal });
      return resposta.data || [];
    },
    async listarConversas({ signal } = {}) {
      const resposta = await cliente.get('/mensagens/conversas', { signal });
      return (resposta.data || []).map(normalizarContato).filter(Boolean);
    },
    async enviarMensagem(contato, conteudo) {
      const { tipoConta, contaId } = contatoObrigatorio(contato);
      const texto = String(conteudo || '').trim();
      if (!texto) throw new TypeError('A mensagem não pode estar vazia.');
      if (!cliente.post) throw new TypeError('O cliente HTTP não permite enviar mensagens.');
      const resposta = await cliente.post('/mensagens/enviar', {
        destinatarioId: contaId,
        tipoDestinatario: tipoConta,
        conteudo: texto
      });
      return resposta.data;
    }
  };
}

async function servicoPadrao() {
  const { default: api } = await import('./api');
  return criarServicoComunicacao(api);
}

export async function listarContatos(opcoes) { return (await servicoPadrao()).listarContatos(opcoes); }
export async function obterContato(contato, opcoes) { return (await servicoPadrao()).obterContato(contato, opcoes); }
export async function abrirConversaTipada(contato, opcoes) { return (await servicoPadrao()).abrirConversaTipada(contato, opcoes); }
export async function listarConversas(opcoes) { return (await servicoPadrao()).listarConversas(opcoes); }
export async function enviarMensagem(contato, conteudo) { return (await servicoPadrao()).enviarMensagem(contato, conteudo); }

import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServicoNotificacoes, resolverDestinoDaNotificacao } from './notificacoes.js';

const ID = '9bf85752-c34e-4e07-96d2-fb6e6a717f6c';

test('lista notificações e normaliza um retorno inválido como lista vazia', async () => {
  const servico = criarServicoNotificacoes({ get: async () => ({ data: {} }), put: async () => {} });
  assert.deepEqual(await servico.listar(), []);
});

test('marca notificações e consulta o total não lido', async () => {
  const chamadas = [];
  const servico = criarServicoNotificacoes({ get: async () => ({ data: { total: '4' } }), put: async (...args) => chamadas.push(args) });
  await servico.marcarComoLida('notificacao-1'); await servico.marcarTodasComoLidas();
  assert.equal(await servico.totalNaoLidas(), 4);
  assert.deepEqual(chamadas, [['/notificacoes/notificacao-1/marcar-lida', {}], ['/notificacoes/marcar-todas-lidas', {}]]);
});

test('resolve a navegação de uma notificação de nova mensagem', () => {
  const destino = resolverDestinoDaNotificacao({ tipo: 'NOVA_MENSAGEM', origemId: ID, origemTipo: 'USUARIO', origemNome: 'Breno' });
  assert.equal(destino.pathname, '/mensagens');
  assert.equal(destino.state.iniciarCom.contaId, ID);
  assert.equal(destino.state.iniciarCom.tipoConta, 'USUARIO');
  assert.equal(destino.state.iniciarCom.nome, 'Breno');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { chaveDaConta, criarServicoComunicacao, normalizarTipoConta } from './comunicacao.js';

const ID = '9bf85752-c34e-4e07-96d2-fb6e6a717f6c';

test('normaliza o tipo e cria uma chave composta para a conta', () => {
  assert.equal(normalizarTipoConta(' empresa '), 'EMPRESA');
  assert.equal(normalizarTipoConta('ADMIN'), null);
  assert.equal(chaveDaConta({ id: ID, tipoConta: 'USUARIO' }), `USUARIO:${ID}`);
});

test('lista contatos com filtros válidos e normaliza a resposta', async () => {
  let requisicao;
  const servico = criarServicoComunicacao({ get: async (...args) => {
    requisicao = args;
    return { data: [{ id: ID, tipoConta: 'empresa', nome: 'HELP' }] };
  } });
  const contatos = await servico.listarContatos({ busca: ' Help ', tipoConta: 'empresa' });
  assert.deepEqual(requisicao, ['/comunicacao/contatos', { params: { busca: 'Help', tipo: 'EMPRESA' }, signal: undefined }]);
  assert.deepEqual(contatos, [{ id: ID, tipoConta: 'EMPRESA', nome: 'HELP', contaId: ID }]);
});

test('abre somente conversas de uma conta tipada válida', async () => {
  const servico = criarServicoComunicacao({ get: async () => ({ data: [{ id: 'mensagem-1' }] }) });
  assert.deepEqual(await servico.abrirConversaTipada({ contaId: ID, tipoConta: 'USUARIO' }), [{ id: 'mensagem-1' }]);
  await assert.rejects(() => servico.abrirConversaTipada({ contaId: 'invalido', tipoConta: 'USUARIO' }), /inválida/);
});

test('envia mensagem somente com texto e destino válidos', async () => {
  const chamadas = [];
  const servico = criarServicoComunicacao({
    get: async () => ({ data: [] }),
    post: async (...args) => { chamadas.push(args); return { data: { id: 'mensagem-1' } }; }
  });

  assert.deepEqual(await servico.enviarMensagem({ contaId: ID, tipoConta: 'EMPRESA' }, ' Olá! '), { id: 'mensagem-1' });
  assert.deepEqual(chamadas, [['/mensagens/enviar', {
    destinatarioId: ID, tipoDestinatario: 'EMPRESA', conteudo: 'Olá!'
  }]]);
  await assert.rejects(() => servico.enviarMensagem({ contaId: ID, tipoConta: 'EMPRESA' }, '  '), /vazia/);
});

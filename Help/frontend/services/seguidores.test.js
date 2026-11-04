import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServicoSeguidores } from './seguidores.js';

const ID = '9bf85752-c34e-4e07-96d2-fb6e6a717f6c';
const conta = { contaId: ID, tipoConta: 'EMPRESA' };

test('segue e deixa de seguir usando a identidade tipada', async () => {
  const chamadas = [];
  const servico = criarServicoSeguidores({ get: async () => ({ data: {} }), post: async (...args) => chamadas.push(['post', ...args]), delete: async (...args) => chamadas.push(['delete', ...args]) });
  await servico.seguir(conta); await servico.deixarDeSeguir(conta);
  assert.deepEqual(chamadas, [['post', `/seguidores/seguir/EMPRESA/${ID}`, {}], ['delete', `/seguidores/deixar-de-seguir/EMPRESA/${ID}`]]);
});

test('consulta status e normaliza contagens recebidas', async () => {
  const urls = [];
  const servico = criarServicoSeguidores({ get: async (url) => { urls.push(url); return url.includes('/status/') ? { data: { seguindo: true } } : { data: { seguidores: '12', seguindo: null } }; }, post: async () => {}, delete: async () => {} });
  assert.equal(await servico.consultarStatus(conta), true);
  assert.deepEqual(await servico.consultarContagem(conta), { seguidores: 12, seguindo: 0 });
  assert.deepEqual(urls, [`/seguidores/status/EMPRESA/${ID}`, `/seguidores/contagem/EMPRESA/${ID}`]);
});

test('recusa uma conta sem UUID antes da chamada HTTP', async () => {
  const servico = criarServicoSeguidores({ get: async () => {}, post: async () => {}, delete: async () => {} });
  await assert.rejects(() => servico.seguir({ contaId: 'invalido', tipoConta: 'USUARIO' }), /inválida/);
});

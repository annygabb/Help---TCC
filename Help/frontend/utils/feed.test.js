import test from 'node:test';
import assert from 'node:assert/strict';
import { deduplicarPublicacoes, deveExibirVagasRecomendadas } from './feed.js';

test('publicações repetidas com o mesmo id aparecem apenas uma vez', () => {
  assert.deepEqual(deduplicarPublicacoes([
    { id: 'p1', conteudo: 'Olá' },
    { id: 'p1', conteudo: 'Olá' },
    { id: 'p2', conteudo: 'Outra' }
  ]).map((post) => post.id), ['p1', 'p2']);
});

test('empresa não recebe vagas recomendadas para candidatura', () => {
  assert.equal(deveExibirVagasRecomendadas('EMPRESA'), false);
  assert.equal(deveExibirVagasRecomendadas('CANDIDATO'), true);
  assert.equal(deveExibirVagasRecomendadas('USUARIO'), true);
});

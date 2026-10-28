import test from 'node:test';
import assert from 'node:assert/strict';
import { estabelecerSessao, obterSessao } from './session.js';

function storage() {
  const dados = new Map();
  return {
    getItem: (chave) => dados.has(chave) ? dados.get(chave) : null,
    setItem: (chave, valor) => dados.set(chave, String(valor)),
    removeItem: (chave) => dados.delete(chave),
    clear: () => dados.clear()
  };
}

test.beforeEach(() => {
  globalThis.localStorage = storage();
  globalThis.sessionStorage = storage();
});

test('uma aba antiga não adota silenciosamente a conta autenticada em outra aba', () => {
  sessionStorage.setItem('helpTabSessionId', 'sessao-antiga');
  localStorage.setItem('token', 'token-novo');
  localStorage.setItem('usuarioLogado', JSON.stringify({ id: 'u2', sessaoId: 'sessao-nova' }));

  assert.equal(obterSessao(), null);
});

test('a aba que fez o login reconhece somente a própria sessão', () => {
  estabelecerSessao('token-novo', { id: 'u2' });

  assert.equal(sessionStorage.getItem('helpTabSessionId'), JSON.parse(localStorage.getItem('usuarioLogado')).sessaoId);
  assert.equal(obterSessao().conta.id, 'u2');
});

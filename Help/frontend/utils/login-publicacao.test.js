import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const login = readFileSync(new URL('../pages/Login.jsx', import.meta.url), 'utf8');
const loginEmpresa = readFileSync(new URL('../pages/LoginEmpresa.jsx', import.meta.url), 'utf8');
const criarPublicacao = readFileSync(new URL('../pages/CriarPublicacao.jsx', import.meta.url), 'utf8');
const feed = readFileSync(new URL('../pages/Feed.jsx', import.meta.url), 'utf8');

test('as telas de login não entram automaticamente usando uma sessão anterior', () => {
  assert.doesNotMatch(login, /obterSessao\(\)/);
  assert.doesNotMatch(loginEmpresa, /obterSessao\(\)/);
});

test('a criação de publicação permite escolher todos ou somente seguidores', () => {
  assert.match(criarPublicacao, /Publicação visível para todos/);
  assert.match(criarPublicacao, /Publicação visível somente para seguidores/);
  assert.match(feed, /visibilidade/);
});

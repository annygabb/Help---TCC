import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const lerPagina = (nome) =>
  readFile(new URL(`../pages/${nome}`, import.meta.url), 'utf8');

test('feed nao contem identidade pessoal fixa', async () => {
  const feed = await lerPagina('Feed.jsx');

  assert.doesNotMatch(feed, /Anny Gabrielly/);
  assert.doesNotMatch(feed, /NTT DATA/);
  assert.match(feed, /\/perfis\/me/);
});

test('configuracao carrega e salva o perfil autenticado', async () => {
  const configuracao = await lerPagina('ConfigPerfil.jsx');

  assert.match(configuracao, /api\.get\('\/perfis\/me'/);
  assert.match(configuracao, /api\.put\('\/perfis\/me'/);
  assert.doesNotMatch(configuracao, /api\/usuarios\/\$\{userData\.id\}/);
});

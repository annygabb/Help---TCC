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

test('cursos usa o perfil autenticado sem identidade pessoal fixa', async () => {
  const cursos = await lerPagina('Cursos.jsx');

  assert.match(cursos, /useCurrentProfile/);
  assert.doesNotMatch(cursos, /localStorage\.getItem\('user'\)/);
  assert.doesNotMatch(cursos, /Anny Gabrielly/);
  assert.doesNotMatch(cursos, /Systems Analyst na NTT DATA/);
  assert.doesNotMatch(cursos, /Anápolis, Goiás/);
});

test('vagas usa o perfil autenticado sem identidade pessoal fixa', async () => {
  const vagas = await lerPagina('Vagas.jsx');

  assert.match(vagas, /useCurrentProfile/);
  assert.doesNotMatch(vagas, /Anny Gabrielly/);
  assert.doesNotMatch(vagas, /Analista de Sistemas \| Engenharia de Software/);
  assert.doesNotMatch(vagas, /Silvânia, Goiás/);
});

test('configuracao carrega e salva o perfil autenticado', async () => {
  const configuracao = await lerPagina('ConfigPerfil.jsx');

  assert.match(configuracao, /api\.get\('\/perfis\/me'/);
  assert.match(configuracao, /api\.put\('\/perfis\/me'/);
  assert.doesNotMatch(configuracao, /api\/usuarios\/\$\{userData\.id\}/);
});

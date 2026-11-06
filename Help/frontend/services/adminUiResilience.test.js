import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const lerAdmin = (nome) => readFile(new URL(`../pages/admin/${nome}`, import.meta.url), 'utf8');

test('campos livres do painel administrativo possuem limites seguros', async () => {
  const [mensagens, denuncias, avisos] = await Promise.all([
    lerAdmin('AdminMensagens.jsx'),
    lerAdmin('AdminDenuncias.jsx'),
    lerAdmin('AdminAvisos.jsx'),
  ]);

  assert.match(mensagens, /aria-label="Resposta oficial"[\s\S]*maxLength="1000"/);
  assert.match(denuncias, /Justificativa[\s\S]*maxLength="1000"/);
  assert.doesNotMatch(avisos, /contaAlvo/);
  assert.match(avisos, /titulo[\s\S]*maxLength="90"/);
  assert.match(avisos, /mensagem[\s\S]*maxLength="500"/);
});

test('conteúdos sem espaço não estouram previews, chats e notificações', async () => {
  const css = await lerAdmin('Admin.css');

  assert.match(css, /\.adm-preview-cartao strong[\s\S]*overflow-wrap: anywhere/);
  assert.match(css, /\.adm-chat-bolha,[\s\S]*overflow-wrap: anywhere/);
  assert.match(css, /\.adm-notificacao-topo strong,[\s\S]*overflow-wrap: anywhere/);
});

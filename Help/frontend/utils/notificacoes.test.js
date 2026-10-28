import test from 'node:test';
import assert from 'node:assert/strict';
import { destinoDaNotificacao } from './notificacoes.js';

const USUARIO_ID = '123e4567-e89b-42d3-a456-426614174000';
const EMPRESA_ID = '223e4567-e89b-42d3-a456-426614174000';

test('notificacao de novo seguidor abre o perfil do usuario de origem', () => {
  const destino = destinoDaNotificacao({
    tipo: 'NOVO_SEGUIDOR',
    origemId: USUARIO_ID,
    origemTipo: 'usuario',
    origemNome: 'Vitor Hugo'
  });

  assert.deepEqual(destino, {
    pathname: `/perfil/USUARIO/${USUARIO_ID}`,
    state: undefined
  });
});

test('notificacao de novo seguidor abre o perfil da empresa de origem', () => {
  const destino = destinoDaNotificacao({
    tipo: 'NOVO_SEGUIDOR',
    origemId: EMPRESA_ID,
    origemTipo: 'EMPRESA',
    origemNome: 'Help Tecnologia'
  });

  assert.equal(destino.pathname, `/perfil/EMPRESA/${EMPRESA_ID}`);
});

test('notificacao sem identificador valido nao cria rota quebrada', () => {
  assert.equal(destinoDaNotificacao({ tipo: 'NOVO_SEGUIDOR', origemId: 'undefined' }), null);
});

test('notificacao de mensagem abre a conversa com a conta normalizada', () => {
  const destino = destinoDaNotificacao({
    tipo: 'NOVA_MENSAGEM',
    origemId: USUARIO_ID,
    origemTipo: 'USUARIO',
    origemNome: 'Usuario'
  });

  assert.equal(destino.pathname, '/mensagens');
  assert.equal(destino.state.iniciarCom.contaId, USUARIO_ID);
  assert.equal(destino.state.iniciarCom.tipoConta, 'USUARIO');
});

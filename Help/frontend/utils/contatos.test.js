import test from 'node:test';
import assert from 'node:assert/strict';
import { contaIdValido, normalizarContato } from './contatos.js';

const ID = '9bf85752-c34e-4e07-96d2-fb6e6a717f6c';

test('recusa identificadores ausentes ou literais inválidos', () => {
  assert.equal(contaIdValido(undefined), false);
  assert.equal(contaIdValido('undefined'), false);
  assert.equal(normalizarContato({ nome: 'Sem id' }), null);
});

test('normaliza o formato atual de usuário', () => {
  assert.deepEqual(normalizarContato({ contaId: ID, tipoConta: 'usuario', nome: 'Anny' }), {
    contaId: ID,
    tipoConta: 'USUARIO',
    nome: 'Anny'
  });
});

test('aceita identificadores legados de empresa', () => {
  const contato = normalizarContato({ empresaId: ID, corporateName: 'HELP Tecnologia' });
  assert.equal(contato.contaId, ID);
  assert.equal(contato.tipoConta, 'EMPRESA');
  assert.equal(contato.nome, 'HELP Tecnologia');
});

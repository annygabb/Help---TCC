import test from 'node:test';
import assert from 'node:assert/strict';
import { nomeCurto } from './nomeCurto.js';
test('abrevia o nome no cartão e conserva nomes compostos', () => {
  assert.equal(nomeCurto('Ana Clara Rodrigues'), 'Ana Clara');
  assert.equal(nomeCurto('  João  Pedro  da Silva '), 'João Pedro');
  assert.equal(nomeCurto('João da Silva'), 'João Silva');
  assert.equal(nomeCurto('Maria-Luiza Costa'), 'Maria-Luiza Costa');
  assert.equal(nomeCurto('Ana'), 'Ana');
  assert.equal(nomeCurto(null), 'Usuário');
});

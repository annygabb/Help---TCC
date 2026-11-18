import test from 'node:test';
import assert from 'node:assert/strict';
import { salarioInicial } from './salario.js';
test('interpreta valores brasileiros e usa o início da faixa salarial', () => {
  assert.equal(salarioInicial('R$ 6.000 - R$ 8.000'), 6000);
  assert.equal(salarioInicial('R$ 6.000,50'), 6000.50);
  assert.equal(salarioInicial('8000'), 8000);
  assert.equal(salarioInicial('A combinar'), 0);
});

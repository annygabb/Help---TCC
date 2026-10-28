import test from 'node:test';
import assert from 'node:assert/strict';
import { apenasDigitos, formatarCPF, validarCPF, mensagemDaApi } from './validacoes.js';

test('CPF digitado recebe máscara e é normalizado', () => {
  assert.equal(formatarCPF('28368986079'), '283.689.860-79');
  assert.equal(apenasDigitos('283.689.860-79'), '28368986079');
  assert.equal(validarCPF('283.689.860-79'), true);
});

test('mensagem de validação não é confundida com duplicidade', () => {
  assert.equal(mensagemDaApi({ response: { data: { mensagem: 'CPF inválido.' } } }, 'erro'), 'CPF inválido.');
});
